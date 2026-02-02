"use client";

import { useEffect, useState } from "react";
import SidebarHeader from "./sidebarHeader";
import SidebarItem from "./sidebarItem";
import SidebarFooter from "./sidebarFooter";
import { Wifi, Activity, History } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const activePath = pathname;

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <aside
      className="
        hidden md:flex 
        md:w-56 lg:w-64 xl:w-72 
        fixed top-0 left-0 
        h-screen border-r border-gray-200 
        flex-col justify-between transition-all z-50
      "
      style={{ backgroundColor: "#F0F5F9" }}
    >
      <div>
        <SidebarHeader />

        <nav className="flex flex-col gap-1">
          <SidebarItem
            href="/user/halaman-latihan"
            icon={Activity}
            label="Halaman Latihan"
            activePath={activePath}
          />
          <SidebarItem
            href="/user/riwayat-latihan"
            icon={History}
            label="Riwayat Latihan"
            activePath={activePath}
          />
        </nav>
      </div>

      <SidebarFooter name={user?.nama || "User"} />
    </aside>
  );
}
