"use client";

import { useEffect, useState } from "react";
import SidebarHeader from "./sidebarHeader";
import SidebarItem from "./sidebarItem";
import SidebarFooter from "./sidebarFooter";
import { Users, Activity, Database, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Sidebar({ defaultActive }) {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const activePath = pathname === "/" ? `/${defaultActive}` : pathname;

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
    h-screen bg-white border-r border-gray-200 
    flex-col justify-between transition-all z-50
  "
    >
      <div>
        <SidebarHeader />

        <nav className="flex flex-col gap-1">
          <SidebarItem
            href="/admin/kelola-pengguna"
            icon={Users}
            label="Kelola Pengguna"
            activePath={activePath}
          />
          {/* <SidebarItem
            href="/admin/pemantuan-sistem"
            icon={Activity}
            label="Pemantauan Sistem"
            activePath={activePath}
          /> */}
          <SidebarItem
            href="/admin/data-pelatihan"
            icon={Database}
            label="Data Pelatihan"
            activePath={activePath}
          />
        </nav>
      </div>

      <SidebarFooter
        name={user?.nama || "Admin"}
        email={user?.email || "admin@gmail.com"}
      />
    </aside>
  );
}
