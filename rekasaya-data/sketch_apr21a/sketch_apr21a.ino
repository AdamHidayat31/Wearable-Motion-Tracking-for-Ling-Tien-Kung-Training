#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_ADXL345_U.h>
#include <QMC5883LCompass.h>
#include <I2Cdev.h>
#include <ITG3200.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include <DoubleResetDetector.h>

// -------- Double Reset --------
#define DRD_TIMEOUT 10
#define DRD_ADDRESS 0
DoubleResetDetector drd(DRD_TIMEOUT, DRD_ADDRESS);

// -------- NTP --------
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 7 * 3600, 60 * 1000); // WIB (GMT+7)

// Variabel untuk timestamp milidetik yang akurat (monotonik)
static unsigned long long lastNtpSyncEpochMs = 0; // <-- TAMBAHAN
static unsigned long lastNtpSyncMillis = 0;      // <-- TAMBAHAN

// -------- Sensors --------
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
QMC5883LCompass compass;
ITG3200 gyro;
bool compassInitialized = false;
bool gyroInitialized = false;

// -------- MQTT --------
WiFiClient espClient;
PubSubClient mqttClient(espClient);
bool sendData = false; // dikontrol via HTML tombol ON/OFF

// -------- App Config --------
struct AppConfig {
  String device_id = "KAKI KIRI";
  String activity_name = "KAKI KIRI";
  String mqtt_host = "";
  uint16_t mqtt_port = 1883;
  uint8_t lock_host = 0;
} app;

// -------- Activity Table --------
struct Activity {
  String name;
  unsigned long startTime;
  unsigned long duration;
};
#define MAX_ACTIVITIES 10
Activity activityLog[MAX_ACTIVITIES];
int activityCount = 0;

void logActivity(const String& name, unsigned long duration) {
  if (activityCount < MAX_ACTIVITIES) {
    activityLog[activityCount].name = name;
    activityLog[activityCount].startTime = timeClient.getEpochTime();
    activityLog[activityCount].duration = duration;
    activityCount++;
  }
}

void sendActivityLog() {
  if (activityCount == 0) return;

  StaticJsonDocument<1024> doc;
  JsonArray activities = doc.createNestedArray("activities");
  for (int i = 0; i < activityCount; i++) {
    JsonObject activity = activities.createNestedObject();
    activity["name"] = activityLog[i].name;
    activity["startTime"] = activityLog[i].startTime;
    activity["duration"] = activityLog[i].duration;
  }
  String payload;
  serializeJson(doc, payload);
  if (mqttClient.connected()) {
    mqttClient.publish((String("sensor/activity/") + app.device_id).c_str(), payload.c_str());
    Serial.println("[ACTIVITY PUB] " + payload);
  }
}

// -------- MQTT Topics --------
const char* CONTROL_TOPIC = "sensor/control";
String dataTopic() { return String("sensor/data/") + app.device_id; }

// -------- Storage --------
const char* CONFIG_PATH = "/config.json";

bool loadConfig() {
  File f = LittleFS.open(CONFIG_PATH, "r");
  if (!f) return false;
  StaticJsonDocument<512> doc;
  if (deserializeJson(doc, f)) return false;
  f.close();

  app.device_id = doc["device_id"] | app.device_id;
  app.activity_name = doc["activity_name"] | app.activity_name;
  app.mqtt_host = doc["mqtt_host"] | app.mqtt_host;
  app.mqtt_port = doc["mqtt_port"] | app.mqtt_port;
  app.lock_host = doc["lock_host"] | app.lock_host;
  return true;
}

bool saveConfig() {
  File f = LittleFS.open(CONFIG_PATH, "w");
  if (!f) return false;
  StaticJsonDocument<512> doc;
  doc["device_id"] = app.device_id;
  doc["activity_name"] = app.activity_name;
  doc["mqtt_host"] = app.mqtt_host;
  doc["mqtt_port"] = app.mqtt_port;
  doc["lock_host"] = app.lock_host;
  serializeJson(doc, f);
  f.close();
  return true;
}

