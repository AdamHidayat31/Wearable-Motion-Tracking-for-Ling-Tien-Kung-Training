"use client";

export default function StatusUser({
  label = "Active",
  bgColor = "#E0F2FE", // default: biru muda
  textColor = "#0369A1", // default: biru tua
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
