import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import gerakanRoutes from "./routes/gerakan.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import penggunaRoutes from "./routes/pengguna.js";
import iotRoutes from "./routes/iot_routes.js";
import sesiLatihan from "./routes/sesi_latihan.js";
import hasilML from "./routes/hasil_ml.js";

// controllers
import iotControllers from "./controllers/iot_controllers.js";

const app = express();

// ---- SECURITY ----
app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// ---- RATE LIMIT ----
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
  }),
);

// ---- BODY PARSER ----
app.use(express.json());

// ---- HTTP SERVER + SOCKET.IO ----
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("Client terhubung:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client terputus:", socket.id);
  });
});

// ---- ROUTES ----
app.use("/api/auth", authRoutes);
app.use("/api/gerakan", gerakanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pengguna", penggunaRoutes);
app.use("/api/iot", iotRoutes);
app.use("/api/sesi-latihan", sesiLatihan);
app.use("/api/hasil-ml", hasilML);

// ---- IOT CONTROLLERS ----
app.use("/iotcontrol", iotControllers);

// ---- GLOBAL ERROR HANDLER ----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

// ---- START SERVER ----
server.listen(5000, () => {
  console.log("Server + Socket.IO berjalan di http://localhost:5000");
});
