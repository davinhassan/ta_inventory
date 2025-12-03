"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditStokPage({ params }) {
  // 1. Unwrap Params (Next.js 15)
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  // State Form
  const [formData, setFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    hargaBeli: "",
    supplierId: "",
  });

  // 2. Fetch Data (Barang & Supplier) saat halaman dibuka
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data untuk ID:", id);

        // A. Ambil Data Barang yang mau diedit
        const resBarang = await fetch(`/api/stok/${id}`, { cache: "no-store" });

        if (!resBarang.ok) {
          throw new Error("Gagal mengambil data barang");
        }
        const dataBarang = await resBarang.json();

        // B. Ambil Daftar Supplier (untuk dropdown)
        const resSupplier = await fetch("/api/supplier");
        const dataSupplier = await resSupplier.json();

        // C. Masukkan data ke State Form
        setSuppliers(dataSupplier);
        setFormData({
          kodeBarang: dataBarang.kodeBarang,
          namaBarang: dataBarang.namaBarang,
          hargaBeli: dataBarang.hargaBeli,
          supplierId: dataBarang.supplierId, // ID supplier lama terpilih otomatis
        });
      } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data: " + error.message);
        router.push("/dashboard/stok");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  // 3. Handle Simpan Perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/stok/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Berhasil update barang!");
        router.push("/dashboard/stok");
        router.refresh();
      } else {
        const err = await res.json();
        alert("Gagal: " + err.error);
      }
    } catch (error) {
      alert("Error sistem");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading)
    return <div className="p-8 text-white">Sedang memuat data...</div>;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-white">Edit Suku Cadang</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kode Barang */}
          <div>
            <label className="block text-gray-300 mb-1 text-sm">
              Kode Barang
            </label>
            <input
              type="text"
              name="kodeBarang"
              value={formData.kodeBarang} // Terisi dari state
              onChange={handleChange}
              readOnly
              className="w-full bg-gray-700 border border-gray-600 text-gray-400 p-2 rounded cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              *Kode barang tidak dapat diubah
            </p>
          </div>

          {/* Nama Barang */}
          <div>
            <label className="block text-gray-300 mb-1 text-sm">
              Nama Barang
            </label>
            <input
              type="text"
              name="namaBarang"
              value={formData.namaBarang} // Terisi dari state
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Supplier Dropdown */}
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Supplier</label>
            <select
              name="supplierId"
              value={formData.supplierId} // Terpilih otomatis dari state
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.namaSupplier}
                </option>
              ))}
            </select>
          </div>

          {/* Harga Beli */}
          <div>
            <label className="block text-gray-300 mb-1 text-sm">
              Harga Beli (Rp)
            </label>
            <input
              type="number"
              name="hargaBeli"
              value={formData.hargaBeli} // Terisi dari state
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <Link href="/dashboard/stok">
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-6 rounded"
              >
                Batal
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
