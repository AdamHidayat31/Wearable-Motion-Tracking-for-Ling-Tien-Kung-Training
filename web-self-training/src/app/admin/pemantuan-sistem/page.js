"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Activity, Wifi, WifiOff } from "lucide-react";
import CardSummary from "@/components/desktop/card/cardSummary";
import CardDeviceConnection from "@/components/desktop/card/cardDeviceConnection";

function calculateDeviceStats(data) {
  // Flatten semua perangkat dari semua user
  const allDevices = data.flatMap((u) => u.perangkat);

  const totalPerangkatIoT = allDevices.length;

  const onlineDevices = allDevices.filter(
    (d) => d.status_koneksi === "online"
  ).length;

  const offlineDevices = allDevices.filter(
    (d) => d.status_koneksi === "offline"
  ).length;

  return {
    totalPerangkatIoT,
    onlineDevices,
    offlineDevices,
  };
}

export default function KelolaPenggunaPage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("auth/login");
      return;
    }

    if (role !== "admin") {
      router.push("/forbidden");
      return;
    }
  }, []);

  const users = [
    {
      userId: "U002",
      name: "Mike Johnson",
      devices: [
        { nameIotDevice: "Tangan Kiri", iotDeviceIsActive: true },
        { nameIotDevice: "Kaki Kiri", iotDeviceIsActive: true },
      ],
    },
    {
      userId: "U003",
      name: "Sarah Smith",
      devices: [
        { nameIotDevice: "Tangan Kiri", iotDeviceIsActive: false },
        { nameIotDevice: "Kaki Kiri", iotDeviceIsActive: false },
      ],
    },
  ];

  const [dataUsersIoT, setDataUsersIoT] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadData() {
      try {
        const [resUsers, resDevices] = await Promise.all([
          fetch("http://localhost:5000/api/pengguna", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/perangkat-iot", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const dataUser = await resUsers.json();
        const dataDevices = await resDevices.json();

        if (dataUser.success && dataDevices.success) {
          // Filter hanya user role "user" dan status "active"
          const filteredUser = dataUser.data.filter(
            (u) => u.role === "user" && u.status_pengguna === "active"
          );

          // Gabungkan dengan perangkat berdasarkan id_pengguna
          const merged = filteredUser.map((u) => ({
            ...u, // semua field user
            perangkat: dataDevices.data.filter(
              (d) => d.id_pengguna === u.id_pengguna
            ),
          }));

          setDataUsersIoT(merged);

          console.log("=== DATA GABUNGAN ===");
          console.log(merged);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, []);

  // Hitung statistik perangkat menggunakan useMemo untuk optimasi
  const stats = calculateDeviceStats(dataUsersIoT);
  return (
    <div>
      <div className="pb-4">
        <h1 className="text-2xl text-black font-semibold">Pemantuan Sistem</h1>
        <p className="text-black">
          Monitoring IoT devices, system health, and error notifications.
        </p>
      </div>
      <div className="pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSummary
            icon={Activity}
            title="Total Devices"
            value={stats.totalPerangkatIoT}
            iconBgColor="#EFF6FF"
            iconColor="#155DFC"
          />
          <CardSummary
            icon={Wifi}
            title="Online Devices"
            value={stats.onlineDevices}
            iconBgColor="#DBFCE7"
            iconColor="#08823A"
          />
          <CardSummary
            icon={WifiOff}
            title="Offline Devices"
            value={stats.offlineDevices}
            iconBgColor="#FEF2F2"
            iconColor="#E80712"
          />
        </div>
      </div>

      {/* IoT CONNECTION STATUS */}
      <div className="pt-4 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {dataUsersIoT.map((dataUsersIoT) => (
            <CardDeviceConnection
              key={dataUsersIoT.id_pengguna}
              name={dataUsersIoT.nama}
              userId={dataUsersIoT.id_pengguna}
              devices={dataUsersIoT.perangkat}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
