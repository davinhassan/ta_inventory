"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save, Lock, User, Mail, Shield } from "lucide-react";
import Link from "next/link";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const myRole = session?.user?.role;

  const [form, setForm] = useState({
    nama: "",
    email: "",
    role: "STAFF",
    password: "",
  });
  const [loading, setLoading] = useState(true);

  // 2. GET DATA
  useEffect(() => {
    const fetchUser = async () => {
      try {
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
            password: "",
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

    if (myRole === "ADMIN" && form.role !== "STAFF") {
      alert("Admin tidak boleh menaikkan jabatan user menjadi diatas Staff!");
      return;
    }

    const res = await fetch(`/api/pengguna`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: parseInt(params.id),
        nama: form.nama,
        role: form.role,
        password: form.password,
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

  if (loading)
    return (
      <p className="p-8 text-muted-foreground text-center">Memuat data...</p>
    );

  return (
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN"]}>
      {/* 1. Responsif Padding & Max Width */}
      <div className="p-4 md:p-8 w-full max-w-lg mx-auto">
        {/* Header Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard/pengguna"
            className="p-2 bg-card border border-border text-muted-foreground rounded-lg hover:text-foreground transition hover:bg-secondary"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Edit Pengguna
          </h1>
        </div>

        {/* Card Form */}
        <div className="bg-card p-5 md:p-8 rounded-xl border border-border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAMA */}
            <div>
              <label className="text-muted-foreground text-sm mb-1.5 flex items-center gap-2">
                <User size={16} /> Nama Lengkap
              </label>
              <input
                className="w-full bg-background border border-input text-foreground p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm md:text-base"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>

            {/* EMAIL (Read Only) */}
            <div>
              <label className="text-muted-foreground text-sm mb-1.5 flex items-center gap-2">
                <Mail size={16} /> Email Login
              </label>
              <input
                className="w-full bg-muted border border-input text-muted-foreground p-3 rounded-lg cursor-not-allowed text-sm md:text-base"
                value={form.email}
                readOnly
              />
            </div>

            {/* PASSWORD BARU */}
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
              <label className="text-yellow-600 dark:text-yellow-500 text-sm mb-1.5 font-bold flex items-center gap-2">
                <Lock size={16} /> Ganti Password (Opsional)
              </label>
              <input
                type="password"
                className="w-full bg-background border border-input text-foreground p-3 rounded-lg focus:border-yellow-500 outline-none placeholder-muted-foreground transition text-sm md:text-base"
                placeholder="Biarkan kosong jika tidak diganti"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* ROLE */}
            <div>
              <label className="text-muted-foreground text-sm mb-1.5 flex items-center gap-2">
                <Shield size={16} /> Jabatan / Role
              </label>
              <select
                className="w-full bg-background border border-input text-foreground p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-sm md:text-base"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STAFF">STAFF</option>
                {myRole !== "ADMIN" && <option value="ADMIN">ADMIN</option>}
                {(myRole === "PEMILIK" || myRole === "MANAJER") && (
                  <option value="MANAJER">MANAJER</option>
                )}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg mt-6 flex justify-center items-center gap-2 transition shadow-lg active:scale-95 text-sm md:text-base"
            >
              <Save size={18} /> Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
