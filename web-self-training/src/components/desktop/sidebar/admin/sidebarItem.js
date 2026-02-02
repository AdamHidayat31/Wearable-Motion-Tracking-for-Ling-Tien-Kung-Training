/*
  Komponen: SidebarItem
  -----------------------------------
  Komponen ini digunakan untuk menampilkan 1 item di sidebar,
  lengkap dengan ikon, label, dan tautan (Link) ke halaman tertentu.

  - Menggunakan 'usePathname' untuk mendeteksi URL aktif.
  - Memberi warna & background berbeda jika item sedang aktif.
*/

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarItem({ icon: Icon, label, href }) {
  const pathname = usePathname();

  const isDefault = pathname === "/" && href === "/kelola-pengguna";

  // Menentukan apakah item ini aktif
  const isActive = pathname === href;

  return (
    <div className="p-3">
      <Link
        href={href}
        className={`flex items-center gap-3 p-2 h-12 rounded-xl transition-colors hover:bg-gray-200 ${
          isActive
            ? "bg-[#1447E61A] text-[#1447E6]" // ACTIVE (clicked / halaman aktif)
            : "text-[#4A5568] hover:bg-gray-200 hover:text-[#1447E6]" // DEFAULT + HOVER
        }`}
        style={{
          backgroundColor: isActive ? "rgb(21 71 230 / 0.10)" : "transparent",
        }}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </Link>
    </div>
  );
}
