"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    identifier: "", // email atau username
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.message);
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    // REDIRECT BY ROLE
    if (data.user.role === "admin") {
      router.push("/admin/kelola-pengguna");
    } else if (data.user.role === "user") {
      router.push("/user/halaman-latihan");
    } else {
      setError("Role pengguna tidak dikenal");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white border rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-black text-2xl font-semibold mb-6 text-center">
          Login Page
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <input
            type="text"
            placeholder="Email atau Username"
            className="text-black border p-2 rounded-lg"
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="text-black border p-2 rounded-lg"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-black text-sm text-center mt-2">
          Belum punya akun?{" "}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