// -------- Helper --------
bool tcpOpenable(const String& host, uint16_t port, uint16_t timeoutMs = 2000) {
  WiFiClient test;
  test.setTimeout(timeoutMs);
  bool ok = test.connect(host.c_str(), port);
  if (ok) test.stop();
  return ok;
}

bool hostResolvable(const char* nameOrIp) {
  IPAddress ip;
  if (ip.fromString(nameOrIp)) return true;
  return WiFi.hostByName(nameOrIp, ip, 2000) == 1;
}

// -------- MQTT Auto Discover --------
void autoDiscoverMQTT() {
  if (app.lock_host || app.mqtt_host.length() > 0) return;

  IPAddress staIp = WiFi.localIP();
  String prefix = staIp.toString().substring(0, staIp.toString().lastIndexOf('.') + 1);
  String candidates[] = { prefix + "2", "mqtt.local", prefix + "10" };
  for (auto &c : candidates) {
    Serial.printf("[MQTT] Mengecek %s:1883 ...\n", c.c_str());
    if (tcpOpenable(c, 1883)) {
      app.mqtt_host = c;
      app.mqtt_port = 1883;
      saveConfig();
      Serial.printf("[MQTT] Ditemukan broker: %s\n", c.c_str());
      return;
    }
  }
}

// -------- WiFiManager --------
void startConfigPortal(bool forcePortal) {
  WiFiManager wm;
  WiFiManagerParameter p_dev("device_id", "Device ID", app.device_id.c_str(), 32);
  WiFiManagerParameter p_activity("activity_name", "Activity Name", app.activity_name.c_str(), 32);
  WiFiManagerParameter p_host("mqtt_host", "MQTT Host", app.mqtt_host.c_str(), 64);
  char portBuf[8]; snprintf(portBuf, sizeof(portBuf), "%u", app.mqtt_port);
  WiFiManagerParameter p_port("mqtt_port", "MQTT Port", portBuf, 6);
  wm.addParameter(&p_dev);
  wm.addParameter(&p_activity);
  wm.addParameter(&p_host);
  wm.addParameter(&p_port);
  wm.setConfigPortalTimeout(180);
  wm.setClass("invert");

  bool ok = forcePortal ? wm.startConfigPortal("ESP-MQTT-Setup") : wm.autoConnect("ESP-MQTT-Setup");
  if (!ok) {
    Serial.println("[WIFI] Gagal, reboot...");
    delay(3000);
    ESP.restart();
  }

  app.device_id = p_dev.getValue();
  app.activity_name = p_activity.getValue();
  app.mqtt_host = p_host.getValue();
  app.mqtt_port = atoi(p_port.getValue());
  saveConfig();
}

// -------- MQTT Callback --------
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) message += (char)payload[i];
  message.trim();
  Serial.printf("[MQTT] %s -> %s\n", topic, message.c_str());

  if (String(topic) == CONTROL_TOPIC) {
    if (message.equalsIgnoreCase("ON")) {
      sendData = true;
      Serial.println("▶️ Data sensor DIMULAI");
    } else if (message.equalsIgnoreCase("OFF")) {
      sendData = false;
      Serial.println("⏹️ Data sensor DIHENTIKAN");
    } else {
      Serial.printf("⚠️ Pesan tidak dikenali di %s: %s\n", CONTROL_TOPIC, message.c_str());
    }
  }
}

// -------- MQTT Connection --------
bool ensureMQTT() {
  if (mqttClient.connected()) return true;
  Serial.printf("[MQTT] Menghubungkan ke %s:%u ...\n", app.mqtt_host.c_str(), app.mqtt_port);
  if (mqttClient.connect(app.device_id.c_str())) {
    delay(500);
    mqttClient.subscribe(CONTROL_TOPIC);
    Serial.printf("[MQTT] Terhubung ke broker & subscribe ke topik: %s\n", CONTROL_TOPIC);
    sendData = false;
    return true;
  }
  return false;
}

