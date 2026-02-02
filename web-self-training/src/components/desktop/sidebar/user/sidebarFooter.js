"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SidebarFooter({ name }) {
  const [open, setOpen] = useState(false);
  const footerRef = useRef(null);
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  // TUTUP DROPDOWN JIKA KLIK DI LUAR
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (footerRef.current && !footerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={footerRef} className="relative">
      {/* === FOOTER UI ASLI (CLICKABLE) === */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="
          border-t border-gray-200 p-4 flex items-center gap-3
          cursor-pointer select-none
          hover:bg-gray-100 transition
        "
      >
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-700 font-semibold">{name.charAt(0)}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{name}</p>
          <p className="text-xs text-gray-500">Active Session</p>
        </div>
      </div>

      {/* === DROPDOWN KE ATAS (CLICK) === */}
      {open && (
        <div
          className="
            absolute bottom-full left-4 right-4 mb-2
            bg-white border border-gray-200
            rounded-lg shadow-lg z-50
          "
        >
          <button
            onClick={logout}
            className="
              w-full flex items-center gap-2
              px-4 py-2 text-sm text-red-600
              hover:bg-red-50 transition
            "
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
