# 🎯 Sistem Pelatihan Gerakan Berbasis IoT dan Machine Learning

## 📋 Deskripsi Proyek

### Latar Belakang
Sistem ini dirancang untuk membantu pengguna dalam melatih gerakan dengan feedback real-time melalui analisis sensor dan machine learning. Mengintegrasikan wearable IoT, backend API, machine learning, dan aplikasi web untuk pengalaman pelatihan yang komprehensif.

### Apa yang Dibangun
Platform pelatihan gerakan interaktif yang menggabungkan teknologi IoT (sensor wearable), analisis data real-time, dan model machine learning untuk memberikan skor akurasi gerakan kepada pengguna.

### Untuk Siapa
- **Pengguna Pelatihan**: Individu yang ingin melatih dan memonitor progres gerakan mereka
- **Admin/Instruktur**: Mengelola pengguna, sesi pelatihan, dan memonitor data sistem
- **Peneliti**: Analisis data gerakan dan machine learning

---

## ✨ Fitur Utama

- 👤 **Manajemen Pengguna**
  - Registrasi dan login pengguna
  - Persetujuan akun oleh admin
  - Deaktivasi akun pengguna
  - Manajemen role (admin, user)

- 🏋️ **Manajemen Sesi Latihan**
  - Memulai sesi latihan baru
  - Menghentikan sesi pelatihan
  - Menyelesaikan dan menyimpan hasil pelatihan
  - Pencatatan detail waktu dan durasi latihan

- 📡 **Monitoring Sensor Real-Time**
  - Penerimaan data sensor wearable via MQTT
  - Visualisasi data sensor secara real-time
  - Sinkronisasi data dengan backend

- 🤖 **Analisis Machine Learning**
  - Model LSTM untuk prediksi gerakan
  - Perhitungan skor kemiripan gerakan
  - Klasifikasi akurasi gerakan

- 📊 **Riwayat dan Analitik**
  - Riwayat lengkap setiap sesi latihan
  - Export data pelatihan
  - Dashboard statistik untuk admin
  - Grafik progress pengguna

- 🔌 **Koneksi Perangkat**
  - Pairing wearable device
  - Status koneksi real-time
  - Manajemen multiple devices

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    Web Frontend                         │
│                 (Next.js Application)                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API                            │
│             (Node.js + Express.js)                      │
│          - Authentication & Authorization              │
│          - Business Logic                               │
│          - Data Management                              │
└────────┬──────────────────────────┬──────────────────────┘
         │                          │
         │ REST API                 │ gRPC/REST
         ▼                          ▼
    ┌─────────┐              ┌──────────────────┐
    │ Database│              │  ML Service      │
    │ MySQL   │              │  (Python/LSTM)   │
    │         │              │  Prediction Model│
    └─────────┘              └──────────────────┘
         △                          △
         │                          │
┌────────┴──────────────────────────┴──────────────┐
│           MQTT Broker (Mosquitto)                │
│                                                  │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  IoT Wearable Devices  │
        │   (ESP32 + MPU6050)    │
        │   Motion Sensors       │
        └────────────────────────┘
