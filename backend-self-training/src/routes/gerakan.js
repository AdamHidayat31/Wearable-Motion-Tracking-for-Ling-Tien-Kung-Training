import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM gerakan_latihan");

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "Gagal mengambil data tabel Gerakan Latihan",
    });
  }
});

export default router;
