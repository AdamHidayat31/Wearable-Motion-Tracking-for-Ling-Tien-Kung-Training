"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nama: "",
    username: "",
    email: "",
    password: "",
    usia: "",
    jenis_kelamin: "L",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);

    // jika berhasil -> redirect ke login
    if (data.success) {
      router.push("/auth/login");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white border rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-black text-2xl font-semibold mb-6 text-center">
          Sign Up Page
        </h1>

        <div className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="text-black border p-2 rounded-lg"
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="username"
              className="text-black border p-2 rounded-lg"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />

            <input
              type="email"
              placeholder="Email"
              className="text-black border p-2 rounded-lg"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="text-black border p-2 rounded-lg"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <input
              type="number"
              placeholder="Usia"
              className="text-black border p-2 rounded-lg"
              onChange={(e) => setForm({ ...form, usia: e.target.value })}
              required
            />

            <select
              className="text-black border p-2 rounded-lg"
              onChange={(e) =>
                setForm({ ...form, jenis_kelamin: e.target.value })
              }
              required
            >
              <option value="L">Laki-Laki</option>
              <option value="P">Perempuan</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </form>

          <p className="text-black text-sm text-center">
            Sudah punya akun?{" "}
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
