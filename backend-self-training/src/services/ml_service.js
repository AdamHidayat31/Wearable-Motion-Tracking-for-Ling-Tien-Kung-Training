import axios from "axios";

const ML_SERVER_URL = "http://127.0.0.1:5001/predict";

export async function sendSessionToML(payload) {
  try {
    console.log("🚀 Mengirim data sesi ke ML Server...");

    const res = await axios.post(ML_SERVER_URL, payload, {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (err) {
    console.error("❌ ML Server Error:", err.message);
    return null;
  }
}
