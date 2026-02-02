"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Timer } from "lucide-react";
import { Icon } from "@iconify/react";
import CardSkorGerakan from "@/components/desktop/card/cardSkorGerakan";

export default function LatihanDetailPage({ params }) {
  const { id_sesi } = use(params);
  const router = useRouter();

  const [sessionData, setSessionData] = useState(null);

  // =========================
  // FETCH DATA DETAIL SESI
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id_sesi) return;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const fetchDetailSesi = fetch(
      `http://localhost:5000/api/sesi-latihan/${id_sesi}`,
      { headers },
    ).then(async (res) => {
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      return JSON.parse(text);
    });

    const fetchGerakan = fetch(`http://localhost:5000/api/gerakan`, {
      headers,
    }).then(async (res) => {
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      return JSON.parse(text);
    });

    Promise.all([fetchDetailSesi, fetchGerakan])
      .then(([detailRes, gerakanRes]) => {
        console.log("DETAIL SESI:", detailRes);
        console.log("LIST GERAKAN:", gerakanRes);

        // 🔑 buat map id_gerakan -> nama_gerakan
        const gerakanMap = {};
        gerakanRes.data.forEach((g) => {
          gerakanMap[g.id_gerakan] = g.nama_gerakan;
        });

        // 🔗 gabungkan hasil_ml + nama_gerakan
        const hasilMLWithNama = detailRes.data.hasil_ml.map((h) => ({
          ...h,
          nama_gerakan: gerakanMap[h.id_gerakan] || "Gerakan tidak diketahui",
        }));

        const finalData = {
          ...detailRes.data,
          hasil_ml: hasilMLWithNama,
        };

        console.log("FINAL DATA (MERGED):", finalData);

        setSessionData(finalData);
      })
      .catch((err) => {
        console.error("ERROR FETCH DETAIL LATIHAN:", err.message);
      });
  }, [id_sesi]);

  const parseDateTime = (datetime) => {
    if (!datetime) return null;
    return new Date(datetime);
  };

  const formatTanggal = (datetime) => {
    if (!datetime) return "";
    const date = parseDateTime(datetime);

    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatJam = (datetime) => {
    if (!datetime) return "";

    const date = new Date(datetime);

    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  function formatPersen(nilai) {
    if (nilai == null) return "0.00%";
    return `${nilai.toFixed(2)}%`;
  }

  const rataAkurasiSesi = (() => {
    if (!Array.isArray(sessionData?.hasil_ml)) return 0;

    let totalSkor = 0;

    sessionData.hasil_ml.forEach((ml) => {
      const skor = Number(ml.skor_gerakan);
      if (!isNaN(skor)) {
        totalSkor += skor;
      }
    });

    return sessionData.hasil_ml.length > 0
      ? Math.round(totalSkor / sessionData.hasil_ml.length)
      : 0;
  })();
  function detikKeMenit(detik) {
    return Math.floor((detik || 0) / 60);
  }

  return (
    <div className="space-y-4 text-black">
      <div className="flex items-center">
        <button
          className="flex items-center p-2 rounded-lg border text-black"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5 me-2" />
          Kembali
        </button>
        <div className="ms-6">
          <h1 className="text-2xl font-bold">Detail Sesi Latihan</h1>
          <p>{sessionData?.id_sesi}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 bg-[#EAF4FE] p-4 rounded-lg border border-[#87B5DF]">
        <div className="flex items-center m-2">
          <div className="bg-[#D2E4F4] rounded-full p-3">
            <Calendar className="text-[#5B9BD5]" />
          </div>
          <div className="flex flex-col ms-2">
            <span className="text-[#9A9A9A]">Tanggal Latihan</span>
            <span>{formatTanggal(sessionData?.waktu_mulai)}</span>
          </div>
        </div>

        <div className="flex items-center m-2">
          <div className="bg-[#D2E4F4] rounded-full p-3">
            <Clock className="text-[#5B9BD5]" />
          </div>
          <div className="flex flex-col ms-2">
            <span className="text-[#9A9A9A]">Waktu Latihan</span>
            <span>{formatJam(sessionData?.waktu_mulai)} WIB</span>
          </div>
        </div>

        <div className="flex items-center m-2">
          <div className="bg-[#D2E4F4] rounded-full p-3">
            <Timer className="text-[#5B9BD5]" />
          </div>
          <div className="flex flex-col ms-2">
            <span className="text-[#9A9A9A]">Durasi Latihan</span>
            <span>{detikKeMenit(sessionData?.total_durasi)} Menit</span>
          </div>
        </div>
      </div>

      <div className="mt-4 border rounded-lg border-[#87B5DF] bg-[#EAF4FE] p-2">
        <p className="text-black">Training Summary</p>

        <div className="flex">
          <div className="flex m-4 p-2 bg-white items-center gap-4 border rounded-lg border-[#87B5DF] w-1/3">
            <div className="bg-[#D2E4F4] rounded-full p-6">
              <Icon
                icon="streamline:graph-arrow-increase-solid"
                width={30}
                height={30}
                className="text-[#5B9BD5]"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Rata Rata Akurasi Gerakan
              </h2>
              <p>{rataAkurasiSesi}</p>
            </div>
          </div>

          <div className="w-full m-4">
            {sessionData?.hasil_ml?.map((g, index) => (
              <CardSkorGerakan
                key={index}
                namaGerakan={g.nama_gerakan}
                skorGerakan={formatPersen(g.skor_gerakan)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
