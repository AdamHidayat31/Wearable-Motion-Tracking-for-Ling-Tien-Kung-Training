"use client";

import { Calendar, Clock } from "lucide-react";

export default function UserInfo({
  name,
  type = "email", // default
  email,
  date,
  time,
  session,
  avatarBgColor = "#DBEAFE", // default bg-blue-100
  avatarTextColor = "#1D4ED8", // default text-blue-700
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: avatarBgColor }}
      >
        <span className="font-semibold" style={{ color: avatarTextColor }}>
          {name.charAt(0)}
        </span>
      </div>

      {/* Info */}
      <div>
        <p className="text-sm font-medium text-gray-800">{name}</p>

        {/* Right content hanya jika type bukan "none" */}
        {type !== "none" && (
          <div className="text-xs text-gray-500 flex items-center gap-2">
            {type === "email" && <span>{email}</span>}

            {type === "jadwal" && (
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{time}</span>
                </div>
              </div>
            )}

            {type === "sesi" && <span>{session}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
