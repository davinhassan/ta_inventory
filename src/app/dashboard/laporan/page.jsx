"use client";

import { useState, useEffect } from "react";
import TransaksiChart from "@/components/TransaksiChart";
// 1. IMPORT AUTHGUARD DI SINI
import AuthGuard from "@/components/AuthGuard"; 

export default function LaporanPage() {
  const [data, setData] = useState({
    transaksi: [],
    ringkasan: { totalAset: 0, totalItem: 0 },
  });
  const [loading, setLoading] = useState(true);

  // State untuk filter tanggal (Default: Bulan Ini)
  const dateNow = new Date();
  const firstDay = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [filters, setFilters] = useState({
    start: firstDay,
    end: lastDay,
  });

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/laporan?start=${filters.start}&end=${filters.end}`
      );
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  return (
    // 2. BUNGKUS SELURUH KONTEN DENGAN AUTHGUARD
    // Tentukan role siapa saja yang boleh melihat halaman ini
    <AuthGuard allowedRoles={["PEMILIK", "ADMIN", "STAFF"]}>
      
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">
          Laporan & Analisis Stok
        </h1>

        {/* --- BAGIAN 1: RINGKASAN ASET (VALUASI) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-indigo-900/50 p-6 rounded-xl border border-indigo-700">
            <h3 className="text-indigo-200 text-sm font-medium uppercase">
              Total Nilai Aset (Rupiah)
            </h3>
            <p className="text-3xl font-bold text-white mt-2">
              Rp {data.ringkasan.totalAset.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              *Berdasarkan harga beli stok saat ini
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-sm font-medium uppercase">
              Total Fisik Barang
            </h3>
            <p className="text-3xl font-bold text-white mt-2">
              {data.ringkasan.totalItem.toLocaleString("id-ID")}{" "}
              <span className="text-lg font-normal">Unit</span>
            </p>
          </div>
        </div>

        <div className="mb-8">
          <TransaksiChart dataTransaksi={data.transaksi} />
        </div>

        {/* --- BAGIAN 2: FILTER & TABEL TRANSAKSI --- */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-lg font-bold text-white">Laporan Transaksi</h2>

            {/* Form Filter */}
            <div className="flex gap-2 items-end">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Dari</label>
                <input
                  type="date"
                  value={filters.start}
                  onChange={(e) =>
                    setFilters({ ...filters, start: e.target.value })
                  }
                  className="bg-gray-900 border border-gray-600 text-white text-sm p-2 rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Sampai</label>
                <input
                  type="date"
                  value={filters.end}
                  onChange={(e) =>
                    setFilters({ ...filters, end: e.target.value })
                  }
                  className="bg-gray-900 border border-gray-600 text-white text-sm p-2 rounded"
                />
              </div>
              <button
                onClick={fetchLaporan}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded transition"
              >
                Filter
              </button>
              <button
                onClick={() => window.print()}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded transition"
              >
                Cetak PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="bg-gray-900 text-xs uppercase text-gray-400">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Barang</th>
                  <th className="py-3 px-4 text-right">Jumlah</th>
                  <th className="py-3 px-4">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : data.transaksi.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      Tidak ada transaksi pada periode ini.
                    </td>
                  </tr>
                ) : (
                  data.transaksi.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            item.tipe === "MASUK"
                              ? "text-green-400 bg-green-900/30"
                              : "text-red-400 bg-red-900/30"
                          }`}
                        >
                          {item.tipe}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {item.sukuCadang?.namaBarang}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {item.jumlah}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {item.dilakukanOleh?.nama || "System"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
    </AuthGuard>
  );
}