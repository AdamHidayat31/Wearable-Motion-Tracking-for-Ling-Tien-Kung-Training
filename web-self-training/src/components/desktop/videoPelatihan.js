"use client";
import { useState, useEffect } from "react";
import DropdownMenu from "../desktop/dropdownMenu";

export default function VideoSection() {
  const [selected, setSelected] = useState("All");
  const [videos, setVideos] = useState({});
  const [videoNames, setVideoNames] = useState([]);
  const [index, setIndex] = useState(0);

  // === FETCH DATA VIDEO DARI EXPRESS ===
  useEffect(() => {
    const fetchVideos = async () => {
      const res = await fetch("http://localhost:5000/api/gerakan");
      const data = await res.json();

      if (data.success) {
        // ubah array menjadi object seperti struktur sebelumnya
        const formatted = {};
        data.data.forEach((v) => {
          formatted[v.nama_gerakan] = { url: v.url_gerakan };
        });

        setVideos(formatted);
        setVideoNames(Object.keys(formatted));
      }
    };

    fetchVideos();
  }, []);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? videoNames.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === videoNames.length - 1 ? 0 : prev + 1));
  };

  // Jika data belum ada
  if (videoNames.length === 0)
    return <p className="text-center text-black">Memuat video...</p>;

  return (
    <div className="flex flex-col md:flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
      <div className="lg:self-start mx-auto md:mx-auto lg:mx-0">
        <DropdownMenu onSelect={setSelected} />
      </div>

      {/* === MODE ALL === */}
      {selected === "All" && (
        <div className="w-full max-w-xl mx-auto lg:mx-0 lg:ms-6">
          <div className="text-center mt-3 text-black font-semibold text-lg">
            {videoNames[index]}
          </div>

          <div className="relative">
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded hover:bg-black/70"
            >
              ‹
            </button>

            <iframe
              key={videoNames[index]}
              className="w-full aspect-video rounded-md"
              src={videos[videoNames[index]].url}
              title={videoNames[index]}
              allowFullScreen
            ></iframe>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded hover:bg-black/70"
            >
              ›
            </button>
          </div>

          {/* BULLET */}
          <div className="flex justify-center gap-2 mt-2">
            {videoNames.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i === index ? "bg-green-600" : "bg-gray-400"
                }`}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* === MODE PER VIDEO === */}
      {selected !== "All" && selected in videos && (
        <div className="w-full max-w-xl mx-auto lg:mx-0 lg:ms-6">
          <h3 className="text-center mt-3 text-black font-semibold text-lg">
            {selected}
          </h3>

          <iframe
            className="w-full aspect-video rounded-md"
            src={videos[selected].url}
            title={selected}
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
}
