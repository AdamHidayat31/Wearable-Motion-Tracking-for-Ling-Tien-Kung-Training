"use client";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ButtonViewDetail({ userId, sessionId, size = "md" }) {
  const router = useRouter();

  const handleViewDetail = () => {
    router.push(`/admin/data-pelatihan/${sessionId}`);
  };

  // 🎨 Tentukan ukuran berdasarkan prop `size`
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      onClick={handleViewDetail}
      className={`flex items-center justify-center border border-black text-black rounded-lg font-medium hover:bg-gray-200 transition ${sizeClasses[size]}`}
    >
      <Eye className={`${iconSize[size]} mr-1`} />
      View Detail
    </button>
  );
}
