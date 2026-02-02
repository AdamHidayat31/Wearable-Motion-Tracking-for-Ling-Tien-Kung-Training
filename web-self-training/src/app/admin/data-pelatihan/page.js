"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Eye, ChevronRight } from "lucide-react";
import CardSummaryPelatihan from "@/components/desktop/card/cardSummaryPelatihan";
import UserInfo from "@/components/desktop/ui/userInfo";
import SearchBar from "@/components/desktop/searchBar";
import ButtonViewDetail from "@/components/desktop/button/buttonViewDetail";

// FUNGSI HITUNG TOTAL SESI LATIHAN
const hitungTotalSesi = (dataPengguna) => {
  if (!Array.isArray(dataPengguna)) return 0;

  return dataPengguna.reduce((total, pengguna) => {
    return total + pengguna.sesi_latihan.length;
  }, 0);
};

const hitungSesiAktifMingguIni = (dataPengguna = []) => {
  const now = new Date();

  // 📅 Cari hari Senin minggu ini
  const day = now.getDay(); // 0=Min, 1=Sen, ... 6=Sab
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  // 📅 Akhir minggu (Minggu 23:59:59)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  let total = 0;

  dataPengguna.forEach((user) => {
    (user.sesi_latihan || []).forEach((sesi) => {
      if (!sesi.waktu_mulai) return;

      const waktuMulai = new Date(sesi.waktu_mulai);

      if (
        sesi.status_sesi === "selesai" &&
        waktuMulai >= startOfWeek &&
        waktuMulai <= endOfWeek
      ) {
        total++;
      }
    });
  });

  return total;
};

