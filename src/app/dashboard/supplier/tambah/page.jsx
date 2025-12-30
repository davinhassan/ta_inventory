"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save } from "lucide-react";

export default function TambahSupplierPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    namaSupplier: "",
    alamat: "",
    telepon: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Berhasil tambah supplier!");
        router.push("/dashboard/supplier");
        router.refresh();
      } else {
        const data = await res.json(); // Ambil pesan error dari API jika ada
        alert("Gagal menambahkan supplier: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    // REVISI: HAPUS "STAFF" & TAMBAHKAN "PEMILIK"
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN"]}>
      <div className="p-8">
        {/* Header & Tombol Kembali */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/dashboard/supplier"
            className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white hover:bg-gray-700 transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Tambah Supplier Baru
          </h1>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Nama */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Nama Supplier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Contoh: PT. Sparepart Jaya"
                value={form.namaSupplier}
                onChange={(e) =>
                  setForm({ ...form, namaSupplier: e.target.value })
                }
                required
              />
            </div>

            {/* Input Telepon */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Contoh: 08123456789"
                value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                required
              />
            </div>

            {/* Input Alamat */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Masukkan alamat lengkap supplier..."
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                required
              />
            </div>

            {/* Tombol Simpan */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Save size={18} /> Simpan Data
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
