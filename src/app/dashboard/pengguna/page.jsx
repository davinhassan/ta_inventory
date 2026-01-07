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
          <h1 className="text-xl md:text-2xl font-bold text-white">Kelola Pengguna</h1>
          <Link
            href="/dashboard/pengguna/tambah"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition text-sm md:text-base w-full md:w-auto justify-center"
          >
            <Plus size={18} /> Tambah User
          </Link>
        </div>

        {/* TABEL USER */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
          
          {/* 3. Wrapper Scroll Horizontal */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300 whitespace-nowrap text-sm md:text-base">
              <thead className="bg-gray-900 text-xs uppercase text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 md:px-6 md:py-4">Nama</th>
                  <th className="px-4 py-3 md:px-6 md:py-4">Email</th>
                  <th className="px-4 py-3 md:px-6 md:py-4">Role</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 md:px-6 md:py-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-700 rounded-full hidden sm:block">
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
                            ? "bg-purple-900/50 text-purple-200 border border-purple-700"
                            : u.role === "MANAJER"
                            ? "bg-orange-900/50 text-orange-200 border border-orange-700"
                            : u.role === "ADMIN"
                            ? "bg-blue-900/50 text-blue-200 border border-blue-700"
                            : "bg-green-900/50 text-green-200 border border-green-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Logika Tombol Edit & Hapus */}
                        {myRole === "ADMIN" && u.role !== "STAFF" ? (
                          <span className="text-xs text-gray-600 italic">
                            No Access
                          </span>
                        ) : (
                          <>
                            {/* Tombol Edit (Saya ganti teks jadi Ikon Pencil biar rapi di HP) */}
                            <Link
                              href={`/dashboard/pengguna/edit/${u.id}`}
                              className="text-yellow-400 hover:text-white bg-yellow-900/20 hover:bg-yellow-600 p-2 rounded transition"
                              title="Edit User"
                            >
                              <Pencil size={16} />
                            </Link>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="text-red-400 hover:text-white bg-red-900/20 hover:bg-red-600 p-2 rounded transition"
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
             <div className="p-8 text-center text-gray-500 text-sm">Belum ada data pengguna.</div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}