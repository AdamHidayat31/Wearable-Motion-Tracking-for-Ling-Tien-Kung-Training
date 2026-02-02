"use client";

// components/mobile/BottomNav.jsx
import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation"; // Diperlukan untuk menentukan link aktif

const navItems = [
  { href: "/admin/kelola-pengguna", icon: "lucide:users" },
  { href: "/admin/pemantuan-sistem", icon: "lucide:activity" },
  { href: "/admin/data-pelatihan", icon: "lucide:database" },
  { href: "/admin/profil", icon: "lucide:user" },
];

export default function BottomNavAdmin({ className = "" }) {
  // Dapatkan path saat ini
  const pathname = usePathname();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 ${className}`}
    >
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          // Tentukan apakah link aktif
          const isActive = pathname === item.href;

          // Kelas dasar untuk link
          const linkClasses = `
            flex flex-col items-center justify-center p-1 w-full 
            text-gray-500 transition-colors duration-200 
            /* Hover state pada link secara keseluruhan */
            hover:text-blue-700 
          `;

          // Kelas untuk wrapper ikon (lingkaran)
          const iconWrapperClasses = `
            flex items-center justify-center 
            w-10 h-10 rounded-full text-2xl 
            
            ${
              isActive
                ? // State Aktif: Background biru muda (blue-100) & Ikon biru tua (blue-700)
                  "bg-blue-100 text-blue-700"
                : // State Hover: Background abu-abu ringan & Teks biru tua
                  "hover:bg-gray-100 hover:text-blue-700"
            }
          `;

          return (
            <Link key={item.href} href={item.href} className={linkClasses}>
              <div className={iconWrapperClasses}>
                <Icon icon={item.icon} />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
