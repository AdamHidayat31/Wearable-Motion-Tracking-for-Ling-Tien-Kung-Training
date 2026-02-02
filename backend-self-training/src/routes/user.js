import express from "express";
import { userAkses } from "../middleware/userAkses.js";

const router = express.Router();

// Semua endpoint admin harus lewat adminAkses
router.use(userAkses);

router.get("/halaman-pelatihan", (req, res) => {
  res.json({ message: "Halaman Halaman Latihan (user)" });
});

router.get("/riwayat-latihan", (req, res) => {
  res.json({ message: "Halaman Riwayat Latihan (user)" });
});

export default router;