```

### Alur Komunikasi

1. **Wearable → MQTT Broker**: Sensor mengirim data accelerometer & gyroscope setiap millisecond
2. **MQTT Broker → Backend**: Backend subscribe dan menerima data real-time
3. **Backend → Database**: Penyimpanan data sesi latihan
4. **Backend → ML Service**: Mengirim data untuk prediksi dan scoring
5. **ML Service → Backend**: Mengembalikan skor akurasi gerakan
6. **Backend → Frontend**: Menyajikan data via REST API

---

## 💻 Teknologi yang Digunakan

### IoT & Hardware
- **Microcontroller**: ESP32
- **Sensor**: MPU6050 (Accelerometer + Gyroscope)
- **Protocol**: MQTT (Mosquitto Broker)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **Middleware**: Custom middleware untuk role-based access control

### Frontend
- **Framework**: Next.js 14+
- **Styling**: CSS Modules
- **API Client**: Fetch API
- **UI Components**: Custom React components

### Machine Learning
- **Language**: Python
- **Framework**: TensorFlow/Keras
- **Model**: LSTM (Long Short-Term Memory)
- **Data Processing**: NumPy, Pandas
- **Format Model**: Keras (.h5/.keras)

### Deployment & DevOps
- **Containerization**: Docker (optional)
- **Database**: MySQL 8.0+

---

## 📁 Struktur Folder

```
Semester7/
├── README.md                          # Dokumentasi utama
├── Database-LingTienKung.sql          # Schema database
├── DataDummy-LingTienKung.sql         # Data dummy untuk testing
│
├── backend-self-training/             # Node.js Backend API
│   ├── src/
│   │   ├── app.js                     # Express app initialization
│   │   ├── server.js                  # Server entry point
│   │   ├── config/db.js               # Database configuration
│   │   ├── controllers/               # Business logic
│   │   ├── middleware/                # Custom middleware
│   │   ├── routes/                    # API endpoints
│   │   ├── services/                  # Service layer
│   │   └── utils/                     # Utility functions
│   ├── package.json
│   └── README.md                      # Backend documentation
│
├── ml_server/                         # Python ML Service
│   ├── server.py                      # Python Flask/API server
│   ├── lstm_ltk_model.keras           # Trained LSTM model
│   ├── requirements.txt               # Python dependencies
│   ├── config.json                    # Configuration
│   └── README.md                      # ML documentation
│
├── web-self-training/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/                       # App Router (Next.js 13+)
│   │   ├── components/                # React components
│   │   └── data/                      # Static data/JSON
│   ├── public/                        # Static assets
│   ├── package.json
│   ├── next.config.mjs
│   └── README.md                      # Frontend documentation
│
└── rekasaya-data/                     # IoT Hardware & Firmware
    ├── sketch_apr21a/                 # Arduino sketch for ESP32
    │   └── sketch_apr21a.ino
    ├── Driver ch340 esp/              # USB driver
    ├── mqtt_control_menu.bat          # MQTT control script
    ├── INDEX.html                     # Hardware info
    └── README.md                      # Hardware documentation
```

---

## 🚀 Cara Menjalankan Proyek

### Prasyarat Global
- **Node.js** v16+ (untuk backend & frontend)
- **Python** 3.8+ (untuk ML service)
- **MySQL** 8.0+ (database)
- **MQTT Broker** (Mosquitto)
- **Git**

### 1️⃣ Setup Database

```bash
# Import database schema
mysql -u root -p < Database-LingTienKung.sql

# Import dummy data (optional)
mysql -u root -p < DataDummy-LingTienKung.sql
```

### 2️⃣ Setup Backend (Node.js)

```bash
cd backend-self-training

# Install dependencies
npm install

# Konfigurasi environment variables
# Buat file .env dengan database credentials
echo "DB_HOST=localhost" > .env
echo "DB_USER=root" >> .env
echo "DB_PASSWORD=your_password" >> .env
echo "DB_NAME=your_db_name" >> .env

# Jalankan server
npm start
# atau untuk development mode
npm run dev
```

**Port Default**: `http://localhost:3000`

### 3️⃣ Setup ML Service (Python)

```bash
cd ml_server

# Buat virtual environment
python -m venv venv

# Activate venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Jalankan server
python server.py
```

**Port Default**: `http://localhost:5000`

### 4️⃣ Setup Frontend (Next.js)

```bash
cd web-self-training

# Install dependencies
npm install

# Setup environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# Run development server
npm run dev

# Build untuk production
npm run build
npm start
```

**Default**: `http://localhost:3001`

### 5️⃣ Setup MQTT Broker

