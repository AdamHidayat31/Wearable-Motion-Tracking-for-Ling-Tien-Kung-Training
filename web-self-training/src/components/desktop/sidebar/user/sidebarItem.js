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
        className={`flex items-center gap-3 p-2 h-12 rounded-xl transition-colors ${
          isActive
            ? "text-white bg-[#87B5DF]" // ACTIVE
            : "text-[#363636] hover:text-gray-400" // DEFAULT + HOVER abu-abu
        }`}
        style={{
          backgroundColor: isActive ? "#87B5DF" : "transparent",
        }}
      >
        <Icon className="w-6 h-6" />
        <span className="text-lg">{label}</span>
      </Link>
    </div>
  );
}
