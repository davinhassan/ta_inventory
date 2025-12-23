"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
// 1. Import AuthGuard
import AuthGuard from "@/components/AuthGuard";

function PageStok() {
  const [sukuCadang, setSukuCadang] = useState([]);

  // Fungsi untuk mengambil data awal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/stok");
        const data = await response.json();
        setSukuCadang(data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };
    fetchData();
  }, []);

  // Fungsi hapus
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        const response = await fetch(`/api/stok/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          alert("Data berhasil dihapus!");
          setSukuCadang(sukuCadang.filter((item) => item.id !== id));
        } else {
          alert("Gagal menghapus data.");
        }
      } catch (error) {
        console.error("Terjadi error:", error);
        alert("Terjadi kesalahan koneksi.");
      }
    }
  };

  return (
    // 2. Pasang AuthGuard: Izinkan SEMUA ROLE
    // Karena Staff Gudang juga perlu melihat stok
    <AuthGuard allowedRoles={["PEMILIK", "ADMIN", "STAFF"]}>
      
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-white">
          Manajemen Stok Suku Cadang
        </h1>
        
        <div className="mb-4">
          <Link href="/dashboard/stok/tambah">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400">
              + Tambah Suku Cadang Baru
            </button>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full bg-gray-800 text-sm text-left text-gray-300">
            <thead className="bg-gray-700 text-xs uppercase text-gray-300">
              <tr>
                <th className="py-3 px-4">Kode Barang</th>
                <th className="py-3 px-4">Nama Barang</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4">Harga Beli</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {sukuCadang.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    Belum ada data barang.
                  </td>
                </tr>
              ) : (
                sukuCadang.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-blue-300">
                      {item.kodeBarang}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {item.namaBarang}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {item.supplier?.namaSupplier || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.stok > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {item.stok} Unit
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      Rp {item.hargaBeli.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <Link href={`/dashboard/stok/edit/${item.id}`}>
                          <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
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

export default PageStok;