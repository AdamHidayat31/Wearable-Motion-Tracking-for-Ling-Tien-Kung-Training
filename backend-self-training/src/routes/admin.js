import express from "express";
import { adminAkses } from "../middleware/adminAkses.js";

const router = express.Router();

// Semua endpoint admin harus lewat adminAkses
router.use(adminAkses);

router.get("/kelola-pengguna", (req, res) => {
  res.json({ message: "Halaman Kelola Pengguna (admin)" });
});

router.get("/data-pelatihan", (req, res) => {
  res.json({ message: "Halaman Data Pelatihan (admin)" });
});

export default router;