```bash
# Install Mosquitto (Windows/Linux/Mac)
# Windows: Download dari mosquitto.org atau gunakan WSL

# Jalankan Mosquitto
mosquitto -c mosquitto.conf
```

---

## 📖 Cara Penggunaan Sistem

### 👤 Untuk User Pelatihan

1. **Daftar & Login**
   - Buka aplikasi web
   - Isi form registrasi dengan data diri
   - Tunggu persetujuan dari admin
   - Login dengan kredensial

2. **Koneksi Perangkat**
   - Nyalakan wearable device (ESP32)
   - Masuk ke halaman "Koneksi Perangkat"
   - Pilih device dari list yang terdeteksi
   - Tunggu status "Connected"

3. **Mulai Latihan**
   - Masuk ke halaman "Halaman Latihan"
   - Pilih jenis gerakan yang ingin dilatih
   - Klik tombol "Mulai Latihan"
   - Eksekusi gerakan dengan wearable device

4. **Hentikan & Selesaikan**
   - Klik "Hentikan Latihan" untuk pause
   - Klik "Selesaikan Latihan" untuk mengakhiri sesi
   - Sistem akan menghitung skor akurasi

5. **Lihat Hasil & Riwayat**
   - Masuk ke halaman "Riwayat Latihan"
   - Lihat skor dan detail setiap sesi
   - Lihat progress grafik over time
   - Export data latihan (CSV/PDF)

### 👨‍💼 Untuk Admin

1. **Dashboard Admin**
   - Monitor statistik sistem
   - Lihat jumlah user, sesi, dan data sensor

2. **Kelola Pengguna**
   - Lihat daftar user yang pending approval
   - Approve atau reject user baru
   - Deaktivasi user yang tidak aktif
   - Manage role dan permission

3. **Kelola Data Pelatihan**
   - Lihat semua sesi latihan dari semua user
   - Analisis data sensor per sesi
   - Monitor kualitas data

4. **Pemantauan Sistem**
   - Status koneksi MQTT Broker
   - Status database
   - Status ML service
   - Log sistem

---

## 🧠 Dataset & Machine Learning

### Jenis Data Sensor
- **Accelerometer (X, Y, Z)**: Perubahan kecepatan linear (gravitasi + gerak)
- **Gyroscope (X, Y, Z)**: Kecepatan sudut putaran
- **Sampling Rate**: 100 Hz (setiap 10ms)
- **Duration**: Per sesi ~30-60 detik

### Metode Pengolahan Data
1. **Data Cleaning**: Normalisasi dan filtering noise
2. **Feature Extraction**: Statistik (mean, std, min, max) dari window sensor
3. **Windowing**: Data dipotong setiap 256 samples (~2.5 detik)
4. **Normalization**: Min-Max scaling ke range [0,1]

### Model Machine Learning
- **Architecture**: LSTM (3 layers)
- **Input**:  features (accel X,Y,Z + gyro X,Y,Z)
- **Output**: Skor akurasi 0-100%
- **Training Data**: Koleksi gerakan dari berbagai user
- **Validation Accuracy**: ~95%

### Output Model
- **Skor Kemiripan**: 0-100% (seberapa mirip dengan gerakan ideal)
- **Confidence**: Tingkat kepercayaan prediksi

---

## 👥 Kontributor

- **Adam Hidayat** – Fullstack Developer
- **Gellent Ardiansyah** – Iot Engineer
- **I Wayan Trisna Ardika** – Machine Learning

---

## 📝 Catatan Tambahan

- ✅ Proyek ini dibuat untuk keperluan akademik (Capstone Semester 7)
- ✅ Tidak digunakan untuk keperluan komersial
- ✅ Dokumentasi per folder tersedia di masing-masing `README.md`
- ✅ Untuk troubleshooting, lihat folder masing-masing service
- ✅ Database schema dapat dilihat di file `Database-LingTienKung.sql`

---

**Last Updated**: Februari 2026  
**License**: Academic Use Only
