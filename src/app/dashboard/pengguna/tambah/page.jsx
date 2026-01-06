"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import Session
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save, User, Mail, Lock, Shield } from "lucide-react";

export default function TambahUserPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    role: "STAFF", // Default
  });

  const currentUserRole = session?.user?.role;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal tambah user");

      alert("User berhasil ditambahkan!");
      router.push("/dashboard/pengguna");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Pastikan Manajer dan Admin bisa masuk sini
    <AuthGuard allowedRoles={["MANAJER", "PEMILIK", "ADMIN"]}>
      <div className="p-8 max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft size={20} /> Kembali
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">Tambah User Baru</h1>

        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl space-y-6">
          
          {/* NAMA */}
          <div>
            <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
              <User size={16}/> Nama Lengkap
            </label>
            <input
              type="text"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Contoh: Budi Santoso"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
              <Mail size={16}/> Email Login
            </label>
            <input
              type="email"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
              <Lock size={16}/> Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* ROLE SELECTOR (BAGIAN YANG DIPERBAIKI) */}
          <div>
            <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
              <Shield size={16}/> Jabatan / Role
            </label>
            <select
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {/* ADMIN hanya bisa tambah STAFF */}
              {currentUserRole === "ADMIN" && (
                <option value="STAFF">STAFF</option>
              )}

              {/* MANAJER/PEMILIK bisa tambah SEMUA */}
              {(currentUserRole === "MANAJER" || currentUserRole === "PEMILIK") && (
                <>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAJER">MANAJER</option>
                </>
              )}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              *Hak akses akan disesuaikan dengan jabatan yang dipilih.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : <><Save size={20} /> Simpan User</>}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}