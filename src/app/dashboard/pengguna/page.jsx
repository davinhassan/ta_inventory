"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { Trash2, Plus, User, Pencil } from "lucide-react"; // Saya tambah icon Pencil untuk Edit
import Link from "next/link";

export default function KelolaPenggunaPage() {
  const { data: session } = useSession();
  const myRole = session?.user?.role;

  const [users, setUsers] = useState([]);

  // Ambil Data User
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/pengguna");
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error("Gagal ambil data user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Hapus User
  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus user ini?")) return;
    const res = await fetch(`/api/pengguna?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      fetchUsers();
    } else {
      alert(data.error || "Gagal menghapus");
    }
  };

  return (
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN"]}>
      {/* 1. Responsif Padding: p-4 di HP, p-8 di Desktop */}
      <div className="p-4 md:p-8">
        {/* 2. Header Responsif (Stack di HP, Row di Desktop) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Kelola Pengguna
          </h1>
          <Link
            href="/dashboard/pengguna/tambah"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition text-sm md:text-base w-full md:w-auto justify-center"
          >
            <Plus size={18} /> Tambah User
          </Link>
        </div>

        {/* TABEL USER */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          {/* 3. Wrapper Scroll Horizontal */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-foreground whitespace-nowrap text-sm md:text-base">
              <thead className="bg-secondary text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 md:px-6 md:py-4">Nama</th>
                  <th className="px-4 py-3 md:px-6 md:py-4">Email</th>
                  <th className="px-4 py-3 md:px-6 md:py-4">Role</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/50 transition">
                    <td className="px-4 py-3 md:px-6 md:py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-full hidden sm:block">
                          <User size={16} />
                        </div>
                        {u.nama}
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4">{u.email}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <span
                        className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold 
                        ${
                          u.role === "PEMILIK"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                            : u.role === "MANAJER"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border border-orange-200 dark:border-orange-700"
                            : u.role === "ADMIN"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                            : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Logika Tombol Edit & Hapus */}
                        {myRole === "ADMIN" && u.role !== "STAFF" ? (
                          <span className="text-xs text-muted-foreground italic">
                            No Access
                          </span>
                        ) : (
                          <>
                            {/* Tombol Edit */}
                            <Link
                              href={`/dashboard/pengguna/edit/${u.id}`}
                              className="text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 p-2 rounded transition"
                              title="Edit User"
                            >
                              <Pencil size={16} />
                            </Link>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 p-2 rounded transition"
                              title="Hapus User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pesan jika kosong */}
          {users.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Belum ada data pengguna.
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
