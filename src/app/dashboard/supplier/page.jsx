"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { Plus, Pencil, Trash2, Truck, Search } from "lucide-react"; // Tambah import Search

export default function PageSupplier() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. STATE PENCARIAN
  const [searchTerm, setSearchTerm] = useState("");

  // Fungsi Fetch Data
  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/supplier", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Fungsi Hapus
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus supplier ini?")) return;

    try {
      const res = await fetch(`/api/supplier/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Supplier berhasil dihapus");
        fetchSuppliers();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi");
    }
  };

  // 2. LOGIKA FILTER PENCARIAN
  const filteredSuppliers = suppliers.filter((sup) => {
    const term = searchTerm.toLowerCase();
    return (
      sup.namaSupplier.toLowerCase().includes(term) || // Cari Nama
      sup.alamat.toLowerCase().includes(term) || // Cari Alamat
      sup.telepon.includes(term) // Cari Telepon
    );
  });

  return (
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN", "STAFF"]}>
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="text-blue-500" /> Manajemen Supplier
          </h1>

          {/* Tombol Tambah (Sembunyi utk Staff) */}
          {userRole !== "STAFF" && (
            <Link href="/dashboard/supplier/tambah">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2 transition-all">
                <Plus size={18} /> Tambah Supplier
              </button>
            </Link>
          )}
        </div>

        {/* 3. SEARCH BAR UI */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Cari nama, alamat, atau no. telepon..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 outline-none transition placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-lg">
          <table className="min-w-full bg-gray-800 text-sm text-left text-gray-300">
            <thead className="bg-gray-900 text-xs uppercase text-gray-400">
              <tr>
                <th className="py-3 px-6">Nama Supplier</th>
                <th className="py-3 px-6">Alamat</th>
                <th className="py-3 px-6">Telepon</th>
                {userRole !== "STAFF" && (
                  <th className="py-3 px-6 text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                // Tampilan jika data tidak ditemukan
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    {searchTerm
                      ? `Tidak ditemukan supplier "${searchTerm}"`
                      : "Belum ada data supplier."}
                  </td>
                </tr>
              ) : (
                // Render Data yang sudah difilter
                filteredSuppliers.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700/50 transition">
                    <td className="py-4 px-6 font-medium text-white">
                      {item.namaSupplier}
                    </td>
                    <td className="py-4 px-6">{item.alamat}</td>
                    <td className="py-4 px-6">{item.telepon}</td>

                    {/* Tombol Aksi (Sembunyi utk Staff) */}
                    {userRole !== "STAFF" && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link href={`/dashboard/supplier/edit/${item.id}`}>
                            <button
                              className="p-2 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40 rounded-lg transition border border-yellow-900/50"
                              title="Edit Supplier"
                            >
                              <Pencil size={16} />
                            </button>
                          </Link>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-lg transition border border-red-900/50"
                            title="Hapus Supplier"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGuard>
  );
}
