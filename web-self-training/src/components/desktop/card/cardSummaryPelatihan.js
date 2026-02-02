// "use client";

import React from "react";
import { Icon } from "@iconify/react";

export default function CardSummaryPelatihan({
  label = "Total Pelatihan",
  value = "25",
  description = "Selesai bulan ini",
  icon = "mdi:filter",
  iconBg = "#E8EEFF",
  iconColor = "#1447E6",
  bgColor = "#FFFFFF",
  borderColor = "#E5E7EB",
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl border shadow-sm transition "
      style={{ backgroundColor: bgColor, borderColor }}
    >
      {/* Kiri: Text Info */}
      <div className="flex flex-col">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <span className="text-xl font-semibold text-gray-900">{value}</span>
        <span className="text-xs text-gray-400">{description}</span>
      </div>

      {/* Kanan: Icon */}
      <div
        className="w-12 h-12 flex items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        <Icon icon={icon} width={26} height={26} color={iconColor} />
      </div>
    </div>
  );
}
