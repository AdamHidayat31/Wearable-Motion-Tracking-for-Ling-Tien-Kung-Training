"use client";

import { useState, useRef, useEffect } from "react";
import ButtonIconUser from "@/components/desktop/button/buttonIconUser";
import CardPageLatihan from "@/components/desktop/card/cardPageLatihan";
import VideoSection from "@/components/desktop/videoPelatihan";

export default function HalamanLatihan() {
  const [activeButton, setActiveButton] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState("Belum Mulai");

  const intervalRef = useRef(null);

  // ========== TIMER REALTIME ==========
  useEffect(() => {
    if (status === "Berjalan" && startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000);
        setDuration(diff);
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [status, startTime]);
  useEffect(() => {
    if (status === "Selesai") {
      setActiveButton(null);
    }
  }, [status]);

  const sendCommand = async (command) => {
    try {
      await fetch(`http://localhost:5000/iotcontrol/${command.toLowerCase()}`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Gagal kirim perintah:", err);
    }
  };
  // ========== START ==========
  const handleStart = async (buttonName) => {
    setActiveButton(buttonName);
    await sendCommand("start");

    const now = Date.now();

    if (status === "Selesai") {
      // 🔥 START ULANG DARI NOL
      setDuration(0);
      setStartTime(now);
    } else if (!startTime) {
      setStartTime(now);
    } else {
      // ▶️ LANJUT SETELAH STOP
      setStartTime(now - duration * 1000);
    }

    setStatus("Berjalan");
    clearInterval(intervalRef.current);
  };

  const handleStop = async (buttonName) => {
    setActiveButton(buttonName);

    await sendCommand("stop");

    if (!startTime) return;

    clearInterval(intervalRef.current);
    setStatus("Terhenti");
  };

  // ========== FINISH ==========
  const handleFinish = async (buttonName) => {
    setActiveButton(buttonName);

    if (!startTime) return;

    try {
      const res = await fetch("http://localhost:5000/iotcontrol/finish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) return console.error("Gagal finish:", data);

      clearInterval(intervalRef.current);

      setStatus("Selesai");
      setStartTime(null); // ⬅️ penting
    } catch (err) {
      console.error("Error FINISH:", err);
    }
  };

  // ========= FORMAT DURATION ==========
  const formatDuration = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div>
      {/* HEADER CONTENT */}
      <div className="pb-4">
        <h1 className="text-2xl text-[#363636] font-semibold">
          Halaman Latihan
        </h1>
        <p className="text-[#9EA7BA]">Ayo Mulai Latihan Ling Tien Kung Anda!</p>
      </div>
      {/* MAIN CONTENT */}
      <div>
        {/* Bagian Pilih Gerakan */}
        <div className="">
          <VideoSection />
        </div>
        <p className="text-[#9EA7BA] text-center m-3">
          Tekan tombol “START” untuk memulai latihan dan merekam setiap gerakan
          Anda.
        </p>
        {/* Bagian Button Perintah */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full mt-4">
          <ButtonIconUser
            text="START"
            icon="gravity-ui:triangle-right"
            bgColor="#FFFFFF"
            textColor="#363636"
            borderColor="#363636"
            activeBgColor="#28A745"
            activeTextColor="#FFFFFF"
            className="w-full sm:flex-1"
            isClicked={activeButton === "START"}
            disabled={status === "Selesai"}
            onClick={() => handleStart("START")}
          />

          {/* STOP */}
          <ButtonIconUser
            text="STOP"
            icon="gravity-ui:square"
            bgColor="#FFFFFF"
            textColor="#363636"
            borderColor="#363636"
            activeBgColor="#FFC107"
            activeTextColor="#363636"
            className="w-full sm:flex-1"
            isClicked={activeButton === "STOP"}
            disabled={status === "Selesai"}
            onClick={() => handleStop("STOP")}
          />

          {/* FINISH */}
          {status !== "Selesai" && (
            <ButtonIconUser
              text="FINISH"
              icon="gravity-ui:circle-check"
              bgColor="#FFFFFF"
              textColor="#363636"
              borderColor="#363636"
              activeBgColor="#007BFF"
              activeTextColor="#FFFFFF"
              className="w-full sm:flex-1"
              isClicked={activeButton === "FINISH"}
              onClick={() => handleFinish("FINISH")}
            />
          )}
        </div>
        <div className="flex justify-center space-x-2 mt-6">
          <CardPageLatihan title="Status" value={status} />
          <CardPageLatihan title="Duration" value={formatDuration(duration)} />
        </div>
      </div>
    </div>
  );
}
