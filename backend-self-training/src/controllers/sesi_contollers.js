import db from "../config/db.js";

export const deleteSesiLatihan = async (req, res) => {
  const { id_sesi } = req.params;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query("DELETE FROM hasil_ml WHERE id_sesi = ?", [id_sesi]);

    await conn.query("DELETE FROM data_sensor WHERE id_sesi = ?", [id_sesi]);

    const [result] = await conn.query(
      "DELETE FROM sesi_latihan WHERE id_sesi = ?",
      [id_sesi],
    );

    if (result.affectedRows === 0) {
      throw new Error("Sesi latihan tidak ditemukan");
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Sesi latihan berhasil dihapus",
    });
  } catch (err) {
    await conn.rollback();
    console.error("DELETE SESI ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Gagal menghapus sesi latihan",
    });
  } finally {
    conn.release();
  }
};
const formatDate = (date) => {
  if (!date) return null;

  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
export const downloadSesiLatihan = async (req, res) => {
  const { id_sesi } = req.params;
  const format = (req.query.format || "json").toLowerCase();

  // 🔐 ADMIN ONLY
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak (admin only)",
    });
  }

  try {
    // =========================
    // SESI + PENGGUNA
    // =========================
    const [sesiRows] = await db.query(
      `
      SELECT 
        sl.id_sesi,
        sl.waktu_mulai,
        sl.waktu_selesai,
        sl.status_sesi,
        sl.total_durasi,
        p.nama,
        p.username
      FROM sesi_latihan sl
      JOIN pengguna p ON sl.id_pengguna = p.id_pengguna
      WHERE sl.id_sesi = ?
      `,
      [id_sesi],
    );

    if (sesiRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sesi tidak ditemukan",
      });
    }

    const sesi = sesiRows[0];

    // =========================
    // HASIL ML + NAMA GERAKAN
    // =========================
    const [hasilML] = await db.query(
      `
      SELECT 
        hm.id_gerakan,
        g.nama_gerakan,
        hm.skor_gerakan,
        hm.waktu_analisis
      FROM hasil_ml hm
      JOIN gerakan_latihan g ON hm.id_gerakan = g.id_gerakan
      WHERE hm.id_sesi = ?
      `,
      [id_sesi],
    );

    // =========================
    // DATA SENSOR (SEMUA)
    // =========================
    const [dataSensor] = await db.query(
      `
      SELECT *
      FROM data_sensor
      WHERE id_sesi = ?
      ORDER BY timestamp
      `,
      [id_sesi],
    );

    // =========================
    // FORMAT JSON
    // =========================
    if (format === "json") {
      return res.json({
        success: true,
        data: {
          pengguna: {
            nama: sesi.nama,
            username: sesi.username,
          },
          sesi_latihan: {
            id_sesi: sesi.id_sesi,
            waktu_mulai: formatDate(sesi.waktu_mulai),
            waktu_selesai: formatDate(sesi.waktu_selesai),
            status_sesi: sesi.status_sesi,
            total_durasi: sesi.total_durasi,
          },
          hasil_ml: hasilML.map((ml) => ({
            id_gerakan: ml.id_gerakan,
            nama_gerakan: ml.nama_gerakan,
            skor_gerakan: ml.skor_gerakan,
            waktu_analisis: formatDate(ml.waktu_analisis),
          })),
          data_sensor: dataSensor.map((s) => ({
            ...s,
            timestamp: formatDate(s.timestamp),
          })),
        },
      });
    }

    // =========================
    // FORMAT CSV
    // =========================
    if (format === "csv") {
      let csv = "";

      // --- PENGGUNA ---
      csv += "=== PENGGUNA ===\n";
      csv += "nama,username\n";
      csv += `${sesi.nama},${sesi.username}\n\n`;

      // --- SESI LATIHAN ---
      csv += "=== SESI LATIHAN ===\n";
      csv += "id_sesi,waktu_mulai,waktu_selesai,status_sesi,total_durasi\n";
      csv += `${sesi.id_sesi},${formatDate(
        sesi.waktu_mulai,
      )},${formatDate(sesi.waktu_selesai)},${sesi.status_sesi},${
        sesi.total_durasi
      }\n\n`;

      // --- HASIL ML ---
      csv += "=== HASIL ML ===\n";
      csv += "id_gerakan,nama_gerakan,skor_gerakan,waktu_analisis\n";
      hasilML.forEach((ml) => {
        csv += `${ml.id_gerakan},${ml.nama_gerakan},${ml.skor_gerakan},${formatDate(
          ml.waktu_analisis,
        )}\n`;
      });
      csv += "\n";

      // --- DATA SENSOR ---
      csv += "=== DATA SENSOR ===\n";
      if (dataSensor.length > 0) {
        csv += Object.keys(dataSensor[0]).join(",") + "\n";
        dataSensor.forEach((row) => {
          const values = Object.values({
            ...row,
            timestamp: formatDate(row.timestamp),
          });
          csv += values.join(",") + "\n";
        });
      } else {
        csv += "Tidak ada data sensor\n";
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="sesi_${id_sesi}.csv"`,
      );

      return res.send(csv);
    }

    // =========================
    // FORMAT TIDAK VALID
    // =========================
    res.status(400).json({
      success: false,
      message: "Format tidak didukung (json / csv)",
    });
  } catch (err) {
    console.error("DOWNLOAD SESI ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mendownload data sesi",
    });
  }
};
