"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save } from "lucide-react"; // Tambah ikon biar cantik

function PageTambahStok() {
  const router = useRouter();

  // 1. Inisialisasi state
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    hargaBeli: "",
    hargaJual: "", // Field baru
    maxStok: "", // Field baru
    supplierId: "",
  });

  // 2. Fetch Data Supplier
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/supplier");
        const data = await response.json();

        // Validasi Array
        if (Array.isArray(data)) {
          setSuppliers(data);
        } else {
          setSuppliers([]);
        }
      } catch (error) {
        console.error("Gagal koneksi ke API:", error);
        setSuppliers([]);
      } finally {
        setIsLoadingSuppliers(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Konversi angka sebelum kirim
    const payload = {
      ...formData,
      hargaBeli: Number(formData.hargaBeli),
      hargaJual: Number(formData.hargaJual || 0),
      maxStok: Number(formData.maxStok || 50), // Default 50
      supplierId: Number(formData.supplierId),
    };

    try {
      const response = await fetch("/api/stok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Data berhasil ditambahkan!");
        router.push("/dashboard/stok");
        router.refresh();
      } else {
        const err = await response.json();
        alert("Gagal: " + (err.error || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Error submit:", error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // REVISI: HAPUS "STAFF" DARI SINI
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN"]}>
      <div className="p-8 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard/stok"
            className="p-2 bg-gray-800 text-gray-400 rounded hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Tambah Barang Baru</h1>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kode Barang */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Kode Barang
              </label>
              <input
                type="text"
                name="kodeBarang"
                value={formData.kodeBarang}
                onChange={handleChange}
                placeholder="Contoh: BRG-001"
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                placeholder="Contoh: Oli Mesin 1L"
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* GRID: Harga Beli & Harga Jual */}
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
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-green-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
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

            {/* Supplier Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Supplier
              </label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Pilih Supplier --</option>
                {!isLoadingSuppliers &&
                Array.isArray(suppliers) &&
                suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.namaSupplier}
                    </option>
                  ))
                ) : (
                  <option disabled>
                    {isLoadingSuppliers ? "Memuat..." : "Data supplier kosong"}
                  </option>
                )}
              </select>
            </div>

            {/* Max Stok */}
            <div>
              <label className="block text-sm font-medium text-orange-400">
                Batas Max Stok (Opsional)
              </label>
              <input
                type="number"
                name="maxStok"
                value={formData.maxStok}
                onChange={handleChange}
                placeholder="Default: 50"
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-orange-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sistem akan memberi peringatan jika stok melebihi angka ini.
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
              >
                {isSaving ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Save size={18} /> Simpan Barang
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}

export default PageTambahStok;
