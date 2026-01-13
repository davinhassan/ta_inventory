"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save, Truck, Phone, MapPin } from "lucide-react";

export default function EditSupplierPage({ params }) {
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

  // Fetch Data (Logic tetap sama)
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

  // Handle Simpan (Logic tetap sama)
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
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
        <span className="animate-pulse">Sedang memuat data...</span>
      </div>
    );

  return (
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN"]}>
      {/* RESPONSIVE UPDATE */}
      <div className="p-4 md:p-8 w-full min-h-screen">
        
        {/* Container Form */}
        <div className="max-w-lg mx-auto">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/dashboard/supplier"
              className="p-2 bg-card border border-border text-muted-foreground rounded hover:text-foreground transition hover:bg-secondary"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Edit Supplier
            </h1>
          </div>

          {/* Form Container */}
          <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Nama Supplier */}
              <div>
                <label className="text-muted-foreground text-sm mb-1 flex items-center gap-2">
                  <Truck size={14} /> Nama Supplier
                </label>
                <input
                  type="text"
                  name="namaSupplier"
                  value={formData.namaSupplier}
                  onChange={handleChange}
                  placeholder="Contoh: PT. Maju Jaya"
                  className="w-full bg-background border border-input text-foreground p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base placeholder:text-muted-foreground"
                  required
                />
              </div>

              {/* Telepon */}
              <div>
                <label className="text-muted-foreground text-sm mb-1 flex items-center gap-2">
                  <Phone size={14} /> Telepon
                </label>
                <input
                  type="tel" 
                  name="telepon"
                  value={formData.telepon}
                  onChange={handleChange}
                  placeholder="0812..."
                  className="w-full bg-background border border-input text-foreground p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base placeholder:text-muted-foreground"
                  required
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="text-muted-foreground text-sm mb-1 flex items-center gap-2">
                  <MapPin size={14} /> Alamat Lengkap
                </label>
                <textarea
                  name="alamat"
                  rows="3"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Jalan..."
                  className="w-full bg-background border border-input text-foreground p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm sm:text-base placeholder:text-muted-foreground"
                  required
                />
              </div>

              {/* Tombol Aksi */}
              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50 active:scale-[0.98]"
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
      </div>
    </AuthGuard>
  );
}