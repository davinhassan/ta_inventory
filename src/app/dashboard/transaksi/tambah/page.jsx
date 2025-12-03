"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TambahTransaksiPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [listBarang, setListBarang] = useState([]);

  // State Form
  const [formData, setFormData] = useState({
    tipe: "MASUK", // Default Masuk
    sukuCadangId: "",
    jumlah: "",
    keterangan: "",
  });

  // 1. Ambil Daftar Barang untuk Dropdown
  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const res = await fetch("/api/stok");
        const data = await res.json();
        if (res.ok) {
          setListBarang(data);
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, sukuCadangId: data[0].id }));
          }
        }
      } catch (err) {
        console.error("Gagal load barang", err);
      }
    };
    fetchBarang();
  }, []);

  // 2. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Transaksi Berhasil!");
        // Arahkan ke halaman tabel transaksi (yang akan kita buat di langkah 3)
        router.push("/dashboard/transaksi");
        router.refresh();
      } else {
        const err = await res.json();
        alert("Gagal: " + err.error);
      }
    } catch (error) {
      alert("Error Jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-white">
          Catat Transaksi Barang
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pilih Tipe Transaksi */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Jenis Transaksi
            </label>
            <select
              name="tipe"
              value={formData.tipe}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="MASUK">🔵 Barang Masuk (Restock)</option>
              <option value="KELUAR">
                🔴 Barang Keluar (Terpakai/Terjual)
              </option>
            </select>
          </div>

          {/* Pilih Barang */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Pilih Barang
            </label>
            <select
              name="sukuCadangId"
              value={formData.sukuCadangId}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded"
            >
              {listBarang.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.kodeBarang} - {item.namaBarang} (Stok: {item.stok})
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Jumlah</label>
            <input
              type="number"
              name="jumlah"
              min="1"
              value={formData.jumlah}
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded"
              placeholder="0"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Keterangan (Opsional)
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows="2"
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded"
              placeholder="Contoh: Pembelian dari Supplier A / Dipakai servis B 1234 XY"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded transition w-full"
            >
              {isLoading ? "Memproses..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
