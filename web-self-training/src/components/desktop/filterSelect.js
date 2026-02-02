"use client";

import { Filter, ChevronDown } from "lucide-react";

export default function FilterSelect({
  value,
  onChange,
  options = [],
  className = "",
}) {
  return (
    <div className={`relative w-[160px] ${className}`}>
      {/* Ikon Filter di kiri */}
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />

      {/* Select */}
      <select
        className="
          w-full
          appearance-none
          border border-gray-300 rounded-lg
          pl-9 pr-8 py-2
          text-sm text-black
          focus:outline-none focus:ring-2 focus:ring-blue-500
          bg-white
        "
        value={value}
        onChange={onChange}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Panah ke bawah tanpa tangkai */}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  );
}
