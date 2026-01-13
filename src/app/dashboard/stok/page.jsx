"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

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
        search: debouncedSearch,
      });

      const response = await fetch(`/api/stok?${params}`, {
        cache: "no-store",
      });
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
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="text-blue-600 dark:text-blue-500" /> Manajemen
            Stok
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
          <Search
            className="absolute left-3 top-3.5 text-muted-foreground"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari kode atau nama barang..."
            className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground focus:border-blue-500 outline-none transition placeholder:text-muted-foreground shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABEL DATA */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-foreground whitespace-nowrap">
              <thead className="bg-secondary text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-4 px-6">Kode & Nama</th>
                  <th className="py-4 px-6">Stok</th>
                  <th className="py-4 px-6">Harga Beli</th>
                  <th className="py-4 px-6 text-green-600 dark:text-green-400">
                    Harga Jual
                  </th>
                  {userRole !== "STAFF" && (
                    <th className="py-4 px-6 text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" /> Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : sukuCadang.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-10 text-center text-muted-foreground"
                    >
                      Data tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  sukuCadang.map((item) => {
                    const isLowStock = item.stok <= (item.minStok || 5); // Asumsi default 5 jika minStok null
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-muted/50 transition"
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-foreground">
                            {item.namaBarang}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded font-mono border border-border">
                              {item.kodeBarang}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.supplier?.namaSupplier || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col items-start">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                isLowStock
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200 border border-red-200 dark:border-red-800"
                                  : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200 border border-green-200 dark:border-green-800"
                              }`}
                            >
                              {item.stok} Unit
                            </span>
                            {isLowStock && (
                              <span className="text-[10px] text-red-600 dark:text-red-400 mt-1 font-medium">
                                Stok Menipis!
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-sm text-foreground">
                          Rp {Number(item.hargaBeli).toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-green-600 dark:text-green-400 text-sm">
                          Rp {Number(item.hargaJual).toLocaleString("id-ID")}
                        </td>

                        {userRole !== "STAFF" && (
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <Link href={`/dashboard/stok/edit/${item.id}`}>
                                <button
                                  className="p-2 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/40 rounded-lg transition border border-yellow-200 dark:border-yellow-900/50"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-lg transition border border-red-200 dark:border-red-900/50"
                                title="Hapus"
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
            <div className="bg-secondary/30 p-4 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Menampilkan {sukuCadang.length} dari <b>{totalData}</b> barang
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="text-sm font-medium text-foreground px-2">
                  Halaman {page} / {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition shadow-sm"
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
