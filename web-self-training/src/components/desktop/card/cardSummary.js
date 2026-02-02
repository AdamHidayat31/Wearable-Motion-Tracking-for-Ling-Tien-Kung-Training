// "use client";

import React from "react";

export default function CardSummary({
  icon: Icon, // Komponen icon dari lucide-react
  title, // Nama card
  value, // Isi card (angka)
  iconBgColor = "#E5EEFF", // Default warna background icon
  iconColor = "#1447E6", // Default warna icon
  className = "", // Tambahan class opsional
}) {
  return (
    <div
      className={`flex items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm transition-shadow ${className}`}
    >
      {/* Icon section */}
      <div
        className="p-3 rounded-xl shadow-sm flex items-center justify-center"
        style={{
          backgroundColor: iconBgColor,
          color: iconColor,
        }}
      >
        {Icon && <Icon className="w-6 h-6" />}
      </div>

      {/* Text section */}
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
