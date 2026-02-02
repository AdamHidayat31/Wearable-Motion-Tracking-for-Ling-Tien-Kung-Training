import jwt from "jsonwebtoken";

export function adminAkses(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");

    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Akses ditolak: Anda bukan admin" });
    }

    req.user = decoded; // simpan data user yang login
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
}
