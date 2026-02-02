import db from "../config/db.js";

const ACTIVITY_MAP = {
  "lipat pinggang": 1,
  "jongkok delapan titik": 2,
  "kocok seluruh badan": 3,
};

function normalizeActivity(text) {
  if (!text) return "";

  return text
    .toLowerCase()
    .replace(/8/g, "delapan")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getIdGerakan(activityName) {
  const normalizedInput = normalizeActivity(activityName);

  for (const [key, id] of Object.entries(ACTIVITY_MAP)) {
    const normalizedKey = normalizeActivity(key);

    if (normalizedInput.includes(normalizedKey)) {
      return id;
    }
  }

  throw new Error(`Activity tidak dikenal: ${activityName}`);
}

export async function saveHasilML({ idSesi, hasilPrediksi }) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // ===============================
    // AMBIL GERAKAN DENGAN SKOR TERBESAR
    // ===============================
    let bestLabel = null;
    let bestScore = -Infinity;

    for (const [label, skor] of Object.entries(hasilPrediksi)) {
      if (skor > bestScore) {
        bestScore = skor;
        bestLabel = label;
      }
    }

    if (!bestLabel) {
      throw new Error("Tidak ada hasil prediksi yang valid");
    }

    const idGerakan = getIdGerakan(bestLabel);

    // ===============================
    // SIMPAN SATU DATA SAJA
    // ===============================
    await conn.query(
      `
      INSERT INTO hasil_ml
      (id_gerakan, id_sesi, skor_gerakan, catatan_feedback, waktu_analisis)
      VALUES (?, ?, ?, NULL, NOW())
      `,
      [idGerakan, idSesi, bestScore],
    );

    await conn.commit();
    console.log(`Hasil ML disimpan: ${bestLabel} (${bestScore})`);
  } catch (err) {
    await conn.rollback();
    console.error("Gagal simpan hasil ML:", err.message);
  } finally {
    conn.release();
  }
}
