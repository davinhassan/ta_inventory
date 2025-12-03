"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditSupplierPage({ params }) {
  // 1. Ambil ID dengan aman (Next.js 15)
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    namaSupplier: "",
    alamat: "",
    telepon: "",
  });

  // 2. Fetch Data dengan LOGGING LENGKAP
  useEffect(() => {
    const fetchSupplier = async () => {
      console.log("--- MULAI FETCH DATA ---");
      console.log("ID yang dicari:", id);

      try {
        const url = `/api/supplier/${id}`;
        console.log("URL Fetch:", url);

        const res = await fetch(url, {
          cache: "no-store", // Paksa ambil data baru, jangan pakai cache
          headers: {
            Pragma: "no-cache",
          },
        });

        console.log("Status Response:", res.status, res.statusText);

        if (!res.ok) {
          // Jika error, kita baca teksnya supaya tau kenapa
          const textError = await res.text();
          console.error("Respon Error dari Server:", textError);
          throw new Error(`Gagal fetch: ${res.status} ${res.statusText}`);
        }

        // Jika sukses, baca JSON
        const data = await res.json();
        console.log("Data diterima:", data);

        setFormData({
          namaSupplier: data.namaSupplier || "",
          alamat: data.alamat || "",
          telepon: data.telepon || "",
        });
      } catch (error) {
        console.error("ERROR FATAL:", error);
        alert("Gagal mengambil data: " + error.message);
      } finally {
        setIsLoading(false);
        console.log("--- SELESAI FETCH ---");
      }
    };

    if (id) {
      fetchSupplier();
    }
  }, [id]);

  // 3. Handle Simpan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/supplier/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Berhasil update supplier!");
        router.push("/dashboard/supplier");
        router.refresh();
      } else {
        const err = await res.json();
        alert("Gagal: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Error jaringan");
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
        <h1 className="text-2xl font-bold mb-6 text-white">
          Edit Supplier (ID: {id})
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Nama Supplier
            </label>
            <input
              type="text"
              name="namaSupplier"
              value={formData.namaSupplier}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm">Alamat</label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              rows="3"
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm">Telepon</label>
            <input
              type="text"
              name="telepon"
              value={formData.telepon}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <Link href="/dashboard/supplier">
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
