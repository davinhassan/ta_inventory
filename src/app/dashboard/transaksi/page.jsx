"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { Plus, ShoppingCart, Calendar, User, FileText, Package, ChevronRight } from "lucide-react";

export default function TransaksiPage() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil Data Transaksi dari API
  const fetchTransaksi = async () => {
    try {
      const res = await fetch("/api/transaksi");
      const data = await res.json();

      if (Array.isArray(data)) {
        setTransaksiList(data);
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
    fetchTransaksi();
  }, []);

  return (
    <AuthGuard allowedRoles={["MANAJER", "ADMIN", "STAFF"]}>
      {/* 1. Container: Padding responsif (p-4 mobile, p-8 desktop) */}
      <div className="p-4 md:p-8 w-full min-h-screen">
        
        {/* 2. Header: Flex Column di Mobile, Row di Desktop */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="text-blue-400" /> Riwayat Penjualan
          </h1>

          <Link href="/dashboard/transaksi/tambah" className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition flex justify-center items-center gap-2 active:scale-[0.98]">
              <Plus size={18} /> Transaksi Baru
            </button>
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse">
            Memuat data transaksi...
          </div>
        ) : (
          <>
            {/* =========================================
                TAMPILAN DESKTOP (TABEL)
                Hidden di Mobile (`hidden md:block`)
               ========================================= */}
            <div className="hidden md:block bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
              <table className="w-full text-left text-gray-300">
                <thead className="bg-gray-900 text-xs uppercase text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4">ID Transaksi</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Detail Barang</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Kasir</th>
                    <th className="px-6 py-4 text-center">Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {transaksiList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        Belum ada transaksi barang keluar.
                      </td>
                    </tr>
                  ) : (
                    transaksiList.map((trx) => (
                      <tr key={trx.id} className="hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 font-mono text-blue-400">
                          #{trx.id}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-500" />
                            {new Date(trx.tanggal).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <ul className="list-disc list-inside text-gray-300">
                            {trx.detail?.map((item, idx) => (
                              <li key={idx} className="truncate max-w-[200px]">
                                {item.sukuCadang?.namaBarang}{" "}
                                <span className="text-gray-500 text-xs">
                                  x{item.jumlah}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-400 whitespace-nowrap">
                          Rp {trx.total.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <User size={14} /> {trx.user?.nama || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {trx.buktiFoto ? (
                            <a
                              href={trx.buktiFoto}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline text-xs transition"
                            >
                              <FileText size={12} /> Lihat
                            </a>
                          ) : (
                            <span className="text-gray-600 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* =========================================
                TAMPILAN MOBILE (KARTU)
                Visible di Mobile (`md:hidden`)
               ========================================= */}
            <div className="md:hidden space-y-4">
              {transaksiList.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  Belum ada transaksi.
                </div>
              ) : (
                transaksiList.map((trx) => (
                  <div
                    key={trx.id}
                    className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-sm flex flex-col gap-3"
                  >
                    {/* Header Kartu: ID & Tanggal */}
                    <div className="flex justify-between items-start border-b border-gray-700/50 pb-2">
                      <div>
                        <span className="text-blue-400 font-mono font-bold text-sm">
                          #{trx.id}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Calendar size={12} />
                          {new Date(trx.tanggal).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-green-400 font-bold text-lg">
                          Rp {trx.total.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Body Kartu: List Barang */}
                    <div className="bg-gray-900/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 uppercase tracking-wider">
                        <Package size={12} /> Detail Item
                      </div>
                      <ul className="space-y-1">
                        {trx.detail?.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-300 flex justify-between"
                          >
                            <span className="truncate pr-2">
                              {item.sukuCadang?.namaBarang}
                            </span>
                            <span className="text-gray-500 font-mono whitespace-nowrap">
                              x{item.jumlah}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer Kartu: Kasir & Bukti */}
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User size={14} />
                        <span>{trx.user?.nama || "Staff"}</span>
                      </div>

                      {trx.buktiFoto && (
                        <a
                          href={trx.buktiFoto}
                          target="_blank"
                          className="flex items-center gap-1 text-xs bg-blue-900/30 text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-900/50 transition border border-blue-800/50"
                        >
                          <FileText size={12} /> Lihat Struk
                        </a>
                      )}
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