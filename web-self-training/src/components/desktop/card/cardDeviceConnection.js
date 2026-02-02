"use client";

import { User } from "lucide-react";

export default function CardDeviceConnection({
  name = "John Doe",
  userId = "U001",
  devices = [],
}) {
  const onlineDevices = devices.filter((d) => d.status_koneksi === "online");
  const offlineDevices = devices.filter((d) => d.status_koneksi === "offline");

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 transition-all duration-200">
      {/* Bagian atas: Icon, Nama/ID, dan Status */}
      <div className="flex items-center justify-between">
        {/* Kiri: Icon + Nama + ID */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl">
            <User className="w-6 h-6 text-blue-600" />
          </div>

          {/* Nama dan ID */}
          <div>
            <h2 className="text-base font-semibold text-gray-900">{name}</h2>
            <p className="text-sm text-gray-500">ID: {userId}</p>
          </div>
        </div>

        {/* Kanan: Status Device */}
        <div className="flex flex-col gap-1 text-sm">
          {/* Online */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-700">
              Online Devices{" "}
              <span className="font-semibold text-green-600">
                {onlineDevices.length}
              </span>
            </span>
          </div>

          {/* Offline */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-gray-700">
              Offline Devices{" "}
              <span className="font-semibold text-red-600">
                {offlineDevices.length}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Garis pemisah */}
      <div className="my-3 border-t border-gray-100" />

      {/* Bagian bawah: Daftar Device */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Daftar Perangkat:
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {devices.map((device, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
            >
              <span className="text-gray-700">{device.nama_perangkat}</span>

              {/* Ganti teks dengan lingkaran indikator */}
              <span
                className={`w-3 h-3 rounded-full ${
                  device.status_koneksi === "online"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
