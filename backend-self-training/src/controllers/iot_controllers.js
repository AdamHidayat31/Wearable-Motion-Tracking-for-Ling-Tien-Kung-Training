import express from "express";
import { getMqttClient, finishCurrentSession } from "../routes/iot_routes.js";

const router = express.Router();

function publishControl(command) {
  const client = getMqttClient();
  if (!client || !client.connected) return false;

  client.publish("sensor/control", command, { qos: 1 });
  console.log(`📤 MQTT CONTROL: ${command}`);
  return true;
}

// START → ON
router.post("/start", (req, res) => {
  if (!publishControl("ON")) {
    return res.status(500).json({ success: false });
  }

  res.json({ success: true, message: "Sensor ON" });
});

// STOP → OFF (PAUSE)
router.post("/stop", (req, res) => {
  if (!publishControl("OFF")) {
    return res.status(500).json({ success: false });
  }

  res.json({ success: true, message: "Sensor OFF (pause)" });
});

// FINISH → OFF + END SESSION
router.post("/finish", async (req, res) => {
  publishControl("OFF");

  const sessionId = await finishCurrentSession();

  res.json({
    success: true,
    message: "Session selesai",
    id_sesi: sessionId,
  });
});

export default router;
