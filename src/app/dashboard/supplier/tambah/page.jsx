"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TambahSupplierPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    namaSupplier: "",
    alamat: "",
    telepon: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Berhasil tambah supplier!");
        router.push("/dashboard/supplier"); // Balik ke tabel
        router.refresh();
      } else {
        alert("Gagal menambahkan supplier");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Tambah Supplier Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nama Supplier</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.namaSupplier}
            onChange={(e) => setForm({ ...form, namaSupplier: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Alamat</label>
          <textarea
            className="w-full border p-2 rounded"
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Telepon</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.telepon}
            onChange={(e) => setForm({ ...form, telepon: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
