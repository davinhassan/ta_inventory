"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function PageTambahStok() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    hargaBeli: "",
    supplierId: "",
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/supplier");
        const data = await response.json();

        // --- TAMBAHAN UNTUK DEBUGGING ---
        console.log("Data supplier yang diterima:", data);
        // ---------------------------------

        setSuppliers(data);
      } catch (error) {
        console.error("Gagal mengambil data supplier di frontend:", error);
      }
    };
    fetchSuppliers();
  }, []);

  // ... sisa kode (handleChange, handleSubmit, dan return) tetap sama ...
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/stok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Data berhasil ditambahkan!");
        router.push("/dashboard/stok");
      } else {
        alert("Gagal menambahkan data.");
      }
    } catch (error) {
      console.error("Terjadi error:", error);
      alert("Terjadi kesalahan pada koneksi.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tambah Suku Cadang Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label
            htmlFor="kodeBarang"
            className="block text-sm font-medium text-gray-300"
          >
            Kode Barang
          </label>
          <input
            type="text"
            id="kodeBarang"
            name="kodeBarang"
            value={formData.kodeBarang}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="namaBarang"
            className="block text-sm font-medium text-gray-300"
          >
            Nama Barang
          </label>
          <input
            type="text"
            id="namaBarang"
            name="namaBarang"
            value={formData.namaBarang}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="hargaBeli"
            className="block text-sm font-medium text-gray-300"
          >
            Harga Beli
          </label>
          <input
            type="number"
            id="hargaBeli"
            name="hargaBeli"
            value={formData.hargaBeli}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="supplierId"
            className="block text-sm font-medium text-gray-300"
          >
            Supplier
          </label>
          <select
            id="supplierId"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">-- Pilih Supplier --</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.namaSupplier}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Simpan
          </button>
          <Link href="/dashboard/stok">
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Kembali
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default PageTambahStok;
