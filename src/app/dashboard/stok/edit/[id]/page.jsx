"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

function PageEditStok() {
  const router = useRouter();
  const params = useParams(); // Hook untuk mendapatkan parameter URL
  const id = params.id; // Mengambil id dari URL

  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    hargaBeli: "",
    supplierId: "",
  });

  // useEffect untuk mengambil data LAMA dari item yang akan diedit
  useEffect(() => {
    if (id) {
      // Pastikan id sudah ada
      const fetchSukuCadangData = async () => {
        const response = await fetch(`/api/stok/${id}`);
        if (response.ok) {
          const data = await response.json();
          // Masukkan data lama ke dalam form state
          setFormData({
            kodeBarang: data.kodeBarang,
            namaBarang: data.namaBarang,
            hargaBeli: data.hargaBeli.toString(),
            supplierId: data.supplierId.toString(),
          });
        }
      };
      fetchSukuCadangData();
    }
  }, [id]); // Jalankan effect ini setiap kali 'id' berubah

  // useEffect untuk mengambil daftar supplier (sama seperti di halaman tambah)
  useEffect(() => {
    const fetchSuppliers = async () => {
      const response = await fetch("/api/supplier");
      const data = await response.json();
      setSuppliers(data);
    };
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Fungsi untuk menyimpan perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/stok/${id}`, {
        method: "PUT", // Menggunakan metode PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Data berhasil diperbarui!");
        router.push("/dashboard/stok"); // Kembali ke halaman daftar stok
      } else {
        alert("Gagal memperbarui data.");
      }
    } catch (error) {
      console.error("Terjadi error:", error);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Suku Cadang</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {/* Input Kode Barang */}
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
        {/* Input Nama Barang */}
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
        {/* Input Harga Beli */}
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
        {/* Dropdown Supplier */}
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
        {/* Tombol Aksi */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Simpan Perubahan
          </button>
          <Link href="/dashboard/stok">
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Batal
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default PageEditStok;
