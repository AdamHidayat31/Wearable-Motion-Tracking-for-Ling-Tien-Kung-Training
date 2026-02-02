import express from "express";
import db from "../config/db.js";
import { adminAkses } from "../middleware/adminAkses.js";

const router = express.Router();

/* ===========================
      GET Semua Pengguna
   =========================== */
router.get("/", adminAkses, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM PENGGUNA");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.json({ success: false, message: "Gagal mengambil data pengguna" });
  }
});

/* ===========================
    UPDATE ROLE PENGGUNA
   =========================== */
router.put("/ubah-role/:id", adminAkses, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res.json({ success: false, message: "Role tidak valid" });
    }

    await db.query("UPDATE PENGGUNA SET role = ? WHERE id_pengguna = ?", [
      role,
      id,
    ]);

    // ===== REALTIME EMIT =====
    const io = req.app.get("io");
    io.emit("pengguna_update", { id, role });

    res.json({ success: true, message: "Role berhasil diperbarui" });
  } catch (err) {
    res.json({ success: false, message: "Gagal memperbarui role" });
  }
});

/* ===========================
    UPDATE STATUS PENGGUNA
   =========================== */
router.put("/ubah-status/:id", adminAkses, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pengguna } = req.body;

    if (!["active", "pending", "deactive"].includes(status_pengguna)) {
      return res.json({ success: false, message: "Status tidak valid" });
    }

    await db.query(
      "UPDATE PENGGUNA SET status_pengguna = ? WHERE id_pengguna = ?",
      [status_pengguna, id]
    );

    // ===== REALTIME EMIT =====
    const io = req.app.get("io");
    io.emit("pengguna_update", { id, status_pengguna });

    res.json({ success: true, message: "Status pengguna berhasil diubah" });
  } catch (err) {
    res.json({ success: false, message: "Gagal memperbarui status" });
  }
});

router.get("/data-pelatihan", adminAkses, async (req, res) => {
  try {
    const query = `
      SELECT
        -- USER
        p.id_pengguna,
        p.username,
        p.nama,
        p.status_pengguna,

        -- SESI LATIHAN
        s.id_sesi,
        s.status_sesi,
        s.total_durasi,
        DATE_FORMAT(s.waktu_mulai, '%Y-%m-%d %H:%i:%s') AS waktu_mulai,
        DATE_FORMAT(s.waktu_selesai, '%Y-%m-%d %H:%i:%s') AS waktu_selesai,

        -- HASIL ML
        h.id_analisis,
        h.id_gerakan,
        h.skor_gerakan

      FROM pengguna p
      LEFT JOIN sesi_latihan s 
        ON s.id_pengguna = p.id_pengguna
      LEFT JOIN hasil_ml h 
        ON h.id_sesi = s.id_sesi

      WHERE p.role = 'user'
        AND p.status_pengguna <> 'pending'

      ORDER BY p.id_pengguna, s.waktu_mulai DESC
    `;

    const [rows] = await db.query(query);

    const users = {};

    rows.forEach((row) => {
      // USER
      if (!users[row.id_pengguna]) {
        users[row.id_pengguna] = {
          id_pengguna: row.id_pengguna,
          username: row.username,
          nama: row.nama,
          status_pengguna: row.status_pengguna,
          sesi_latihan: [],
        };
      }

      // SESI
      if (row.id_sesi) {
        let sesi = users[row.id_pengguna].sesi_latihan.find(
          (s) => s.id_sesi === row.id_sesi
        );

        if (!sesi) {
          sesi = {
            id_sesi: row.id_sesi,
            status_sesi: row.status_sesi,
            total_durasi: row.total_durasi,
            waktu_mulai: row.waktu_mulai,
            waktu_selesai: row.waktu_selesai,
            hasil_ml: [],
          };
          users[row.id_pengguna].sesi_latihan.push(sesi);
        }

        // HASIL ML
        if (row.id_analisis) {
          sesi.hasil_ml.push({
            id_analisis: row.id_analisis,
            id_gerakan: row.id_gerakan,
            skor_gerakan: row.skor_gerakan,
          });
        }
      }
    });

    res.json(Object.values(users));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data pelatihan" });
  }
});

export default router;
