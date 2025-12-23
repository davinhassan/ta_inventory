"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

    if (res.ok) {
        // --- TAMBAHKAN INI ---
        // Simpan Role user yang login agar bisa dibaca Sidebar
        localStorage.setItem("userRole", data.role); 
        localStorage.setItem("userName", data.nama || "User");
        // ---------------------

        router.push("/dashboard"); 
        router.refresh();
      } 
      else {
        setError(data.error || "Login gagal");
      }
    } catch (err) {
      setError("Gagal terhubung ke server");
    } finally {
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
