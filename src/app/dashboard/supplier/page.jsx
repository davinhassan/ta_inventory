"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { Plus, Pencil, Trash2, Truck, Search, MapPin, Phone } from "lucide-react";

export default function PageSupplier() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Data
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
        // Optimistic update: Hapus dari state tanpa fetch ulang biar cepat
        setSuppliers((prev) => prev.filter((item) => item.id !== id));
        alert("Supplier berhasil dihapus");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi");
    }
  };

  // Logika Filter
  const filteredSuppliers = suppliers.filter((sup) => {
    const term = searchTerm.toLowerCase();
    return (
      sup.namaSupplier.toLowerCase().includes(term) ||
      sup.alamat.toLowerCase().includes(term) ||
      sup.telepon.includes(term)
    );
  });

  return (
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN", "STAFF"]}>
      {/* PADDING RESPONSIF: p-4 di HP, p-8 di Desktop */}
      <div className="p-4 md:p-8 w-full min-h-screen">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="text-blue-500" /> Manajemen Supplier
          </h1>

          {/* Tombol Tambah (Full width di HP, Auto di Desktop) */}
          {userRole !== "STAFF" && (
            <Link href="/dashboard/supplier/tambah" className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
                <Plus size={18} /> Tambah Supplier
              </button>
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Cari nama, alamat, atau no. telepon..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 outline-none transition placeholder-gray-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse">
            Memuat data supplier...
          </div>
        ) : (
          <>
            {/* TAMPILAN DESKTOP (TABEL) - Hidden di Mobile */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-700 shadow-lg">
              <table className="min-w-full bg-gray-800 text-sm text-left text-gray-300">
                <thead className="bg-gray-900 text-xs uppercase text-gray-400">
                  <tr>
                    <th className="py-3 px-6">Nama Supplier</th>
                    <th className="py-3 px-6">Alamat</th>
                    <th className="py-3 px-6">Telepon</th>
                    {userRole !== "STAFF" && <th className="py-3 px-6 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-gray-500">
                        Data tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-700/50 transition">
                        <td className="py-4 px-6 font-medium text-white">{item.namaSupplier}</td>
                        <td className="py-4 px-6 truncate max-w-xs">{item.alamat}</td>
                        <td className="py-4 px-6">{item.telepon}</td>
                        {userRole !== "STAFF" && (
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <Link href={`/dashboard/supplier/edit/${item.id}`}>
                                <button className="p-2 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40 rounded-lg transition border border-yellow-900/50">
                                  <Pencil size={16} />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-lg transition border border-red-900/50"
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

            {/* TAMPILAN MOBILE (KARTU) - Visible di Mobile */}
            <div className="md:hidden space-y-4">
              {filteredSuppliers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Data tidak ditemukan.</div>
              ) : (
                filteredSuppliers.map((item) => (
                  <div key={item.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm flex flex-col gap-3">
                    {/* Header Kartu */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{item.namaSupplier}</h3>
                        <p className="text-sm text-blue-400 flex items-center gap-1 mt-1">
                          <Phone size={14} /> {item.telepon}
                        </p>
                      </div>
                      {/* Tombol Aksi Mobile */}
                      {userRole !== "STAFF" && (
                        <div className="flex gap-2">
                          <Link href={`/dashboard/supplier/edit/${item.id}`}>
                            <button className="p-2 bg-yellow-900/20 text-yellow-400 rounded-lg border border-yellow-900/50">
                              <Pencil size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-900/20 text-red-400 rounded-lg border border-red-900/50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Body Kartu */}
                    <div className="bg-gray-900/50 p-3 rounded-lg text-sm text-gray-300 border border-gray-700/50">
                      <div className="flex gap-2 items-start">
                        <MapPin size={14} className="mt-1 shrink-0 text-gray-500" />
                        <span>{item.alamat}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}