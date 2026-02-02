"use client";

// AdminLayout.jsx
import Sidebar from "@/components/desktop/sidebar/admin/sidebar";
import HeaderAdmin from "@/components/mobile/headerAdmin";
import BottomNavAdmin from "@/components/mobile/buttomNavAdmin"; // Pastikan path benar

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Konten utama */}
      <main
        className="
          flex-1 
          p-6 
          bg-gray-50 
          overflow-y-auto 
          /* Margin otomatis HILANG di bawah md: */
          md:ml-56 lg:ml-64 xl:ml-72 
          /* Padding bottom untuk memberi ruang pada BottomNav saat di mobile/tablet */
          pb-20 md:pb-6 
          transition-all
        "
      >
        <HeaderAdmin className="block md:hidden" />
        {children}
      </main>

      {/* Bottom Navigation: Tampil di layar kecil, disembunyikan di md: ke atas */}
      <BottomNavAdmin className="block md:hidden" />
    </div>
  );
}
