# Wearable Motion Tracking Berbasis IoT Untuk Latihan Ling Tien Kung

## Deskripsi Proyek

### Latar Belakang
Proyek capstone ini mengembangkan sistem pelatihan **Ling Tien Kung** berbasis **Wearable IoT** untuk memantau dan mengevaluasi gerakan pengguna menggunakan **Machine Learning**.

### Apa yang Dibangun
Platform pelatihan gerakan yang terintegrasi antara **sensor wearable**, **broker IoT**, **backend API**, **ML server**, dan **aplikasi web** untuk menghasilkan skor kemiripan gerakan pengguna dengan gerakan master.

### Untuk Siapa
- **Pengguna**: Melakukan latihan dan melihat hasil serta riwayat latihan  
- **Admin/Instruktur**: Mengelola pengguna dan data latihan  
- **Akademik/Peneliti**: Analisis data gerakan dan performa model ML

---

## ✨ Fitur Utama

- 👤 **Manajemen Pengguna**
  - Registrasi dan login pengguna
  - Persetujuan akun oleh admin
  - Aktivasi dan deaktivasi akun
  - Pengelolaan role (admin & user)

- 🏋️ **Manajemen Latihan**
  - Kontrol latihan (start, stop, finish)
  - Pencatatan waktu dan durasi latihan
  - Penyimpanan hasil latihan otomatis

- 📡 **Integrasi Wearable IoT**
  - Penerimaan data sensor dari wearable melalui broker MQTT
  - Pengiriman data sensor ke backend secara real-time

- 🤖 **Analisis Machine Learning**
  - Perhitungan skor kemiripan gerakan dengan gerakan master
  - Penyajian hasil analisis dalam bentuk skor persentase

- 📊 **Riwayat & Hasil Latihan**
  - Riwayat latihan pengguna
  - Detail hasil setiap sesi latihan
  - Download data latihan oleh admin

- 🛠️ **Manajemen Admin**
  - Melihat seluruh aktivitas latihan pengguna
  - Menghapus data latihan
  - Monitoring sistem pelatihan

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
│          - Authentication & Authorization               |
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
         △                         
         │                          
┌────────┴─────────────────────────────────────────┐
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

### 🔄 Alur Kerja Sistem
1. **Web User (Next.js)** mengirim permintaan ke **Backend Server** untuk memulai, menghentikan, atau menyelesaikan latihan.
2. **Backend Server** memproses permintaan user dan mengirim perintah kontrol ke **IoT Device** melalui **MQTT Broker**.
3. **IoT Device (ESP8266 + GY85)** mengirimkan data sensor gerakan ke **MQTT Broker** selama sesi latihan berlangsung.
4. **Backend Server** melakukan *subscribe* data sensor dari MQTT Broker dan **menyimpan data sementara selama sesi latihan berjalan**.
5. Setelah sesi latihan selesai, **Backend Server** mengirimkan kumpulan data sensor ke **ML Server (Flask)** untuk proses analisis gerakan.
6. **ML Server** mengembalikan **skor kemiripan gerakan** ke Backend.
7. **Backend Server** menyimpan data latihan dan hasil analisis ke **Database MySQL**.
8. **Backend** mengirimkan respon berupa status latihan dan hasil analisis ke **Web User**.

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
- **Styling**: Tailwind
- **API Client**: Fetch API
- **UI Components**: Custom React components

### Machine Learning
- **Language**: Python
- **Framework**: TensorFlow/Keras
- **Model**: LSTM (Long Short-Term Memory)
- **Data Processing**: NumPy, Pandas
- **Format Model**: Keras (.h5/.keras)

