"use client";

import React, { use, useEffect, useState } from "react";
import ButtonNonIcon from "@/components/desktop/button/buttonNonIcon";
import ButtonIcon from "@/components/desktop/button/buttonIcon";
import CardSummaryDetail from "@/components/desktop/card/cardSummaryDetail";
import { Award, Calendar, Timer } from "lucide-react";
import GrafikSensor from "@/components/desktop/ui/charts";
import { useRouter } from "next/navigation";

export default function DetailRiwayatLatihan({ params }) {
  const { id_sesi } = use(params);
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // =========================
  // FETCH DETAIL SESI
  // =========================
  useEffect(() => {
    if (!id_sesi) return;

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ Token tidak ditemukan");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // =========================
        // FETCH DETAIL SESI
        // =========================
        const detailRes = await fetch(
          `http://localhost:5000/api/sesi-latihan/detail/${id_sesi}`,
          { headers },
        );
        const detailResult = await detailRes.json();

        if (!detailResult.success) {
          console.warn("⚠️ DETAIL SESI GAGAL:", detailResult.message);
          return;
        }

        // =========================
        // FETCH MASTER GERAKAN
        // =========================
        const gerakanRes = await fetch("http://localhost:5000/api/gerakan", {
          headers,
        });
        const gerakanResult = await gerakanRes.json();

        if (!gerakanResult.success) {
          return;
        }

        // =========================
        // MAP id_gerakan → nama_gerakan
        // =========================
        const gerakanMap = {};
        gerakanResult.data.forEach((g) => {
          gerakanMap[g.id_gerakan] = g.nama_gerakan;
        });

        // =========================
        // MERGE HASIL ML + NAMA GERAKAN
        // =========================
        const hasilMLMerged = detailResult.data.hasil_ml.map((ml) => ({
          ...ml,
          nama_gerakan: gerakanMap[ml.id_gerakan] || "Gerakan tidak diketahui",
        }));

        const finalData = {
          ...detailResult.data,
          hasil_ml: hasilMLMerged,
        };

        console.log("✅ FINAL DATA (MERGED):", finalData);

        setSession(finalData);
      } catch (err) {
        console.error("❌ FETCH DETAIL ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id_sesi]);

  // =========================
  // LOADING & NOT FOUND
  // =========================
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Memuat data sesi...</div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center text-red-600">
        Data sesi tidak ditemukan 😢
      </div>
    );
  }

  const handleDeleteSession = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/sesi-latihan/${id_sesi}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await res.json();

      if (result.success) {
        setShowDeletePopup(false);
        router.push("/admin/data-pelatihan");
      } else {
        setDeleteError(result.message || "Gagal menghapus sesi");
      }
    } catch (err) {
      console.error("DELETE SESSION ERROR:", err);
      setDeleteError("Terjadi kesalahan saat menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/sesi-latihan/download/${id_sesi}?format=${format}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Gagal download data");
        return;
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download =
        format === "csv" ? `sesi_${id_sesi}.csv` : `sesi_${id_sesi}.json`;

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("DOWNLOAD ERROR:", err);
      alert("Terjadi kesalahan saat download");
    }
  };

  const rataAkurasiSesi = (() => {
    if (!Array.isArray(session?.hasil_ml)) return 0;

    let totalSkor = 0;

    session.hasil_ml.forEach((ml) => {
      const skor = Number(ml.skor_gerakan);
      if (!isNaN(skor)) {
        totalSkor += skor;
      }
    });

    return session.hasil_ml.length > 0
      ? Math.round(totalSkor / session.hasil_ml.length)
      : 0;
  })();

  return (
    <div className="">
      {/* HEADER */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <ButtonIcon
            text="Kembali"
            icon="lucide:arrow-left"
            bgColor="#FFFFFF"
            textColor="#363636"
            borderColor="#363636"
            onClick={() => router.push("/admin/data-pelatihan")}
          />
          <div className="text-black">
            <h1 className="text-xl font-bold">Detail Riwayat Latihan</h1>
            <div className="flex gap-2">
              <span>{session.nama}</span>
              <span>{session.id_sesi}</span>
            </div>
          </div>
        </div>
        <ButtonNonIcon
          text="Hapus Sesi Ini"
          bgColor="#FF0000"
          textColor="#ffffffff"
          borderColor="#FF0000"
          className="w-[170px] sm:w[55px]"
          onClick={() => setShowDeletePopup(true)}
        />
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSummaryDetail
          type="three"
          icon={Calendar}
          iconColor="#9810FA"
          iconBg="#FAF5FF"
          label="Tanggal Latihan"
          tanggal={session.waktu_mulai?.split(" ")[0]}
          waktu={session.waktu_mulai?.split(" ")[1]}
        />
        <CardSummaryDetail
          type="two"
          icon={Timer}
          iconColor="#1447E6"
          iconBg="#DEECFF"
          label="Durasi"
          value={session.total_durasi + " menit"}
        />
        <CardSummaryDetail
          type="two"
          icon={Award}
          iconColor="#A65F00"
          iconBg="#FEF9C2"
          label="Akurasi Gerakan"
          value={rataAkurasiSesi}
        />
      </div>
      <div className="mt-4 border border-[#D8D8D8] rounded-xl p-4 bg-white ">
        <div className="text-black"> GERAKAN YANG DILAKUKAN</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {session?.hasil_ml?.length > 0 ? (
            session.hasil_ml.map((ml, index) => (
              <div
                key={index}
                className="flex justify-between border border-[#D8D8D8] rounded pb-1"
              >
                <div className="p-2 text-black flex flex-col">
                  <span className="font-medium">
                    {ml.nama_gerakan || `Gerakan #${ml.id_gerakan}`}
                  </span>
                </div>

                <span
                  className={`font-semibold p-2 ${
                    ml.skor_gerakan >= 80
                      ? "text-green-600"
                      : ml.skor_gerakan >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {ml.skor_gerakan}%
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Tidak ada data hasil ML</p>
          )}
        </div>
      </div>

      {/* GRAFIK SENSOR */}
      <div className="pt-4">
        {session.sensorData?.map((sensor, index) => {
          if (!sensor?.readings) return null;

          console.log(`📈 SENSOR ${sensor.sensorName}:`, sensor.readings);

          return (
            <div
              key={index}
              className="bg-white border rounded-xl shadow-sm p-5 mb-4"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-[#3F3F3F]">
                  {sensor.sensorName}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-6">
                <GrafikSensor
                  label="Accelerometer (m/s²)"
                  data={sensor}
                  series={[
                    { key: "ax", name: "AX" },
                    { key: "ay", name: "AY" },
                    { key: "az", name: "AZ" },
                  ]}
                />

                <GrafikSensor
                  label="Gyroscope (raw)"
                  data={sensor}
                  series={[
                    { key: "gx", name: "GX" },
                    { key: "gy", name: "GY" },
                    { key: "gz", name: "GZ" },
                  ]}
                />

                <GrafikSensor
                  label="Magnetometer (uT)"
                  data={sensor}
                  series={[
                    { key: "mx", name: "MX" },
                    { key: "my", name: "MY" },
                    { key: "mz", name: "MZ" },
                  ]}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center space-x-2">
        <ButtonNonIcon
          text="Download CSV"
          bgColor="#155DFC"
          textColor="#ffffffff"
          borderColor="#155DFC"
          custWidth="w-[170px]"
          className="sm:w[55px]"
          onClick={() => handleDownload("csv")}
        />
        <ButtonNonIcon
          text="Download JSON"
          bgColor="#FFFFFF"
          textColor="#363636"
          borderColor="#363636"
          custWidth="w-[170px]"
          className="sm:w[55px] ml-2"
          onClick={() => handleDownload("json")}
        />
      </div>
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96">
            <h3 className="font-semibold text-black mb-3">
              Hapus Sesi Latihan
            </h3>

            <p className="text-sm text-gray-700 mb-4">
              Apakah kamu yakin ingin menghapus sesi latihan ini?
              <br />
              <span className="text-red-600 font-medium">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </p>

            {deleteError && (
              <div className="text-sm text-red-600 mb-3">❌ {deleteError}</div>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowDeletePopup(false)}
                disabled={isDeleting}
              >
                Batal
              </button>

              <button
                className="px-4 py-2 rounded bg-gray-200 text-black hover:bg-gray-400 disabled:opacity-50"
                onClick={handleDeleteSession}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
