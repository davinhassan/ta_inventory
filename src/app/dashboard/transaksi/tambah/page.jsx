"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// 1. Import AuthGuard
import AuthGuard from "@/components/AuthGuard";

export default function TambahTransaksiPage() {
  const router = useRouter();
  const [items, setItems] = useState([]); // List barang untuk dropdown
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    sukuCadangId: "",
    tipe: "MASUK", // Default: Barang Masuk
    jumlah: "",
    keterangan: "",
  });

  // 2. Ambil data Stok Barang saat halaman dibuka (untuk isi dropdown)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/stok");
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error("Gagal ambil data barang:", error);
      }
    };
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi sederhana
    if (!formData.sukuCadangId) {
      alert("Harap pilih barang terlebih dahulu!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pastikan jumlah dikirim sebagai Number (Integer)
        body: JSON.stringify({
          ...formData,
          jumlah: parseInt(formData.jumlah),
        }),
      });

      if (res.ok) {
        alert("Transaksi berhasil dicatat!");
        router.push("/dashboard/transaksi");
        router.refresh();
      } else {
        const err = await res.json();
        alert("Gagal: " + (err.error || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error(error);
      alert("Error sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 3. Pasang AuthGuard: Izinkan SEMUA ROLE (Operasional harian)
    <AuthGuard allowedRoles={["PEMILIK", "ADMIN", "STAFF"]}>
      
      <div className="p-8">
        <div className="max-w-lg mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-4">
            Catat Transaksi Baru
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Pilih Barang */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Pilih Barang
              </label>
              <select
                name="sukuCadangId"
                value={formData.sukuCadangId}
                onChange={handleChange}
                required
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Pilih Suku Cadang --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.kodeBarang} - {item.namaBarang} (Stok: {item.stok})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipe Transaksi */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Tipe Transaksi
              </label>
              <select
                name="tipe"
                value={formData.tipe}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="MASUK">🟢 Barang Masuk (Stok Bertambah)</option>
                <option value="KELUAR">🔴 Barang Keluar (Stok Berkurang)</option>
              </select>
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Jumlah
              </label>
              <input
                type="number"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleChange}
                required
                min="1"
                placeholder="0"
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Keterangan / Catatan
              </label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows="3"
                placeholder="Contoh: Restock dari supplier / Dipakai untuk servis motor Vario..."
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-4 pt-6 border-t border-gray-700 mt-6">
              <Link href="/dashboard/transaksi">
                <button
                  type="button"
                  className="bg-transparent border border-gray-500 text-gray-300 font-bold py-2.5 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg text-white
                  ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-900/50"}`}
              >
                {loading ? "Menyimpan..." : "Simpan Transaksi"}
              </button>
            </div>
          </form>
        </div>
      </div>

    </AuthGuard>
  );
}