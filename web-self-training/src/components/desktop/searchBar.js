"use client";

import { Icon } from "@iconify/react";

export default function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
}) {
  return (
    <div
      className={`flex items-center w-full bg-white rounded-xl border border-gray-300 px-3 py-2 shadow-sm 
        focus-within:border-[#1447E6] focus-within:ring-1 focus-within:ring-[#1447E6] 
        transition ${className}`}
    >
      <Icon
        icon="mdi:magnify"
        className="text-gray-400 mr-2"
        width={22}
        height={22}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
      />
    </div>
  );
}
