"use client";
import { Icon as Iconify } from "@iconify/react";
import { Activity } from "lucide-react";

export default function CardSummaryUser({
  icon = Activity, // bisa komponen React atau string Iconify
  label = "Label",
  value = "0",
  iconColor = "#FFFFFF",
  iconBgColor = "#9810FA",
}) {
  const isStringIcon = typeof icon === "string"; // cek apakah string

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-2 rounded-2xl shadow-md bg-white border border-[#D1E8FF] shadow-lg">
      {/* ICON WRAPPER */}
      <div
        className="p-3 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: iconBgColor,
        }}
      >
        {isStringIcon ? (
          <Iconify
            icon={icon}
            width="28"
            height="28"
            style={{ color: iconColor }}
          />
        ) : (
          <icon.type {...icon.props} size={28} style={{ color: iconColor }} />
        )}
      </div>

      {/* LABEL */}
      <span className="text-sm font-bold text-center text-[#96BADB]">
        {label}
      </span>

      {/* VALUE */}
      <span className="text-xl font-medium text-[#535353] text-center">
        {value}
      </span>
    </div>
  );
}
