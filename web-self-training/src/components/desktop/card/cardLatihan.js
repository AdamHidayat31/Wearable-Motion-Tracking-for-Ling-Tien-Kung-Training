"use client";
import { Calendar, Clock } from "lucide-react";

export default function CardLatihan({
  icon: Icon = Calendar,
  tanggal = "2025-11-20",
  jam = "10:00",
  menit = 60,
  skor = 0,
  status = "Belum Dinilai",
  onClick = () => {},
}) {
  const formatTanggal = (tgl) => {
    if (!tgl) return "";

    const bulanSingkat = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const parts = tgl.split("-");
    let hari, bulan, tahun;

    // yyyy-mm-dd
    if (parts[0].length === 4) {
      tahun = parts[0];
      bulan = parts[1];
      hari = parts[2];
    }
    // dd-mm-yyyy
    else {
      hari = parts[0];
      bulan = parts[1];
      tahun = parts[2];
    }

    const namaBulan = bulanSingkat[parseInt(bulan, 10) - 1] || "";

    return `${parseInt(hari, 10)} ${namaBulan} ${tahun}`;
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer flex flex-col gap-4 p-4 rounded-2xl border border-[#DCE3EA] shadow-lg bg-white hover:shadow-xl transition-all duration-200"
    >
      {/* Bagian Atas Card */}
      <div className="flex border-b-2 border-[#DCE3EA] pb-2">
        <div className="flex items-center justify-center rounded bg-[#EFF5FB] p-3">
          <Icon size={24} className="text-[#5B9BD5]" />
        </div>

        <div className="ms-2">
          <div className="font-medium text-[#535353]">
            {formatTanggal(tanggal)}
          </div>

          <div className="flex items-center text-[#9EA7BA]">
            <Clock size={15} className="inline-block mr-1" />
            <div className="font-medium">
              {jam} WIB - {menit} menit
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Bawah Card */}
      <div className="grid grid-cols-2 p-3 rounded-xl text-[#535353]">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-gray-500">Skor</span>
          <span className="text-lg">{skor}%</span>
        </div>

        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-gray-500">Status</span>
          <span>{status}</span>
        </div>
      </div>
    </div>
  );
}
