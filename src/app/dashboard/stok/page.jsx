"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // 1. Import Session
import AuthGuard from "@/components/AuthGuard";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react"; // Import Icons

function PageStok() {
  const { data: session } = useSession();
  const userRole = session?.user?.role; // 2. Ambil Role

  const [sukuCadang, setSukuCadang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State Pencarian

  // Fungsi fetch data
  const fetchData = async () => {
    try {
      const response = await fetch("/api/stok", { cache: "no-store" });
      const data = await response.json();
      setSukuCadang(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi hapus
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        const response = await fetch(`/api/stok/${id}`, {
          // Gunakan /api/stok/[id]
          method: "DELETE",
        });

        if (response.ok) {
          alert("Data berhasil dihapus!");
          fetchData();
        } else {
          const err = await response.json();
          alert(err.error || "Gagal menghapus data.");
        }
      } catch (error) {
        console.error("Terjadi error:", error);
        alert("Terjadi kesalahan koneksi.");
      }
    }
  };

  // Logika Filter Pencarian
  const filteredData = sukuCadang.filter(
    (item) =>
      item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // STAFF DIPERBOLEHKAN MASUK (Tapi Read Only)
    <AuthGuard allowedRoles={["MANAJER", "ADMIN", "STAFF"]}>
      <div className="p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-blue-500" /> Manajemen Stok
          </h1>

          {/* TOMBOL TAMBAH: HANYA MUNCUL JIKA BUKAN STAFF */}
          {userRole !== "STAFF" && (
            <Link href="/dashboard/stok/tambah">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-all">
                <Plus size={18} /> Tambah Barang Baru
              </button>
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Cari kode atau nama barang..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 outline-none transition placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabel */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="bg-gray-900 text-xs uppercase text-gray-400">
                <tr>
                  <th className="py-3 px-6">Kode & Nama</th>
                  <th className="py-3 px-6">Stok</th>
                  <th className="py-3 px-6">Harga Beli</th>
                  <th className="py-3 px-6 text-green-400">Harga Jual</th>

                  {/* HEADER AKSI: SEMBUNYIKAN JIKA STAFF */}
                  {userRole !== "STAFF" && (
                    <th className="py-3 px-6 text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-400">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const hargaBeli = item.hargaBeli || 0;
                    const hargaJual = item.hargaJual || 0;

                    // Cek Stok Menipis
                    const isLowStock = item.stok <= 5;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Kode & Nama */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-white text-base">
                            {item.namaBarang}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded font-mono">
                              {item.kodeBarang}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.supplier?.namaSupplier || "No Supplier"}
                            </span>
                          </div>
                        </td>

                        {/* Stok (Dengan Warna Peringatan) */}
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-bold ${
                              isLowStock
                                ? "bg-red-900/50 text-red-200 border border-red-800"
                                : "bg-green-900/50 text-green-200 border border-green-800"
                            }`}
                          >
                            {item.stok} Unit
                          </span>
                          {isLowStock && (
                            <div className="text-[10px] text-red-400 mt-1">
                              Stok Menipis!
                            </div>
                          )}
                        </td>

                        {/* Harga Beli */}
                        <td className="py-4 px-6 text-gray-300 font-mono">
                          Rp {hargaBeli.toLocaleString("id-ID")}
                        </td>

                        {/* Harga Jual */}
                        <td className="py-4 px-6 text-green-400 font-mono font-bold">
                          Rp {hargaJual.toLocaleString("id-ID")}
                        </td>

                        {/* KOLOM AKSI: SEMBUNYIKAN JIKA STAFF */}
                        {userRole !== "STAFF" && (
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <Link href={`/dashboard/stok/edit/${item.id}`}>
                                <button
                                  className="p-2 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40 rounded-lg transition-colors border border-yellow-900/50"
                                  title="Edit Barang"
                                >
                                  <Pencil size={16} />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-lg transition-colors border border-red-900/50"
                                title="Hapus Barang"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

export default PageStok;
