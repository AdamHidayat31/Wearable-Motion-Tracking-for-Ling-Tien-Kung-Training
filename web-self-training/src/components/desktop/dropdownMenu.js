"use client"; // kalau di Next.js App Router, hapus jika tidak perlu
import { useEffect, useRef, useState } from "react";

const items = [
  "All",
  "Lipat Pinggang",
  "Kocok Seluruh Badan",
  "Jongkok Delapan Titik",
];

export default function DropdownMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(items[0]);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleSelect = (value) => {
    setSelected(value);
    setOpen(false);
    if (onSelect) onSelect(value);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className={`inline-flex justify-between items-center gap-2 w-60 px-3 py-2 border rounded-md shadow-sm
          ${
            open
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-800 border-gray-300"
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400`}
      >
        <span className="truncate">{selected}</span>
        <svg
          className={`h-4 w-4 transform transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.063a.75.75 0 111.12 1.006l-4.25 4.656a.75.75 0 01-1.08 0L5.25 8.28a.75.75 0 01-.02-1.07z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* panel */}
      {open && (
        <ul
          ref={panelRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden"
        >
          {items.map((it) => (
            <li
              key={it}
              role="menuitem"
              tabIndex={0}
              onClick={() => handleSelect(it)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(it);
                }
              }}
              className={`cursor-pointer px-4 py-2 text-sm flex items-center justify-between ${
                it === selected
                  ? "bg-green-50 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="truncate">{it}</span>
              {it === selected && (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 10-1.408-1.42L7.5 11.668 4.704 8.88a1 1 0 10-1.408 1.42l3.25 3.25a1 1 0 001.408 0l6.75-6.25z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