### Deployment & DevOps
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
│   └── package.json
│
├── ml_server/                         # Python ML Service
│   ├── server.py                      # Python Flask/API server
│   ├── lstm_ltk_model.keras           # Trained LSTM model
│   ├── requirements.txt               # Python dependencies
│   └── config.json                    # Configuration
│
├── web-self-training/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/                       # App Router (Next.js 13+)
│   │   ├── components/                # React components
│   │   └── data/                      # Static data/JSON
│   ├── public/                        # Static assets
│   ├── package.json
│   └── next.config.mjs
│
└── rekasaya-data/                     # IoT Hardware & Firmware
    ├── sketch_apr21a/                 # Arduino sketch for ESP32
    │   └── sketch_apr21a.ino
    ├── Driver ch340 esp/              # USB driver
    ├── mqtt_control_menu.bat          # MQTT control script
    └── INDEX.html                     # Dashboard Monitoring IoT
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

**Port Default**: `http://localhost:5000`

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

**Port Default**: `http://localhost:5001`

### 4️⃣ Setup Frontend (Next.js)

```bash
cd web-self-training

# Install dependencies
npm install

# Setup environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run development server
npm run dev

# Build untuk production
npm run build
npm start
```

**Default**: `http://localhost:3000`

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
   - Buka pengaturan **WiFi** pada HP atau laptop
   - Pilih jaringan WiFi perangkat (contoh: `ESP_LTK_Device`)
   - Setelah terhubung, pengguna akan diarahkan ke **halaman konfigurasi web**
   - Pada halaman tersebut:
     - Pilih WiFi yang akan digunakan perangkat
     - Masukkan password WiFi
     - Masukkan **Device ID** dengan format `<username_KakiKiri>` atau `<username_TanganKiri>`
     - Masukkan **Activity** (nama gerakan Ling Tien Kung)
     - Masukkan **Port**
   - Simpan konfigurasi dan tunggu perangkat terhubung ke jaringan

3. **Mulai Latihan**
   - Masuk ke halaman "Halaman Latihan"
   - Pilih jenis gerakan yang ingin dilatih
   - Klik tombol "Start"
   - Eksekusi gerakan dengan wearable device

4. **Hentikan & Selesaikan**
   - Klik "Stop" untuk pause
   - Klik "Finish" untuk mengakhiri sesi
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


---

## 🧠 Dataset & Machine Learning

### Jenis Data Sensor
- **Timestamp**: Waktu pengambilan data sensor
- **Accelerometer (X, Y, Z)**: Perubahan kecepatan linear (gravitasi + gerak)
- **Gyroscope (X, Y, Z)**: Kecepatan sudut putaran
- **Sampling Rate**: 100 Hz (setiap 10ms)

### Metode Pengolahan Data
1. **Data Cleaning**: Normalisasi dan filtering noise
2. **Feature Extraction**: Statistik (mean, std, min, max) dari window sensor
3. **Windowing**: Data dipotong setiap 256 samples (~2.5 detik)
4. **Normalization**: Min-Max scaling ke range [0,1]

### 🤖 Model Machine Learning
- **Architecture**: LSTM (2 LSTM layers + Dropout + Dense)
- **Input**: **16 fitur sensor**, terdiri dari  
  - Accelerometer (X, Y, Z) tangan & kaki  
  - Gyroscope (X, Y, Z) tangan & kaki  
  - Magnetometer (X, Y, Z) tangan & kaki  
- **Output**: Klasifikasi gerakan (3 kelas) dengan softmax
- **Training Data**: Data gerakan Ling Tien Kung dari berbagai pengguna
- **Validation Accuracy**: ±95%

### Output Model
- **Skor Kemiripan**: 0-100% (seberapa mirip dengan gerakan ideal)

---

## 👥 Kontributor

- **Adam Hidayat** – Fullstack Developer
- **Gellent Ardiansyah** – Iot Engineer
- **I Wayan Trisna Ardika** – Machine Learning
- **Ardiansyah Maulana Putra** – Machine Learning

---

## 📝 Catatan Tambahan

- ✅ Proyek ini dibuat untuk keperluan akademik (Capstone Semester 7)
- ✅ Untuk IoT **Harus Menggunakan 2 DEVICE**
- ✅ Untuk troubleshooting, lihat folder masing-masing service
- ✅ Database schema dapat dilihat di file `Database-LingTienKung.sql`

---

**Last Updated**: Februari 2026  
