import express from "express";
import db from "../config/db.js";
import { auth } from "../middleware/auth.js";
import {
  deleteSesiLatihan,
  downloadSesiLatihan,
} from "../controllers/sesi_contollers.js";

const router = express.Router();

/* ===========================
   GET SESI LATIHAN
   ADMIN : semua sesi
   USER  : sesi milik sendiri
   =========================== */
router.get("/", auth, async (req, res) => {
  console.log("ID USER:", req.user.id);
  try {
    let query = "";
    let params = [];

    if (req.user.role === "admin") {
      // ADMIN → semua sesi
      query = `
        SELECT
          id_sesi,
          id_pengguna,
          status_sesi,
          total_durasi,
          DATE_FORMAT(waktu_mulai, '%Y-%m-%d %H:%i:%s') AS waktu_mulai,
          DATE_FORMAT(waktu_selesai, '%Y-%m-%d %H:%i:%s') AS waktu_selesai
        FROM SESI_LATIHAN
        ORDER BY waktu_mulai DESC
      `;
    } else {
      // USER → sesi milik sendiri
      query = `
        SELECT
          id_sesi,
          id_pengguna,
          status_sesi,
          total_durasi,
          DATE_FORMAT(waktu_mulai, '%Y-%m-%d %H:%i:%s') AS waktu_mulai,
          DATE_FORMAT(waktu_selesai, '%Y-%m-%d %H:%i:%s') AS waktu_selesai
        FROM SESI_LATIHAN
        WHERE id_pengguna = ?
        ORDER BY waktu_mulai DESC
      `;
      params = [req.user.id];
    }

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("SESI_LATIHAN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data sesi latihan",
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const idSesi = Number(req.params.id);

    let query = `
      SELECT
        id_sesi,
        id_pengguna,
        status_sesi,
        total_durasi,
        DATE_FORMAT(waktu_mulai, '%Y-%m-%d %H:%i:%s') AS waktu_mulai,
        DATE_FORMAT(waktu_selesai, '%Y-%m-%d %H:%i:%s') AS waktu_selesai
      FROM SESI_LATIHAN
      WHERE id_sesi = ?
    `;

    const params = [idSesi];

    // 🔐 kalau bukan admin, batasi ke user sendiri
    if (req.user.role !== "admin") {
      query += " AND id_pengguna = ?";
      params.push(req.user.id);
    }

    const [sesiRows] = await db.query(query, params);

    if (sesiRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sesi tidak ditemukan",
      });
    }

    const [hasilML] = await db.query(
      `
      SELECT
        id_analisis,
        id_sesi,
        id_gerakan,
        skor_gerakan
      FROM HASIL_ML
      WHERE id_sesi = ?
      `,
      [idSesi],
    );

    res.json({
      success: true,
      data: {
        ...sesiRows[0],
        hasil_ml: hasilML,
      },
    });
  } catch (err) {
    console.error("DETAIL SESI ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail sesi",
    });
  }
});
router.get("/detail/:id", auth, async (req, res) => {
  try {
    const idSesi = Number(req.params.id);

    // =========================
    // SESI LATIHAN
    // =========================
    let sesiQuery = `
      SELECT
        id_sesi,
        id_pengguna,
        status_sesi,
        total_durasi,
        DATE_FORMAT(waktu_mulai, '%Y-%m-%d %H:%i:%s') AS waktu_mulai,
        DATE_FORMAT(waktu_selesai, '%Y-%m-%d %H:%i:%s') AS waktu_selesai
      FROM SESI_LATIHAN
      WHERE id_sesi = ?
    `;

    const sesiParams = [idSesi];

    if (req.user.role !== "admin") {
      sesiQuery += " AND id_pengguna = ?";
      sesiParams.push(req.user.id);
    }

    const [sesiRows] = await db.query(sesiQuery, sesiParams);

    if (sesiRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sesi tidak ditemukan",
      });
    }

    // =========================
    // HASIL ML
    // =========================
    const [hasilML] = await db.query(
      `
      SELECT
        id_analisis,
        id_sesi,
        id_gerakan,
        skor_gerakan
      FROM HASIL_ML
      WHERE id_sesi = ?
      `,
      [idSesi],
    );

    // =========================
    // DATA SENSOR (PER DEVICE)
    // =========================
    const [sensorRows] = await db.query(
      `
      SELECT
        device_id,
        timestamp,
        ax, ay, az,
        gx, gy, gz,
        mx, my, mz
      FROM DATA_SENSOR
      WHERE id_sesi = ?
      ORDER BY device_id, timestamp
      `,
      [idSesi],
    );

    // =========================
    // GROUP BY DEVICE_ID
    // =========================
    const sensorMap = {};

    sensorRows.forEach((row) => {
      if (!sensorMap[row.device_id]) {
        sensorMap[row.device_id] = {
          sensorName: row.device_id.includes("tangan")
            ? "Tangan Kanan"
            : row.device_id.includes("kaki")
              ? "Kaki Kanan"
              : row.device_id,
          readings: [],
        };
      }

      sensorMap[row.device_id].readings.push({
        timestamp: row.timestamp,
        ax: row.ax,
        ay: row.ay,
        az: row.az,
        gx: row.gx,
        gy: row.gy,
        gz: row.gz,
        mx: row.mx,
        my: row.my,
        mz: row.mz,
      });
    });

    const sensorData = Object.values(sensorMap);

    // =========================
    // RESPONSE FINAL
    // =========================
    res.json({
      success: true,
      data: {
        ...sesiRows[0],
        hasil_ml: hasilML,
        sensorData,
      },
    });
  } catch (err) {
    console.error("DETAIL SESI ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail sesi",
    });
  }
});
router.delete("/:id_sesi", auth, deleteSesiLatihan);
router.get("/download/:id_sesi", auth, downloadSesiLatihan);

export default router;
