import express from "express";
import bcrypt from "bcryptjs";
import db from "../config/db.js";

const router = express.Router();

// ---------------- SIGN UP ----------------
router.post("/signup", async (req, res) => {
  try {
    const { nama, username, email, password, usia, jenis_kelamin } = req.body;

    // cek apakah email sudah ada
    const [cek] = await db.query("SELECT * FROM PENGGUNA WHERE email = ?", [
      email,
    ]);

    if (cek.length > 0) {
      return res.json({ success: false, message: "Email sudah digunakan" });
    }

    // cek apakah username sudah ada
    const [cekUsername] = await db.query(
      "SELECT * FROM PENGGUNA WHERE username = ?",
      [username]
    );

    if (cekUsername.length > 0) {
      return res.json({ success: false, message: "Username sudah digunakan" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // insert user
    const [result] = await db.query(
      `INSERT INTO PENGGUNA (nama, username, email, password, role, status_pengguna, usia, jenis_kelamin)
       VALUES (?, ?, ?, ?, 'user', 'pending', ?, ?)`,
      [nama, username, email, hashed, usia, jenis_kelamin]
    );

    /// Ambil ulang data lengkap (termasuk tanggal_daftar)
    const [baru] = await db.query(
      "SELECT * FROM PENGGUNA WHERE id_pengguna = ?",
      [result.insertId]
    );

    const userBaru = baru[0];

    // EMIT REALTIME
    const io = req.io;

    io.emit("pengguna_add", {
      id: userBaru.id_pengguna,
      name: userBaru.nama,
      email: userBaru.email,
      role: userBaru.role,
      status: userBaru.status_pengguna,
      usia: userBaru.usia,
      jenis_kelamin: userBaru.jenis_kelamin,
      tanggal_daftar: userBaru.tanggal_daftar,
    });

    res.json({ success: true, message: "Pendaftaran berhasil!" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Terjadi kesalahan server" });
  }
});

import jwt from "jsonwebtoken";

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.json({
        success: false,
        message: "Email / Username dan password wajib diisi",
      });
    }

    // 🔥 Cari berdasarkan email ATAU username
    const [rows] = await db.query(
      "SELECT * FROM PENGGUNA WHERE email = ? OR username = ?",
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "Email atau username tidak ditemukan",
      });
    }

    const user = rows[0];

    // 🔒 Cek status akun
    if (user.status_pengguna === "pending") {
      return res.json({
        success: false,
        message: "Akun anda masih pending",
      });
    }

    if (user.status_pengguna === "deactive") {
      return res.json({
        success: false,
        message: "Akun anda dinonaktifkan",
      });
    }

    // 🔑 Cek password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({
        success: false,
        message: "Password salah",
      });
    }

    // 🔐 Generate JWT
    const token = jwt.sign(
      {
        id: user.id_pengguna,
        role: user.role,
      },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "7d" }
    );

    // ✅ Response sukses
    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id_pengguna,
        nama: user.nama,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

export default router;
