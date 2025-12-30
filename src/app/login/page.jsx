"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // 1. Kita panggil "Tukang Login" resmi (NextAuth)

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 2. LOGIKA BARU:
      // Jangan pakai fetch("/api/login") lagi karena file itu sudah dihapus.
      // Pakai signIn() -> Ini otomatis nyambung ke /api/auth/[...nextauth]
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false, // Kita atur redirect sendiri biar lebih mulus
      });

      if (result?.error) {
        // Jika login gagal (Password salah / Email ga ada)
        setError("Email atau Password salah!");
        setLoading(false);
      } else {
        // 3. JIKA SUKSES:
        // Tidak perlu simpan localStorage manual lagi.
        // NextAuth sudah otomatis simpan "Cookie Sesi" yang aman.

        router.refresh(); // PENTING: Refresh biar Sidebar tau kita sudah login
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Terjadi kesalahan sistem");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-500 mb-2">
          Bengkel XYZ
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Silakan login untuk masuk
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="admin@bengkel.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
