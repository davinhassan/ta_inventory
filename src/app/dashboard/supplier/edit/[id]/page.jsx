"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save, Truck, Phone, MapPin } from "lucide-react"; // Ikon pemanis

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

  // 2. Fetch Data
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const url = `/api/supplier/${id}`;
        const res = await fetch(url, {
          cache: "no-store",
          headers: { Pragma: "no-cache" },
        });

        if (!res.ok) throw new Error("Gagal mengambil data");

        const data = await res.json();

        setFormData({
          namaSupplier: data.namaSupplier || "",
          alamat: data.alamat || "",
          telepon: data.telepon || "",
        });
      } catch (error) {
        console.error("ERROR:", error);
        alert("Gagal mengambil data supplier.");
        router.push("/dashboard/supplier");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchSupplier();
  }, [id, router]);

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
      alert("Error koneksi jaringan");
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
    // REVISI: HAPUS "STAFF" DARI SINI
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN"]}>
      <div className="p-8 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard/supplier"
            className="p-2 bg-gray-800 text-gray-400 rounded hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Edit Supplier</h1>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Supplier */}
            <div>
              <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <Truck size={14} /> Nama Supplier
              </label>
              <input
                type="text"
                name="namaSupplier"
                value={formData.namaSupplier}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Telepon */}
            <div>
              <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <Phone size={14} /> Telepon
              </label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <MapPin size={14} /> Alamat Lengkap
              </label>
              <textarea
                name="alamat"
                rows="3"
                value={formData.alamat}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                required
              />
            </div>

            {/* Tombol Aksi */}
            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition disabled:opacity-50"
              >
                {isSaving ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Save size={18} /> Simpan Perubahan
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