export default function KelolaPenggunaPage() {
  const [usersWithSessions, setUsersWithSessions] = useState([]);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/pengguna/data-pelatihan", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Gagal mengambil data pelatihan");
        }
        return res.json();
      })
      .then((result) => {
        console.log("DATA PELATIHAN:", result);

        // 🔑 INI YANG KURANG
        setUsersWithSessions(result.data || []);
        setUsersWithSessions(result);
      })
      .catch((error) => {
        console.error("ERROR FETCH DATA PELATIHAN:", error);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
      return;
    }

    if (role !== "admin") {
      router.push("/forbidden");
      return;
    }
  }, []);

  // DEKLARASI CONST
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // BAGIAN FUNGSI DI HALAMAN
  const filteredUsers = usersWithSessions.filter((u) =>
    (u.nama ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Fungsi pilih user
  const handleSelect = (userId) => {
    setSelectedUser(userId);
  };

  const selectedUserData = usersWithSessions.find(
    (user) => user.id_pengguna === selectedUser,
  );

  const detikKeMenit = (detik) => {
    return Math.floor((detik || 0) / 60);
  };
  // BAGIAN AMBIL 4 SESI LATIHAN TERAKHIR
  const newSession = usersWithSessions
    .flatMap((user) =>
      (user.sesi_latihan || []).map((session) => ({
        id_sesi: session.id_sesi,
        nama: user.nama,
        id_pengguna: user.id_pengguna,
        waktu_mulai: session.waktu_mulai,
        total_durasi: detikKeMenit(session.total_durasi),
        status_sesi: session.status_sesi,
        hasil_ml: session.hasil_ml,
      })),
    )
    .sort((a, b) => new Date(b.waktu_mulai) - new Date(a.waktu_mulai))
    .slice(0, 4);

  const totalSesi = useMemo(
    () => hitungTotalSesi(usersWithSessions),
    [usersWithSessions],
  );

  const hitungAkurasiSesi = (hasilML = []) => {
    if (!Array.isArray(hasilML) || hasilML.length === 0) return 0;

    const totalSkor = hasilML.reduce(
      (total, ml) => total + Number(ml.skor_gerakan || 0),
      0,
    );

    return Math.round(totalSkor / hasilML.length);
  };

  const sesiAktifMingguIni = useMemo(
    () => hitungSesiAktifMingguIni(usersWithSessions),
    [usersWithSessions],
  );

  return (
    <div>
      {/* HEADER CONTENT */}
      <div className="pb-4">
        <h1 className="text-2xl text-black font-semibold">
          Kelola Data Pelatihan
        </h1>
        <p className="text-black">Kelola dan validasi data sesi latihan.</p>
      </div>
      {/* SUMMARY CARD DATA PELATIHAN */}
      <div className="pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSummaryPelatihan
            label="Total Sesi"
            value={totalSesi}
            description="Sesi latihan yang terekam"
            icon="lucide:database"
            iconBg="#E8EEFF"
            iconColor="#1447E6"
          />
          <CardSummaryPelatihan
            label="Total Data Sensor"
            value="5Mb"
            description="Jumlah penyimpanan data sensor"
            icon="streamline:graph-arrow-increase"
            iconBg="#FAF5FF"
            iconColor="#9810FA"
          />
          <CardSummaryPelatihan
            label="Sesi Aktif"
            value={sesiAktifMingguIni}
            description="Sesi aktif minggu ini"
            icon="lucide:activity"
            iconBg="#DBFCE7"
            iconColor="#08823A"
          />
        </div>
      </div>
      {/* SESI LATIHAN TERBARU */}
      <div className="bg-white p-4 mb-4 rounded-2xl shadow-md w-full max-auto mx-auto">
        {/* Header Latihan Terbaru */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <p className="text-lg font-semibold text-gray-800">
              Sesi Latihan Terbaru
            </p>
            <p className="text-sm text-gray-500">
              Aktivitas terbaru di semua pengguna
            </p>
          </div>
          <div className="flex items-center justify-center me-10">
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
        </div>
        {/* List Card User Latihan Terbaru */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          {newSession.map((session) => (
            <div
              key={session.id_sesi} // ✅ KEY UNIK DARI DATABASE
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Info User */}
              <UserInfo
                name={session.nama ?? "-"}
                type="jadwal"
                date={session.waktu_mulai}
                time={`${session.total_durasi} menit`}
              />

              {/* Bagian kanan: akurasi & tombol */}
              <div className="flex items-center justify-between gap-2 mt-3 sm:mt-0">
                <div className="flex flex-col me-2 text-right">
                  <span className="text-sm text-gray-500">Akurasi Gerakan</span>
                  <span className="text-lg font-semibold text-green-600">
                    {hitungAkurasiSesi(session.hasil_ml)}%
                  </span>
                </div>

                <ButtonViewDetail sessionId={session.id_sesi} size="md" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 text-black">
        {/* Cari User */}
        <div
          className="flex flex-col gap-2 border rounded-xl w-full md:w-1/3"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div
            className="flex flex-col gap-2 border-b p-4"
            style={{ borderColor: "#E5E7EB" }}
          >
            <span>All Users</span>
            <SearchBar
              placeholder="Cari nama user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tambahkan max-height dan scroll */}
          <div className="ps-4 pe-4 pb-4 overflow-y-auto max-h-80">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.userId}
                  onClick={() => handleSelect(user.id_pengguna)}
                  className={`flex items-center justify-between rounded-xl p-2 m-1 shadow-sm transition cursor-pointer 
            ${
              selectedUser === user.userId
                ? "bg-blue-100 border-blue-400"
                : "bg-white hover:bg-gray-100"
            }`}
                >
                  {/* Info user */}
                  <UserInfo
                    name={user.nama}
                    type="sesi"
                    session={`${user.sesi_latihan.length} sesi`}
                    avatarBgColor="#D8D8D8"
                    avatarTextColor="#3F3F3F"
                  />

                  {/* Ikon kanan */}
                  <div key={user.userId} className="flex items-center gap-2">
                    <ChevronRight />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic text-sm ps-2 mt-2">
                Tidak ada user ditemukan
              </div>
            )}
          </div>
        </div>

        {/* Tabel Riwayat Latihan User Terpilih */}
        <div
          className="border rounded-xl w-full md:w-2/3 pt-4 pb-4"
          style={{ borderColor: "#E5E7EB" }}
        >
          {selectedUserData ? (
            <>
              <h2 className="text-lg mb-3 ps-4">
                Riwayat Latihan - {selectedUserData.name}
              </h2>

              {/* >>> Tambahkan wrapper ini <<< */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm max-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th
                        className="border-t border-b px-3 py-2 text-left"
                        style={{ borderColor: "#E5E7EB" }}
                      >
                        Sesi ID
                      </th>
                      <th
                        className="border-t border-b px-3 py-2 text-left"
                        style={{ borderColor: "#E5E7EB" }}
                      >
                        Tanggal
                      </th>
                      <th
                        className="border-t border-b px-3 py-2 text-left"
                        style={{ borderColor: "#E5E7EB" }}
                      >
                        Durasi (menit)
                      </th>
                      <th
                        className="border-t border-b px-3 py-2 text-left"
                        style={{ borderColor: "#E5E7EB" }}
                      >
                        Akurasi
                      </th>
                      <th
                        className="border-t border-b px-3 py-2 text-left"
                        style={{ borderColor: "#E5E7EB" }}
                      >
                        Status
                      </th>
                      <th
                        className="border-t border-b px-3 py-2 text-center"
                        style={{ borderColor: "#E5E7EB" }}
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedUserData &&
                      (() => {
                        const sortedSessions = [
                          ...selectedUserData.sesi_latihan,
                        ].sort((a, b) => {
                          return (
                            new Date(b.waktu_mulai) - new Date(a.waktu_mulai)
                          );
                        });

                        return sortedSessions.map((sesi) => (
                          <tr key={sesi.sessionId} className="hover:bg-gray-50">
                            <td
                              className="border-b px-3 py-2"
                              style={{ borderColor: "#E5E7EB" }}
                            >
                              {sesi.id_sesi}
                            </td>
                            <td
                              className="border-b px-3 py-2"
                              style={{ borderColor: "#E5E7EB" }}
                            >
                              {sesi.waktu_mulai}
                            </td>
                            <td
                              className="border-b px-3 py-2"
                              style={{ borderColor: "#E5E7EB" }}
                            >
                              {sesi.total_durasi}
                            </td>
                            <td
                              className="border-b px-3 py-2"
                              style={{ borderColor: "#E5E7EB" }}
                            >
                              {hitungAkurasiSesi(sesi.hasil_ml)}%
                            </td>
                            <td
                              className="border-b px-3 py-2"
                              style={{ borderColor: "#E5E7EB" }}
                            >
                              {sesi.status_sesi}
                            </td>
                            <td
                              className="border-b px-3 py-2 flex justify-center items-center"
                              style={{ borderColor: "#E5E7EB" }}
                            >
                              <ButtonViewDetail
                                sessionId={sesi.id_sesi}
                                size="sm"
                              />
                            </td>
                          </tr>
                        ));
                      })()}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div>
              <h2 className="text-lg mb-3 ps-4">Riwayat Latihan</h2>
              <div className="text-gray-500 italic ps-4">
                Pilih user untuk melihat sesi latihannya.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
