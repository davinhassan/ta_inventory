"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Wrench, Mail, Lock, Loader2 } from "lucide-react"; // Tambah ikon pemanis

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
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau Password salah!");
        setLoading(false);
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Terjadi kesalahan sistem");
      setLoading(false);
    }
  };

  return (
    // 1. Wrapper Luar: Flex center + Padding horizontal (px-4) agar tidak nempel tepi di HP
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 px-4">
      
      {/* 2. Kartu Login: Lebar max-w-md (448px), Shadow besar, Border halus */}
      <div className="w-full max-w-md bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-800">
        
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="bg-blue-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <Wrench className="text-blue-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Bengkel XYZ
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Silakan login untuk mengakses dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Input Email dengan Ikon */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5 ml-1">
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition" />
              </div>
              <input
                type="email"
                className="w-full bg-gray-800/50 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition placeholder-gray-600"
                placeholder="admin@bengkel.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Input Password dengan Ikon */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5 ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition" />
              </div>
              <input
                type="password"
                className="w-full bg-gray-800/50 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition placeholder-gray-600"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" /> Memproses...
              </>
            ) : (
              "Masuk Dashboard"
            )}
          </button>
        </form>

        {/* Footer Kecil (Opsional) */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Bengkel XYZ System
          </p>
        </div>
      </div>
    </div>
  );
}