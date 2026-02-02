"use client";

export default function CardPageLatihan({ title, value }) {
  return (
    <div>
      <div className="border rounded-lg border-gray-300 p-4 flex flex flex-col justify-center items-center w-40">
        <span className="text-black">{title}</span>
        <span className="text-black">{value}</span>
      </div>
    </div>
  );
}
