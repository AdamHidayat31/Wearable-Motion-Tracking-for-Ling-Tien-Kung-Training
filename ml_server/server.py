from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
import json
from tensorflow.keras.models import load_model

app = Flask(__name__)

# ===================== FUNGSI ASLI =====================

def convert_raw_json(data_json):
    df = pd.DataFrame(data_json)

    df["timestamp"] = pd.to_datetime(df["timestamp"])

    # Deteksi posisi device
    df["posisi"] = df["device_id"].str.lower().apply(
        lambda x: "tangan" if "tangan" in x else "kaki" if "kaki" in x else None
    )

    df = df[df["posisi"].notna()]

    tangan = df[df["posisi"] == "tangan"].copy()
    kaki   = df[df["posisi"] == "kaki"].copy()

    tangan = tangan.rename(columns={
        "ax": "ax_tangan", "ay": "ay_tangan", "az": "az_tangan",
        "gx": "gx_tangan", "gy": "gy_tangan", "gz": "gz_tangan",
        "mx": "mx_tangan", "my": "my_tangan", "mz": "mz_tangan",
    })

    kaki = kaki.rename(columns={
        "ax": "ax_kaki", "ay": "ay_kaki", "az": "az_kaki",
        "gx": "gx_kaki", "gy": "gy_kaki", "gz": "gz_kaki",
        "mx": "mx_kaki", "my": "my_kaki", "mz": "mz_kaki",
    })

    tangan = tangan.drop(columns=["device_id", "posisi"])
    kaki   = kaki.drop(columns=["device_id", "posisi"])

    merged = pd.merge_asof(
        tangan.sort_values("timestamp"),
        kaki.sort_values("timestamp"),
        on="timestamp",
        tolerance=pd.Timedelta("50ms"),
        direction="nearest"
    )

    merged = merged.dropna()

    ordered_cols = [
        "timestamp",
        "ax_tangan","ay_tangan","az_tangan",
        "gx_tangan","gy_tangan","gz_tangan",
        "mx_tangan","my_tangan","mz_tangan",
        "ax_kaki","ay_kaki","az_kaki",
        "gx_kaki","gy_kaki","gz_kaki",
        "mx_kaki","my_kaki","mz_kaki"
    ]

    return merged[ordered_cols]

# ===================== LOAD MODEL =====================

with open("C:/Users/User/OneDrive/Documents/Semester7/ml_server/config.json") as f:
    config = json.load(f)

WINDOW_SIZE = config["window_size"]
STEP_SIZE   = config["step_size"]
SENSORS     = config["sensor_order"]
LABELS      = config["labels"]

model  = load_model("C:/Users/User/OneDrive/Documents/Semester7/ml_server/lstm_ltk_model.keras")
scaler = joblib.load("C:/Users/User/OneDrive/Documents/Semester7/ml_server/scaler.pkl")

# ===================== WINDOWING =====================

def windowing(df):
    X = []
    for start in range(0, len(df) - WINDOW_SIZE + 1, STEP_SIZE):
        window = df[SENSORS].iloc[start:start+WINDOW_SIZE].values
        X.append(window)
    return np.array(X)

def predict_json(df):
    X = windowing(df)

    n, t, f = X.shape
    X = X.reshape(-1, f)
    X = scaler.transform(X)
    X = X.reshape(n, t, f)

    probs = model.predict(X)
    mean_prob = probs.mean(axis=0)

    return {
        LABELS[i]: float(mean_prob[i] * 100)
        for i in range(len(LABELS))
    }

# ===================== ENDPOINT =====================

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ML server running"})

@app.route("/predict", methods=["POST"])
def predict():
    payload = request.json

    id_pengguna = payload.get("id_pengguna")
    id_sesi     = payload.get("id_sesi")
    sensor_data = payload.get("data")

    if not sensor_data:
        return jsonify({"error": "data sensor kosong"}), 400

    df = convert_raw_json(sensor_data)
    result = predict_json(df)

    return jsonify({        
        "id_pengguna": id_pengguna,
        "id_sesi": id_sesi,
        "hasil": result
    })

# ===================== RUN =====================

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001)
