"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

function EditStokPage({ params }) {
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
    hargaJual: "",
    maxStok: "",
    supplierId: "",
  });

  // 2. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resBarang = await fetch(`/api/stok/${id}`, { cache: "no-store" });
        if (!resBarang.ok) throw new Error("Gagal mengambil data barang");
        const dataBarang = await resBarang.json();

        const resSupplier = await fetch("/api/supplier");
        const dataSupplier = await resSupplier.json();

        setSuppliers(dataSupplier || []);
        setFormData({
          kodeBarang: dataBarang.kodeBarang,
          namaBarang: dataBarang.namaBarang,
          hargaBeli: dataBarang.hargaBeli || 0,
          hargaJual: dataBarang.hargaJual || 0,
          maxStok: dataBarang.maxStok || 50,
          supplierId: dataBarang.supplierId || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Gagal memuat data barang.");
        router.push("/dashboard/stok");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  // 3. Handle Perubahan Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. Handle Simpan Perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Konversi angka
    const payload = {
      ...formData,
      hargaBeli: Number(formData.hargaBeli),
      hargaJual: Number(formData.hargaJual),
      maxStok: Number(formData.maxStok),
      supplierId: Number(formData.supplierId),
    };

    try {
      const response = await fetch(`/api/stok/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Data berhasil diperbarui!");
        router.push("/dashboard/stok");
        router.refresh();
      } else {
        const err = await response.json();
        alert("Gagal update: " + (err.error || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-white">Sedang memuat data...</div>;
  }

  return (
    // REVISI: HAPUS "STAFF" DARI SINI
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-white">Edit Suku Cadang</h1>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          {/* Kode Barang */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Kode Barang
            </label>
            <input
              type="text"
              name="kodeBarang"
              value={formData.kodeBarang}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md shadow-sm text-gray-300 cursor-not-allowed sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              *Kode barang tidak dapat diubah
            </p>
          </div>

          {/* Nama Barang */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Nama Barang
            </label>
            <input
              type="text"
              name="namaBarang"
              value={formData.namaBarang}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Supplier
            </label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- Pilih Supplier --</option>
              {Array.isArray(suppliers) &&
                suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.namaSupplier}
                  </option>
                ))}
            </select>
          </div>

          {/* Harga Beli & Jual */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Harga Beli
              </label>
              <input
                type="number"
                name="hargaBeli"
                value={formData.hargaBeli}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-green-400">
                Harga Jual
              </label>
              <input
                type="number"
                name="hargaJual"
                value={formData.hargaJual}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-green-600 rounded-md shadow-sm text-white focus:ring-green-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Margin Preview */}
          <div className="text-sm">
            <span className="text-gray-400">Estimasi Margin: </span>
            <span
              className={
                Number(formData.hargaJual) - Number(formData.hargaBeli) >= 0
                  ? "text-green-400 font-bold"
                  : "text-red-400 font-bold"
              }
            >
              Rp{" "}
              {(
                Number(formData.hargaJual) - Number(formData.hargaBeli)
              ).toLocaleString("id-ID")}
            </span>
          </div>

          {/* Batas Overstock */}
          <div>
            <label className="block text-sm font-bold text-orange-400">
              Batas Overstock
            </label>
            <input
              type="number"
              name="maxStok"
              value={formData.maxStok}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-orange-600 rounded-md shadow-sm text-white focus:ring-orange-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Peringatan muncul jika stok melebihi angka ini.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <Link href="/dashboard/stok">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Batal
              </button>
            </Link>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}

export default EditStokPage;
