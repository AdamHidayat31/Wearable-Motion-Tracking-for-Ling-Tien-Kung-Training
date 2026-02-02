"use client";
import { useState } from "react";

export default function ButtonNonIcon({
  text = "Click Me",
  bgColor = "#1447E6",
  textColor = "#FFFFFF",
  borderColor = "#1447E6",
  onClick = () => {},
  rounded = "lg",
  className = "",
  custWidth = "w-[150px]",
}) {
  const [isHovered, setIsHovered] = useState(false);

  const radiusClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "md"
      ? "rounded-md"
      : rounded === "none"
      ? "rounded-none"
      : "rounded-lg";

  // Fungsi kecil untuk buat warna hover sedikit lebih gelap
  const darkenColor = (color, amount = 20) => {
    let c = color.startsWith("#") ? color.slice(1) : color;
    if (c.length === 3)
      c = c
        .split("")
        .map((x) => x + x)
        .join("");
    const num = parseInt(c, 16);
    const r = Math.max((num >> 16) - amount, 0);
    const g = Math.max(((num >> 8) & 0x00ff) - amount, 0);
    const b = Math.max((num & 0x0000ff) - amount, 0);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`px-4 py-2 font-medium border transition-colors duration-200 ${radiusClass} ${custWidth} ${className} `}
      style={{
        backgroundColor: isHovered ? darkenColor(bgColor, 25) : bgColor,
        color: textColor,
        borderColor: borderColor,
        cursor: "pointer",
      }}
    >
      {text}
    </button>
  );
}
