import jwt from "jsonwebtoken";

export function userAkses(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");

    // Pastikan role adalah user
    if (decoded.role !== "user") {
      return res
        .status(403)
        .json({ message: "Akses ditolak: Anda bukan user" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
}
