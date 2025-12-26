"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

function PageTambahStok() {
  const router = useRouter();

  // 1. Inisialisasi state sebagai array kosong [] agar aman
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);

  const [formData, setFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    hargaBeli: "",
    hargaJual: "", // Field baru
    maxStok: "", // Field baru
    supplierId: "",
  });

  // 2. Fetch Data dengan Pengecekan Ketat (Anti-Crash)
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/supplier");
        const data = await response.json();

        // Cek console browser untuk debugging
        console.log("Data Supplier dari API:", data);

        // HANYA simpan jika data adalah Array
        if (Array.isArray(data)) {
          setSuppliers(data);
        } else {
          console.error("API Error: Data bukan array", data);
          setSuppliers([]); // Fallback ke array kosong
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

    // Konversi angka sebelum kirim (PENTING)
    const payload = {
      ...formData,
      hargaBeli: Number(formData.hargaBeli),
      hargaJual: Number(formData.hargaJual || 0), // Default 0 jika kosong
      maxStok: Number(formData.maxStok || 50), // Default 50 jika kosong
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
    }
  };

  return (
    <AuthGuard allowedRoles={["PEMILIK", "ADMIN", "STAFF"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-white">
          Tambah Suku Cadang Baru
        </h1>

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
              onChange={handleChange}
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
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* GRID: Harga Beli & Harga Jual (Berdampingan) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Harga Beli */}
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

            {/* Harga Jual (Input Baru) */}
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

          {/* Supplier Dropdown (Aman) */}
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

          {/* Max Stok (Input Baru) */}
          <div>
            <label className="block text-sm font-medium text-orange-400">
              Batas Max Stok (Opsional)
            </label>
            <input
              type="number"
              name="maxStok"
              value={formData.maxStok}
              onChange={handleChange}
              placeholder="50"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-orange-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sistem akan memberi peringatan jika stok melebihi angka ini.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Simpan
            </button>
            <Link href="/dashboard/stok">
              <button
                type="button"
                className="py-2 px-4 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Kembali
              </button>
            </Link>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}

export default PageTambahStok;
