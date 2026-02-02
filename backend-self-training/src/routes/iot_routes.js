import express from "express";
import mqtt from "mqtt";
import db from "../config/db.js";
import { sendSessionToML } from "../services/ml_service.js";
import { saveHasilML } from "../services/prediction_save.js";

const router = express.Router();
const MQTT_HOST = "mqtt://172.20.10.3:1883";

let mqttClient;
let sessionBuffer = [];
let lastSessionData = [];
let currentSessionId = null;
let currentUserId = null;
let isCreatingSession = false;

/* ================= ACTIVITY MAP ================= */

const ACTIVITY_MAP = {
  "lipat pinggang": 1,
  "jongkok delapan titik": 2,
  "kocok seluruh badan": 3,
};

function normalizeActivity(text = "") {
  return text
    .toLowerCase()
    .replace(/8/g, "delapan")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getIdGerakan(activityName) {
  const input = normalizeActivity(activityName);

  for (const [key, id] of Object.entries(ACTIVITY_MAP)) {
    if (input.includes(normalizeActivity(key))) return id;
  }

  throw new Error(`Activity tidak dikenal: ${activityName}`);
}

/* ================= USER & SESSION ================= */

function getUsernameFromDeviceId(deviceId) {
  return deviceId.split("_")[0];
}

async function getUserIdByUsername(username) {
  const [rows] = await db.query(
    "SELECT id_pengguna FROM pengguna WHERE username = ?",
    [username],
  );

  if (!rows.length) throw new Error("User tidak ditemukan");
  return rows[0].id_pengguna;
}

async function createSession(deviceId) {
  if (currentSessionId || isCreatingSession) return;

  isCreatingSession = true;
  try {
    const username = getUsernameFromDeviceId(deviceId);
    const userId = await getUserIdByUsername(username);

    const [result] = await db.query(
      `INSERT INTO sesi_latihan (id_pengguna, waktu_mulai, status_sesi)
       VALUES (?, NOW(), 'aktif')`,
      [userId],
    );

    currentSessionId = result.insertId;
    currentUserId = userId;

    console.log(`🟢 Session dibuat | id_sesi=${currentSessionId}`);
  } catch (err) {
    console.error("❌ Gagal membuat sesi:", err.message);
  } finally {
    isCreatingSession = false;
  }
}

async function waitUntilSessionReady(deviceId) {
  if (currentSessionId) return;

  await createSession(deviceId);

  let retry = 0;
  while (!currentSessionId && retry < 10) {
    await new Promise((r) => setTimeout(r, 50));
    retry++;
  }

  if (!currentSessionId) {
    throw new Error("Session tidak berhasil dibuat");
  }
}

async function finishSession() {
  if (!currentSessionId) return null;

  const finishedSessionId = currentSessionId;
  const finishedUserId = currentUserId;

  await db.query(
    `UPDATE sesi_latihan
     SET status_sesi='selesai',
         waktu_selesai=NOW(),
         total_durasi=TIMESTAMPDIFF(SECOND,waktu_mulai,NOW())
     WHERE id_sesi=?`,
    [finishedSessionId],
  );

  lastSessionData = [...sessionBuffer];
  sessionBuffer = [];
  currentSessionId = null;
  currentUserId = null;

  console.log(`🔴 Session selesai | ${finishedSessionId}`);

  const mlResult = await sendSessionToML({
    id_pengguna: finishedUserId,
    id_sesi: finishedSessionId,
    data: lastSessionData.map((d) => ({
      timestamp: d.timestamp,
      device_id: d.device_id,
      ax: d.acc.ax,
      ay: d.acc.ay,
      az: d.acc.az,
      gx: d.gyro.gx,
      gy: d.gyro.gy,
      gz: d.gyro.gz,
      mx: d.mag.mx,
      my: d.mag.my,
      mz: d.mag.mz,
    })),
  });

  if (mlResult?.hasil) {
    await saveHasilML({
      idSesi: mlResult.id_sesi,
      hasilPrediksi: mlResult.hasil,
    });
  }

  return finishedSessionId;
}

/* ================= MQTT ================= */

function initMQTT() {
  mqttClient = mqtt.connect(MQTT_HOST, {
    clientId: "backend-laptop-b",
  });

  mqttClient.on("connect", () => {
    console.log("✅ MQTT Connected");
    mqttClient.subscribe("sensor/data/#");
  });

  mqttClient.on("message", async (_, message) => {
    try {
      const data = JSON.parse(message.toString());

      // 🛑 Pastikan session SUDAH ADA
      await waitUntilSessionReady(data.device_id);

      // 🛡 Validasi session di DB
      const [check] = await db.query(
        "SELECT id_sesi FROM sesi_latihan WHERE id_sesi=? AND status_sesi='aktif'",
        [currentSessionId],
      );

      if (!check.length) {
        console.warn("⛔ Session tidak valid, data diabaikan");
        return;
      }

      const idGerakan = getIdGerakan(data.activity_name);

      await db.query(
        `INSERT INTO data_sensor
         (timestamp, device_id, id_gerakan,
          ax, ay, az, gx, gy, gz, mx, my, mz, id_sesi)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.timestamp,
          data.device_id,
          idGerakan,
          data.ax,
          data.ay,
          data.az,
          data.gx,
          data.gy,
          data.gz,
          data.mx,
          data.my,
          data.mz,
          currentSessionId,
        ],
      );

      sessionBuffer.push({
        device_id: data.device_id,
        activity: data.activity_name,
        timestamp: data.timestamp,
        acc: { ax: data.ax, ay: data.ay, az: data.az },
        gyro: { gx: data.gx, gy: data.gy, gz: data.gz },
        mag: { mx: data.mx, my: data.my, mz: data.mz },
      });
    } catch (err) {
      console.error("[MQTT ERROR]", err.message);
    }
  });
}

initMQTT();

/* ================= EXPORT ================= */

export function getMqttClient() {
  return mqttClient;
}

export async function finishCurrentSession() {
  return await finishSession();
}

/* ================= ROUTES ================= */

router.get("/status", (req, res) => {
  res.json({
    mqtt: mqttClient?.connected || false,
    active_session: currentSessionId,
    buffer_length: sessionBuffer.length,
  });
});

export default router;
