"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save, User, Mail, Lock, Shield } from "lucide-react";
import Link from "next/link"; // Pastikan import Link juga

export default function TambahUserPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    role: "STAFF",
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
    <AuthGuard allowedRoles={["MANAJER", "PEMILIK", "ADMIN"]}>
      {/* 1. Responsif Padding & Container: p-4 di HP, p-8 di Desktop */}
      <div className="p-4 md:p-8 w-full max-w-lg mx-auto">
        
        {/* Header Button */}
        <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition hover:bg-gray-800 p-2 rounded-lg -ml-2 w-fit"
        >
          <ArrowLeft size={20} /> <span className="text-sm md:text-base">Kembali</span>
        </button>

        <h1 className="text-xl md:text-2xl font-bold text-white mb-6">Tambah User Baru</h1>

        {/* Card Form Responsif */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-5 md:p-8 rounded-xl border border-gray-700 shadow-xl space-y-5">
          
          {/* NAMA */}
          <div>
            <label className="block text-gray-400 text-sm mb-1.5 flex items-center gap-2">
              <User size={16}/> Nama Lengkap
            </label>
            <input
              type="text"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-sm md:text-base placeholder-gray-500"
              placeholder="Contoh: Budi Santoso"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-gray-400 text-sm mb-1.5 flex items-center gap-2">
              <Mail size={16}/> Email Login
            </label>
            <input
              type="email"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-sm md:text-base placeholder-gray-500"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-gray-400 text-sm mb-1.5 flex items-center gap-2">
              <Lock size={16}/> Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-sm md:text-base placeholder-gray-500"
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* ROLE SELECTOR */}
          <div>
            <label className="block text-gray-400 text-sm mb-1.5 flex items-center gap-2">
              <Shield size={16}/> Jabatan / Role
            </label>
            <div className="relative">
                <select
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition text-sm md:text-base"
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
                {/* Custom Arrow Icon for Select */}
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              *Hak akses akan disesuaikan dengan jabatan yang dipilih.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6 active:scale-95 text-sm md:text-base"
          >
            {loading ? "Menyimpan..." : <><Save size={18} /> Simpan User</>}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}