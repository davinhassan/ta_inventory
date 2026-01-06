"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { Plus, ShoppingCart, Calendar, User, FileText } from "lucide-react";

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
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="text-blue-400"/> Riwayat Barang Keluar (Penjualan)
          </h1>
          
          <Link href="/dashboard/transaksi/tambah">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition flex items-center gap-2">
              <Plus size={18}/> Transaksi Baru
            </button>
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900 text-xs uppercase text-gray-400 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Detail Barang</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Kasir</th>
                <th className="px-6 py-4">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                 <tr><td colSpan="6" className="p-8 text-center text-white">Memuat data...</td></tr>
              ) : transaksiList.length === 0 ? (
                 <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada transaksi barang keluar.</td></tr>
              ) : (
                transaksiList.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 font-mono text-blue-400">#{trx.id}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-500"/>
                        {new Date(trx.tanggal).toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {/* Loop Detail Barang */}
                      <ul className="list-disc list-inside text-gray-300">
                        {trx.detail?.map((item, idx) => (
                           <li key={idx}>
                              {item.sukuCadang?.namaBarang} <span className="text-gray-500">x{item.jumlah}</span>
                           </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-400">
                      Rp {trx.total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                       <div className="flex items-center gap-2">
                          <User size={14}/> {trx.user?.nama || "Unknown"}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       {trx.buktiFoto ? (
                          <a href={trx.buktiFoto} target="_blank" className="text-blue-400 underline text-xs flex items-center gap-1">
                             <FileText size={12}/> Lihat Struk
                          </a>
                       ) : <span className="text-gray-600 text-xs">-</span>}
                    </td>
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