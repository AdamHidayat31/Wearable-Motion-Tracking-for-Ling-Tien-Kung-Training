"use client";

import React, { useEffect, useState } from "react";
import CardSummaryUser from "@/components/desktop/card/cardSummaryUser";
import CardLatihan from "@/components/desktop/card/cardLatihan";
import { useRouter } from "next/navigation";

export default function RiwayatLatihan() {
  const router = useRouter();
  const [dataLatihan, setDataLatihan] = useState([]);
  const [totalDurasi, setTotalDurasi] = useState(0);

  // =========================
  // HELPER DATETIME
  // =========================
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

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchSesi = fetch("http://localhost:5000/api/sesi-latihan", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());

    const fetchHasilML = fetch("http://localhost:5000/api/hasil-ml", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());

    Promise.all([fetchSesi, fetchHasilML])
      .then(([resSesi, resML]) => {
        const sesiLatihan = Array.isArray(resSesi)
          ? resSesi
          : resSesi.data || [];

        const total = (resSesi.data || []).reduce(
          (acc, item) => acc + (item.total_durasi || 0),
          0,
        );

        setTotalDurasi(total);

        console.log("RES SESI:", resSesi);

        const hasilML = Array.isArray(resML) ? resML : resML.data || [];

        const hasilGabungan = sesiLatihan.map((sesi) => {
          const mlList = hasilML.filter(
            (ml) => Number(ml.id_sesi) === Number(sesi.id_sesi),
          );

          return {
            ...sesi,
            hasil_ml: mlList,
          };
        });

        setDataLatihan(hasilGabungan);
        console.log("DATA LATIHAN:", hasilGabungan);
      })
      .catch((err) => console.error("ERROR:", err));
  }, []);

  // =========================
  // SUMMARY (DERIVED DATA)
  // =========================
  const totalSesi = dataLatihan.length;

  const rataAkurasi = (() => {
    let totalSkor = 0;
    let totalGerakan = 0;

    dataLatihan.forEach((sesi) => {
      if (!Array.isArray(sesi.hasil_ml)) return;

      sesi.hasil_ml.forEach((ml) => {
        const skor = Number(ml.skor_gerakan);

        if (!isNaN(skor)) {
          totalSkor += skor;
          totalGerakan++;
        }
      });
    });

    return totalGerakan > 0 ? Math.round(totalSkor / totalGerakan) : 0;
  })();

  const lastSession = (() => {
    if (!dataLatihan.length) return "";

    const last = [...dataLatihan].sort((a, b) => {
      return new Date(b.waktu_mulai) - new Date(a.waktu_mulai);
    })[0];
    console.log("LAST SESSION:", formatTanggal(last.waktu_mulai));
    return formatTanggal(last.waktu_mulai);
  })();

  function detikKeMenit(detik) {
    return Math.floor((detik || 0) / 60);
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="text-black">
      <div className="pb-4">
        <h1 className="text-2xl text-[#363636] font-semibold">
          Riwayat Latihan
        </h1>
        <p className="text-[#9EA7BA]">
          Pantau hasil dan perkembangan latihan Anda di sini.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSummaryUser
          icon="lucide:calendar"
          label="Total Sesi Latihan"
          value={totalSesi}
          iconColor="#5B9BD5"
          iconBgColor="#D2E4F4"
        />
        <CardSummaryUser
          icon="lucide:clock"
          label="Total Durasi Latihan"
          value={detikKeMenit(totalDurasi) + " menit"}
          iconColor="#155DFC"
          iconBgColor="#D2E4F4"
        />
        <CardSummaryUser
          icon="streamline:graph-arrow-increase-solid"
          label="Rata-rata Akurasi Gerakan"
          value={rataAkurasi + "%"}
          iconColor="#00A63E"
          iconBgColor="#DBFCE7"
        />
        <CardSummaryUser
          icon="lucide:flag"
          label="Terakhir Latihan"
          value={lastSession}
          iconColor="#9F21FA"
          iconBgColor="#F3E8FF"
        />
      </div>

      <div className="pt-4">
        <p className="text-[#9EA7BA]"> Latihan Terakhir</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...dataLatihan]
            .sort((a, b) => {
              return new Date(b.waktu_mulai) - new Date(a.waktu_mulai);
            })
            .map((item) => (
              <CardLatihan
                key={item.id_sesi}
                tanggal={item.waktu_mulai}
                jam={formatJam(item.waktu_mulai)}
                menit={detikKeMenit(item.total_durasi)}
                skor={
                  item.hasil_ml?.length
                    ? Math.round(
                        item.hasil_ml.reduce(
                          (acc, ml) => acc + (ml.skor_gerakan || 0),
                          0,
                        ) / item.hasil_ml.length,
                      )
                    : 0
                }
                status={item.status_sesi}
                onClick={() =>
                  router.push(`/user/riwayat-latihan/${item.id_sesi}`)
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
}
