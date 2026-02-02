import Sidebar from "@/components/desktop/sidebar/admin/sidebar";
import KelolaPenggunaPage from "./admin/kelola-pengguna/page";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/admin/kelola-pengguna");
}
