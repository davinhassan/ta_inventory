"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save, User, Mail, Lock } from "lucide-react"; // Tambah ikon
import Link from "next/link";

export default function TambahUserPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const myRole = session?.user?.role;

  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    role: "STAFF",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("User berhasil dibuat!");
        router.push("/dashboard/pengguna");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal membuat user");
      }
    } catch (err) {
      alert("Error sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN"]}>
      <div className="p-8 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard/pengguna"
            className="p-2 bg-gray-800 text-gray-400 rounded hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Tambah User Baru</h1>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Nama */}
            <div>
              <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <User size={14} /> Nama Lengkap
              </label>
              <input
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Contoh: Budi Santoso"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>

            {/* Input Email */}
            <div>
              <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <Mail size={14} /> Email Login
              </label>
              <input
                type="email"
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="budi@bengkel.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Input Password */}
            <div>
              <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {/* Dropdown Role Pintar */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Jabatan / Role
              </label>
              <select
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STAFF">STAFF</option>
                {/* Logika: Sembunyikan Admin/Manajer jika yg login cuma Admin */}
                {myRole !== "ADMIN" && <option value="ADMIN">ADMIN</option>}
                {myRole === "PEMILIK" && (
                  <option value="MANAJER">MANAJER</option>
                )}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded mt-4 flex justify-center items-center gap-2 transition"
            >
              {loading ? (
                "Menyimpan..."
              ) : (
                <>
                  <Save size={18} /> Buat User
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
