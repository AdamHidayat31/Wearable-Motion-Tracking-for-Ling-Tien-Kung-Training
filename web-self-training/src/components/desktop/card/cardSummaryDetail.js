"use client";
import { Activity } from "lucide-react";

export default function CardSummaryDetail({
  type = "three",
  icon: Icon = Activity,

  // warna dalam HEX (string)
  iconColor = "#4B5563", // default: gray-700
  iconBg = "#F3F4F6", // default: gray-100

  // data
  label = "",
  tanggal = "",
  waktu = "",
  value = "",
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow border border-gray-100 w-full">
      {/* === KIRI: IKON === */}
      <div
        className="flex items-center justify-center p-3 rounded-lg"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>

      {/* === KANAN: DETAIL === */}
      <div className="flex flex-col text-sm text-gray-800">
        {type === "three" ? (
          <>
            <p>{label}</p>
            <p>{tanggal}</p>
            <p>{waktu} WIB</p>
          </>
        ) : (
          <>
            <p>{label}</p>
            <p>{value}</p>
          </>
        )}
      </div>
    </div>
  );
}
