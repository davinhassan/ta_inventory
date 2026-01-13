"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import {
  Plus,
  ShoppingCart,
  Calendar,
  User,
  FileText,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function TransaksiPage() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Pagination
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  // Ambil Data Transaksi dari API
  const fetchTransaksi = async (halaman) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transaksi?page=${halaman}&limit=10`);
      const responseData = await res.json();

      if (responseData.data && Array.isArray(responseData.data)) {
        setTransaksiList(responseData.data);
        if (responseData.pagination) {
          setTotalPage(responseData.pagination.totalPage);
          setTotalData(responseData.pagination.totalData);
        }
      } else if (Array.isArray(responseData)) {
        setTransaksiList(responseData);
      } else {
        setTransaksiList([]);
      }
    } catch (error) {
      console.error("Gagal ambil transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaksi(page);
  }, [page]);

  return (
    <AuthGuard allowedRoles={["MANAJER", "ADMIN", "STAFF"]}>
      {/* 1. Container: Padding responsif */}
      <div className="p-4 md:p-8 w-full min-h-screen pb-24 md:pb-8">
        {/* 2. Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="text-blue-600 dark:text-blue-400" />{" "}
              Riwayat Penjualan
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Total {totalData} transaksi ditemukan.
            </p>
          </div>

          <Link href="/dashboard/transaksi/tambah" className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition flex justify-center items-center gap-2 active:scale-[0.98]">
              <Plus size={18} /> Transaksi Baru
            </button>
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-center py-20 bg-muted/50 rounded-xl border border-border animate-pulse">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">
                Memuat data transaksi...
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* TAMPILAN DESKTOP (TABEL) */}
            <div className="hidden md:block bg-card rounded-xl overflow-hidden border border-border shadow-sm">
              <table className="w-full text-left text-foreground">
                <thead className="bg-secondary text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4">ID Transaksi</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Detail Barang</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Kasir</th>
                    <th className="px-6 py-4 text-center">Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transaksiList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-muted-foreground"
                      >
                        Belum ada transaksi tercatat.
                      </td>
                    </tr>
                  ) : (
                    transaksiList.map((trx) => (
                      <tr key={trx.id} className="hover:bg-muted/50 transition">
                        <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">
                          #{trx.id}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2 text-foreground">
                            <Calendar
                              size={14}
                              className="text-muted-foreground"
                            />
                            {new Date(trx.tanggal).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
                            {trx.detail?.map((item, idx) => (
                              <li key={idx} className="truncate max-w-[200px]">
                                {item.sukuCadang?.namaBarang || (
                                  <span className="text-red-500 italic">
                                    Terhapus
                                  </span>
                                )}{" "}
                                <span className="text-foreground">
                                  x{item.jumlah}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                          Rp {Number(trx.total).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User size={14} /> {trx.user?.nama || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {trx.buktiFoto ? (
                            <a
                              href={trx.buktiFoto}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-xs transition bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded"
                            >
                              <FileText size={12} /> Lihat
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* TAMPILAN MOBILE (KARTU) */}
            <div className="md:hidden space-y-4">
              {transaksiList.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 bg-card rounded-xl border border-border">
                  <Package className="mx-auto mb-2 opacity-50" size={32} />
                  Belum ada transaksi.
                </div>
              ) : (
                transaksiList.map((trx) => (
                  <div
                    key={trx.id}
                    className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col gap-3"
                  >
                    {/* Header Kartu */}
                    <div className="flex justify-between items-start border-b border-border pb-2">
                      <div>
                        <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-sm">
                          #{trx.id}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar size={12} />
                          {new Date(trx.tanggal).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-green-600 dark:text-green-400 font-bold text-lg">
                          Rp {Number(trx.total).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Body Kartu */}
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wider">
                        <Package size={12} /> Detail Item
                      </div>
                      <ul className="space-y-1">
                        {trx.detail?.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-foreground flex justify-between"
                          >
                            <span className="truncate pr-2 w-2/3">
                              {item.sukuCadang?.namaBarang || "Item Dihapus"}
                            </span>
                            <span className="text-muted-foreground font-mono whitespace-nowrap">
                              x{item.jumlah}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer Kartu */}
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User size={14} />
                        <span>{trx.user?.nama || "Staff"}</span>
                      </div>

                      {trx.buktiFoto && (
                        <a
                          href={trx.buktiFoto}
                          target="_blank"
                          className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition border border-blue-200 dark:border-blue-800/50"
                        >
                          <FileText size={12} /> Lihat Struk
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            {totalPage > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition"
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <span className="text-muted-foreground text-sm">
                  Halaman{" "}
                  <span className="text-foreground font-bold">{page}</span> dari{" "}
                  {totalPage}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                  disabled={page === totalPage}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
