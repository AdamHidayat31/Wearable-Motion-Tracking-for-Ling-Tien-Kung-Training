import express from "express";
import db from "../config/db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ===========================
   GET HASIL ML
   ADMIN : semua hasil ML
   USER  : hasil ML milik sesi dia
   =========================== */
router.get("/", auth, async (req, res) => {
  try {
    let query = "";
    let params = [];

    if (req.user.role === "admin") {
      // ADMIN → semua hasil ML
      query = `
        SELECT *
        FROM HASIL_ML
        ORDER BY id_sesi DESC
      `;
    } else {
      // USER → hanya hasil ML dari sesi miliknya
      query = `
        SELECT hm.*
        FROM HASIL_ML hm
        JOIN SESI_LATIHAN sl ON hm.id_sesi = sl.id_sesi
        WHERE sl.id_pengguna = ?
        ORDER BY hm.id_sesi DESC
      `;
      params = [req.user.id];
    }

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("HASIL_ML ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data hasil ML",
    });
  }
});

export default router;
