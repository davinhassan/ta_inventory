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
    hargaJual: "", // Tambahan: Biar tidak undefined
    maxStok: "",   // Tambahan: Biar tidak undefined
    supplierId: "",
  });

  // 2. Fetch Data dengan Pengecekan Ketat
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/supplier");
        const data = await response.json();

        // Cek di console browser (F12) apakah data masuk atau error
        console.log("Data Supplier dari API:", data);

        // HANYA simpan ke state jika datanya benar-benar ARRAY
        if (Array.isArray(data)) {
          setSuppliers(data);
        } else {
          console.error("API Error: Data bukan array (Mungkin error database)", data);
          setSuppliers([]); // Tetap array kosong biar tidak crash
        }
      } catch (error) {
        console.error("Gagal koneksi ke API:", error);
        setSuppliers([]); // Tetap array kosong
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
    
    // Konversi angka sebelum kirim (PENTING biar database tidak corrupt lagi)
    const payload = {
        ...formData,
        hargaBeli: Number(formData.hargaBeli),
        hargaJual: Number(formData.hargaJual || 0),
        maxStok: Number(formData.maxStok || 50),
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
        <h1 className="text-2xl font-bold mb-4 text-white">Tambah Suku Cadang Baru</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          
          {/* Kode Barang */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Kode Barang</label>
            <input
              type="text"
              name="kodeBarang"
              value={formData.kodeBarang}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          {/* Nama Barang */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Nama Barang</label>
            <input
              type="text"
              name="namaBarang"
              value={formData.namaBarang}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          {/* Harga Beli */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Harga Beli</label>
            <input
              type="number"
              name="hargaBeli"
              value={formData.hargaBeli}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          {/* Supplier Dropdown (ANTI CRASH VERSION) */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Supplier</label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            >
              <option value="">-- Pilih Supplier --</option>
              
              {/* Cek apakah isLoading selesai DAN suppliers adalah Array */}
              {!isLoadingSuppliers && Array.isArray(suppliers) && suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.namaSupplier}
                  </option>
                ))
              ) : (
                <option disabled>
                    {isLoadingSuppliers ? "Memuat..." : "Data supplier kosong / Error Database"}
                </option>
              )}
            </select>
          </div>

          {/* Tombol */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Simpan
            </button>
            <Link href="/dashboard/stok">
              <button
                type="button"
                className="py-2 px-4 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
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