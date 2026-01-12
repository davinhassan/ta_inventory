"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { Plus, Pencil, Trash2, Package, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function PageStok() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // --- STATE DATA ---
  const [sukuCadang, setSukuCadang] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE PAGINATION & SEARCH ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 1. Efek Debounce Search (Tunggu user selesai mengetik 500ms baru search)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset ke halaman 1 setiap kali search berubah
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Fungsi Fetch Data (Dipanggil saat page atau search berubah)
  const fetchData = async () => {
    setLoading(true);
    try {
      // Panggil API dengan parameter page & search
      const params = new URLSearchParams({
        page: page,
        limit: 10, // Tampilkan 10 item per halaman
        search: debouncedSearch
      });

      const response = await fetch(`/api/stok?${params}`, { cache: "no-store" });
      const result = await response.json();

      if (response.ok) {
        setSukuCadang(result.data);
        setTotalPages(result.pagination.totalPage);
        setTotalData(result.pagination.totalData);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fetch saat page atau keyword search berubah
  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch]);

  // Fungsi Hapus (Tetap sama)
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        const response = await fetch(`/api/stok/${id}`, { method: "DELETE" });
        if (response.ok) {
          alert("Data berhasil dihapus!");
          fetchData(); // Refresh data halaman ini
        } else {
          const err = await response.json();
          alert(err.error || "Gagal menghapus data.");
        }
      } catch (error) {
        alert("Terjadi kesalahan koneksi.");
      }
    }
  };

  return (
    <AuthGuard allowedRoles={["MANAJER", "ADMIN", "STAFF"]}>
      <div className="p-4 md:p-8 w-full min-h-screen flex flex-col">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-blue-500" /> Manajemen Stok
          </h1>

          {userRole !== "STAFF" && (
            <Link href="/dashboard/stok/tambah" className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all active:scale-95">
                <Plus size={18} /> Tambah Barang
              </button>
            </Link>
          )}
        </div>

        {/* SEARCH BAR (Server Side) */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3.5 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Cari kode atau nama barang..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 outline-none transition placeholder-gray-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABEL DATA */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300 whitespace-nowrap">
              <thead className="bg-gray-900 text-xs uppercase text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-4 px-6">Kode & Nama</th>
                  <th className="py-4 px-6">Stok</th>
                  <th className="py-4 px-6">Harga Beli</th>
                  <th className="py-4 px-6 text-green-400">Harga Jual</th>
                  {userRole !== "STAFF" && <th className="py-4 px-6 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center">
                      <div className="flex justify-center items-center gap-2 text-gray-400">
                         <Loader2 className="animate-spin" /> Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : sukuCadang.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-500">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  sukuCadang.map((item) => {
                    const isLowStock = item.stok <= item.minStok; // Asumsi ada field minStok atau pakai default 5
                    return (
                      <tr key={item.id} className="hover:bg-gray-700/50 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-white">{item.namaBarang}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded font-mono">
                              {item.kodeBarang}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.supplier?.namaSupplier || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex flex-col items-start">
                             <span className={`px-2 py-1 rounded text-xs font-bold ${
                                isLowStock ? "bg-red-900/50 text-red-200 border border-red-800" : "bg-green-900/50 text-green-200 border border-green-800"
                             }`}>
                                {item.stok} Unit
                             </span>
                             {isLowStock && <span className="text-[10px] text-red-400 mt-1">Stok Menipis!</span>}
                           </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-sm">
                          Rp {Number(item.hargaBeli).toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-green-400 text-sm">
                          Rp {Number(item.hargaJual).toLocaleString("id-ID")}
                        </td>
                        
                        {userRole !== "STAFF" && (
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <Link href={`/dashboard/stok/edit/${item.id}`}>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* FOOTER PAGINATION CONTROL */}
          {!loading && sukuCadang.length > 0 && (
            <div className="bg-gray-900/50 p-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
               <span className="text-sm text-gray-400">
                  Menampilkan {sukuCadang.length} dari <b>{totalData}</b> barang
               </span>
               
               <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <span className="text-sm font-medium text-white px-2">
                     Halaman {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
                  >
                    <ChevronRight size={20} />
                  </button>
               </div>
            </div>
          )}
        </div>

      </div>
    </AuthGuard>
  );
}