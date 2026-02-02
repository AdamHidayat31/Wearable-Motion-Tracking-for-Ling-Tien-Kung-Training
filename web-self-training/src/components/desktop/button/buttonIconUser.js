// components/desktop/ui/ButtonIconUser.js (Path yang Anda miliki)
"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

export default function ButtonIconUser({
  text = "Click Me",
  icon = null,
  iconSize = 18,
  iconColor = "currentColor",
  bgColor = "#1447E6",
  textColor = "#FFFFFF",
  borderColor = "#1447E6",
  activeBgColor = "#E64714",
  activeTextColor = "#FFFFFF",
  isClicked = false,
  onClick = () => {},
  rounded = "lg",
  className = "",
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

  // Fungsi untuk menggelapkan warna untuk hover effect
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

  const finalBgColor = isClicked
    ? activeBgColor
    : isHovered
    ? darkenColor(bgColor, 25)
    : bgColor;

  const finalTextColor = isClicked ? activeTextColor : textColor;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center justify-center gap-2 px-4 py-2 font-medium border transition-colors duration-200 ${radiusClass} ${className}`}
      style={{
        backgroundColor: finalBgColor,
        color: finalTextColor,
        borderColor: isClicked ? finalBgColor : borderColor,
        cursor: "pointer",
      }}
    >
      {icon && (
        <Icon
          icon={icon}
          width={iconSize}
          height={iconSize}
          color={isClicked ? activeTextColor : iconColor}
        />
      )}
      {text}
    </button>
  );
}
