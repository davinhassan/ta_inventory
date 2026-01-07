"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save, Truck, Phone, MapPin } from "lucide-react"; // Menambahkan ikon input biar cantik

export default function TambahSupplierPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    namaSupplier: "",
    alamat: "",
    telepon: "",
  });

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
        const data = await res.json();
        alert("Gagal menambahkan supplier: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN"]}>
      {/* 1. Wrapper Utama: Padding responsif (kecil di HP, lega di Desktop) */}
      <div className="p-4 md:p-8 w-full min-h-screen">
        
        {/* 2. Container Tengah: max-w-lg agar konsisten dengan halaman Edit */}
        <div className="max-w-lg mx-auto">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/dashboard/supplier"
              className="p-2 bg-gray-800 text-gray-400 rounded hover:text-white transition hover:bg-gray-700"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Tambah Supplier
            </h1>
          </div>

          {/* Form Container */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Input Nama */}
              <div>
                <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                  <Truck size={14} /> Nama Supplier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaSupplier"
                  value={form.namaSupplier}
                  onChange={handleChange}
                  placeholder="Contoh: PT. Sparepart Jaya"
                  className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base placeholder-gray-600 transition"
                  required
                />
              </div>

              {/* Input Telepon */}
              <div>
                <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                  <Phone size={14} /> Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telepon"
                  value={form.telepon}
                  onChange={handleChange}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base placeholder-gray-600 transition"
                  required
                />
              </div>

              {/* Input Alamat */}
              <div>
                <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                  <MapPin size={14} /> Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="alamat"
                  rows="3"
                  value={form.alamat}
                  onChange={handleChange}
                  placeholder="Masukkan alamat lengkap..."
                  className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm sm:text-base placeholder-gray-600 transition"
                  required
                />
              </div>

              {/* Tombol Simpan */}
              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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
      </div>
    </AuthGuard>
  );
}