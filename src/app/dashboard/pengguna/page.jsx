"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { Trash2, Plus, User } from "lucide-react";
import Link from "next/link"; // Jangan lupa import Link untuk tombol edit

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
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Kelola Pengguna</h1>
          <Link
            href="/dashboard/pengguna/tambah"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={18} /> Tambah User
          </Link>
        </div>

        {/* TABEL USER */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <div className="p-2 bg-gray-700 rounded-full">
                      <User size={16} />
                    </div>
                    {u.nama}
                  </td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold 
                      ${
                        u.role === "PEMILIK"
                          ? "bg-purple-900 text-purple-200"
                          : u.role === "MANAJER"
                          ? "bg-orange-900 text-orange-200"
                          : u.role === "ADMIN"
                          ? "bg-blue-900 text-blue-200"
                          : "bg-green-900 text-green-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {/* Logika Tombol Edit & Hapus */}
                    {myRole === "ADMIN" && u.role !== "STAFF" ? (
                      <span className="text-xs text-gray-600 italic">
                        No Access
                      </span>
                    ) : (
                      <>
                        {/* Tombol Edit */}
                        <Link
                          href={`/dashboard/pengguna/edit/${u.id}`}
                          className="text-yellow-400 hover:text-yellow-300 p-2 hover:bg-yellow-900/20 rounded"
                        >
                          Edit
                        </Link>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGuard>
  );
}
