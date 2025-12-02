"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

function PageStok() {
  const [sukuCadang, setSukuCadang] = useState([]);

  // Fungsi untuk mengambil data awal (tidak berubah)
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/stok");
      const data = await response.json();
      setSukuCadang(data);
    };
    fetchData();
  }, []);

  // Fungsi hapus (tidak berubah)
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

      <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-left text-gray-300 uppercase text-sm">
            <th className="py-3 px-4">Kode Barang</th>
            <th className="py-3 px-4">Nama Barang</th>
            <th className="py-3 px-4">Supplier</th>
            <th className="py-3 px-4">Stok</th>
            <th className="py-3 px-4">Harga Beli</th>
            <th className="py-3 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-gray-200">
          {sukuCadang.map((item) => (
            <tr
              key={item.id}
              className="border-t border-gray-700 hover:bg-gray-700/50"
            >
              <td className="py-3 px-4">{item.kodeBarang}</td>
              <td className="py-3 px-4">{item.namaBarang}</td>
              <td className="py-3 px-4">
                {item.supplier?.namaSupplier || "N/A"}
              </td>
              <td className="py-3 px-4">{item.stok}</td>
              <td className="py-3 px-4">
                Rp{item.hargaBeli.toLocaleString("id-ID")}
              </td>
              <td className="py-3 px-4 text-center">
                {/* INI BAGIAN YANG DIPERBARUI */}
                <div className="flex justify-center items-center space-x-2">
                  <Link href={`/dashboard/stok/edit/${item.id}`}>
                    <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs">
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-600 hover:bg-red-800 text-white font-bold py-1 px-3 rounded text-xs"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PageStok;
