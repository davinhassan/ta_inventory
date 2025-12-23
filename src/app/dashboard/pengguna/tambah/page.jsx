"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// 1. Import AuthGuard
import AuthGuard from "@/components/AuthGuard";

export default function TambahUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    role: "STAFF",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("User berhasil ditambahkan!");
        router.push("/dashboard/pengguna");
        router.refresh();
      } else {
        const err = await res.json();
        alert("Gagal: " + err.error);
      }
    } catch (error) {
      alert("Error sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 2. Pasang AuthGuard: Hanya PEMILIK yang boleh masuk
    <AuthGuard allowedRoles={["PEMILIK"]}>
      
      <div className="p-8">
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-4">
            Tambah Pengguna Baru
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Nama */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Andi Saputra"
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
              />
            </div>

            {/* Input Email */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Email</label>
              <input
                type="email"
                required
                placeholder="email@contoh.com"
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
              <input
                type="password"
                required
                placeholder="******"
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            {/* Input Role */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Role / Jabatan
              </label>
              <div className="relative">
                <select
                  className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  value={formData.role}
                >
                  <option value="STAFF">STAFF (Gudang/Kasir)</option>
                  <option value="ADMIN">ADMIN (Kepala Bengkel)</option>
                  <option value="PEMILIK">PEMILIK (Owner)</option>
                </select>
                {/* Panah Dropdown */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-4 pt-6 border-t border-gray-700 mt-6">
              <Link href="/dashboard/pengguna">
                <button
                  type="button"
                  className="bg-transparent border border-gray-500 text-gray-300 font-bold py-2.5 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/50 flex-1"
              >
                {loading ? "Menyimpan..." : "Simpan User Baru"}
              </button>
            </div>
          </form>
        </div>
      </div>

    </AuthGuard>
  );
}