"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save, Lock, User, Mail } from "lucide-react"; // Tambah ikon Lock
import Link from "next/link";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const myRole = session?.user?.role;

  // 1. STATE: Tambahkan 'password' agar bisa diganti
  const [form, setForm] = useState({
    nama: "",
    email: "",
    role: "STAFF",
    password: "", // Default kosong
  });
  const [loading, setLoading] = useState(true);

  // 2. GET DATA: Gunakan API utama lalu filter manual
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // PERBAIKAN: Jangan pakai /api/pengguna/detail (karena tidak ada)
        // Pakai /api/pengguna biasa, lalu cari user yang ID-nya cocok
        const res = await fetch("/api/pengguna");
        const users = await res.json();
        const foundUser = users.find((u) => u.id === parseInt(params.id));

        if (foundUser) {
          // --- PROTEKSI FRONTEND ---
          if (myRole === "ADMIN" && foundUser.role !== "STAFF") {
            alert("ANDA TIDAK MEMILIKI AKSES MENGEDIT ATASAN/SESAMA ADMIN!");
            router.push("/dashboard/pengguna");
            return;
          }

          setForm({
            nama: foundUser.nama,
            email: foundUser.email,
            role: foundUser.role,
            password: "", // Password dikosongkan (jangan tampilkan hash)
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (myRole) fetchUser();
  }, [params.id, myRole, router]);

  // 3. SUBMIT (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Proteksi Admin
    if (myRole === "ADMIN" && form.role !== "STAFF") {
      alert("Admin tidak boleh menaikkan jabatan user menjadi diatas Staff!");
      return;
    }

    // Panggil API Update (API Route tunggal)
    const res = await fetch(`/api/pengguna`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: parseInt(params.id), // ID dikirim di Body
        nama: form.nama,
        role: form.role,
        password: form.password, // Password dikirim (kosong/isi)
      }),
    });

    if (res.ok) {
      alert("User berhasil diupdate");
      router.push("/dashboard/pengguna");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Gagal update");
    }
  };

  if (loading) return <p className="p-8 text-white">Memuat data...</p>;

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
          <h1 className="text-2xl font-bold text-white">Edit Pengguna</h1>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAMA */}
            <div>
              <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <User size={14} /> Nama
              </label>
              <input
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>

            {/* EMAIL (Read Only) */}
            <div>
              <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <Mail size={14} /> Email
              </label>
              <input
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-500 p-3 rounded cursor-not-allowed"
                value={form.email}
                readOnly
              />
            </div>

            {/* PASSWORD BARU (Fitur Tambahan) */}
            <div className="bg-yellow-900/10 p-3 rounded-lg border border-yellow-900/30">
              <label className="text-yellow-500 text-sm mb-1 font-bold flex items-center gap-2">
                <Lock size={14} /> Ganti Password (Opsional)
              </label>
              <input
                type="password"
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:border-yellow-500 outline-none placeholder-gray-600"
                placeholder="Biarkan kosong jika tidak diganti"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* ROLE */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Jabatan / Role
              </label>
              <select
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STAFF">STAFF</option>
                {/* Sembunyikan opsi Admin/Manajer jika yang login cuma Admin */}
                {myRole !== "ADMIN" && <option value="ADMIN">ADMIN</option>}
                {myRole === "PEMILIK" && (
                  <option value="MANAJER">MANAJER</option>
                )}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded mt-4 flex justify-center items-center gap-2 transition"
            >
              <Save size={18} /> Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
