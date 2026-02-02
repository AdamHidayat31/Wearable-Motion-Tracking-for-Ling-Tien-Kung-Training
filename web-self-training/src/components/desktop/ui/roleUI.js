"use client";

export default function RoleUI({
  label = "User",
  bgColor = "#F3F4F6", // default: abu-abu
  textColor = "#3A465C", // default: hitam
  rounded = "full", // opsi: 'md', 'lg', 'full'
  className = "",
}) {
  const radiusClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
      ? "rounded-lg"
      : "rounded-md";

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium ${radiusClass} ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {label}
    </span>
  );
}
