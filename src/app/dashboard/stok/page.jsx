"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";

function PageStok() {
  const [sukuCadang, setSukuCadang] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data
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
          method: "DELETE",
        });

        if (response.ok) {
          alert("Data berhasil dihapus!");
          fetchData(); // Refresh data
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

  return (
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
                <th className="py-3 px-4">Kode & Nama</th>
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4">Harga Beli</th>
                <th className="py-3 px-4 text-green-400">Harga Jual</th>
                {/* Kolom Keuntungan SUDAH DIHAPUS */}
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : sukuCadang.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    Belum ada data barang.
                  </td>
                </tr>
              ) : (
                sukuCadang.map((item) => {
                  const hargaBeli = item.hargaBeli || 0;
                  const hargaJual = item.hargaJual || 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">
                          {item.namaBarang}
                        </div>
                        <div className="text-xs font-mono text-blue-300">
                          {item.kodeBarang}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.supplier?.namaSupplier || "-"}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            item.stok > 5
                              ? "bg-green-900 text-green-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {item.stok} Unit
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-300">
                        Rp {hargaBeli.toLocaleString("id-ID")}
                      </td>

                      <td className="py-3 px-4 font-bold text-green-400">
                        Rp {hargaJual.toLocaleString("id-ID")}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGuard>
  );
}

export default PageStok;