// -------- Setup --------
void setup() {
  Serial.begin(115200);
  delay(200);
  LittleFS.begin();
  loadConfig();

  drd.detectDoubleReset();
  bool forcePortal = drd.doubleResetDetected;
  startConfigPortal(forcePortal);

  timeClient.begin();
  timeClient.forceUpdate();

  // Inisialisasi waktu dasar untuk timestamp akurat
  lastNtpSyncMillis = millis(); // <-- TAMBAHAN
  lastNtpSyncEpochMs = (unsigned long long)timeClient.getEpochTime() * 1000; // <-- TAMBAHAN
  Serial.println("[NTP] Initial time base set."); // <-- TAMBAHAN

  WiFi.mode(WIFI_STA);
  autoDiscoverMQTT();
  mqttClient.setServer(app.mqtt_host.c_str(), app.mqtt_port);
  mqttClient.setCallback(mqttCallback);

  Wire.begin(4, 5);
  Wire.setClock(100000);

  if (!accel.begin()) Serial.println("[SENSOR] ADXL345 gagal");
  else accel.setRange(ADXL345_RANGE_16_G);

  compass.init(); compassInitialized = true;
  gyro.initialize(); gyroInitialized = gyro.testConnection();

  Serial.println("[SYSTEM] Setup selesai");
}

// -------- Loop --------
void loop() {
  drd.loop();
  mqttClient.loop();
  ensureMQTT();
  timeClient.update();

  static unsigned long lastPub = 0;
  if (sendData && millis() - lastPub > 40) {
    lastPub = millis();

    sensors_event_t ev;
    accel.getEvent(&ev);
    float ax = ev.acceleration.x;
    float ay = ev.acceleration.y;
    float az = ev.acceleration.z;

    compass.read();
    int mx = compass.getX();
    int my = compass.getY();
    int mz = compass.getZ();

    int16_t gx, gy, gz;
    gyro.getRotation(&gx, &gy, &gz);

    // ======== REVISI BLOK TIMESTAMP (MONOTONIC & CSV-SAFE) ========
    
    // Cek jika NTP client baru saja update (interval 60000ms sesuai definisi)
    // Kita resync basis kita untuk mencegah drift jangka panjang
    if (timeClient.isTimeSet() && (millis() - lastNtpSyncMillis >= 60000)) {
      lastNtpSyncMillis = millis();
      lastNtpSyncEpochMs = (unsigned long long)timeClient.getEpochTime() * 1000;
      Serial.println("[NTP] Resyncing time base.");
    }

    // Hitung timestamp milidetik saat ini berdasarkan offset millis()
    unsigned long long currentEpochMs = lastNtpSyncEpochMs + (millis() - lastNtpSyncMillis);
    
    // Konversi ke detik (untuk localtime) dan milidetik
    time_t epochSec = currentEpochMs / 1000;
    unsigned long epochMs = currentEpochMs % 1000;
    
    struct tm *t = localtime(&epochSec);
    char timestamp[40];
    
    // Format: ISO 8601 (YYYY-MM-DDTHH:MM:SS.ms)
    // 'T' digunakan sebagai pengganti spasi agar aman untuk CSV dan standar
    snprintf(timestamp, sizeof(timestamp),
             "%04d-%02d-%02dT%02d:%02d:%02d.%03lu",
             t->tm_year + 1900, t->tm_mon + 1, t->tm_mday,
             t->tm_hour, t->tm_min, t->tm_sec, epochMs);
    // =====================================================================

    StaticJsonDocument<512> doc;
    doc["device_id"] = app.device_id;
    doc["activity_name"] = app.activity_name;
    doc["timestamp"] = timestamp;
    doc["ax"] = ax; doc["ay"] = ay; doc["az"] = az;
    doc["gx"] = gx; doc["gy"] = gy; doc["gz"] = gz;
    doc["mx"] = mx; doc["my"] = my; doc["mz"] = mz;

    String payload;
    serializeJson(doc, payload);

    if (mqttClient.connected()) mqttClient.publish(dataTopic().c_str(), payload.c_str());
    Serial.println("[PUB] " + payload);
  }
}