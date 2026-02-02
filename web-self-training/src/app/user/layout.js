import Sidebar from "@/components/desktop/sidebar/user/sidebar";
import HeaderUser from "@/components/mobile/headerUser";
import BottomNavUser from "@/components/mobile/buttonNavUser";

export const metadata = {
  title: "Motion Tracking System - Ling Tien Kung",
};

export default function UserLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Konten utama */}
      <main
        className="
          flex-1
          p-6
          bg-[#F5F8FB]
          overflow-y-auto
          md:ml-56 lg:ml-64 xl:ml-72
          pb-20 md:pb-6
          transition-all
        "
      >
        {/* Header User – hanya mobile */}
        <HeaderUser className="block md:hidden" />

        {children}
      </main>

      {/* Bottom Navigation – hanya mobile */}
      <BottomNavUser className="block md:hidden" />
    </div>
  );
}
