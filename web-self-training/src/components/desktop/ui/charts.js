"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Cara pakai:
 * <GrafikSensor
 *   data={session.sensorData[0]}
 *   series={[
 *     { key: "ax", name: "AX" },
 *     { key: "ay", name: "AY" },
 *     { key: "az", name: "AZ" },
 *   ]}
 * />
 */

export default function GrafikSensor({
  label = null,
  xKey = "timestamp",
  series = [],
  data,
}) {
  let points = [];
  let internalLabel = label ?? "Sensor Chart";

  /** -----------------------------
   *  DETEKSI STRUKTUR DATA
   *  ----------------------------- */

  // Jika data: array langsung
  if (Array.isArray(data)) {
    points = data;
  }

  // Jika data: objek sensorData
  else if (typeof data === "object" && data !== null) {
    points = data.readings ?? data.data ?? data.values ?? [];

    if (!label && data.sensorName) {
      internalLabel = data.sensorName;
    }
  }

  /** -----------------------------
   *  FORMAT TIMESTAMP
   *  ----------------------------- */
  const formatX = (v) => {
    if (!v) return "";
    if (typeof v === "string" && v.includes("T")) {
      return v.split("T")[1].split(".")[0]; // HH:MM:SS
    }
    return v;
  };

  /** -----------------------------
   *  GENERATE WARNA OTOMATIS
   *  ----------------------------- */
  const autoColors = [
    "#FF3B30",
    "#34C759",
    "#007AFF",
    "#FF9500",
    "#AF52DE",
    "#5AC8FA",
  ];

  return (
    <div className="my-4">
      <h3 className="text-lg text-center text-[#848B98] font-semibold mb-2">
        {internalLabel}
      </h3>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tickFormatter={formatX} minTickGap={20} />
            <YAxis />
            <Tooltip
              labelFormatter={formatX}
              labelStyle={{ color: "#848B98" }}
            />
            <Legend verticalAlign="bottom" height={36} />

            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name ?? s.key}
                stroke={s.color ?? autoColors[i % autoColors.length]}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
