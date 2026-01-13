"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save } from "lucide-react";

function EditStokPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

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
    return (
      <div className="p-8 text-muted-foreground text-center">
        Sedang memuat data...
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN"]}>
      {/* 1. Responsif Padding & Container: p-4 di HP, p-8 di Desktop */}
      <div className="p-4 md:p-8 w-full max-w-lg mx-auto">
        {/* Tombol Kembali Responsif */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition hover:bg-secondary p-2 rounded-lg -ml-2 w-fit"
        >
          <ArrowLeft size={20} />{" "}
          <span className="text-sm md:text-base">Kembali</span>
        </button>

        <h1 className="text-xl md:text-2xl font-bold mb-6 text-foreground">
          Edit Suku Cadang
        </h1>

        <div className="bg-card p-5 md:p-8 rounded-xl border border-border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Kode Barang */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Kode Barang
              </label>
              <input
                type="text"
                name="kodeBarang"
                value={formData.kodeBarang}
                readOnly
                className="w-full bg-muted border border-input rounded-lg px-3 py-3 text-muted-foreground cursor-not-allowed text-sm md:text-base"
              />
              <p className="text-xs text-muted-foreground mt-1 italic">
                *Kode barang tidak dapat diubah
              </p>
            </div>

            {/* Nama Barang */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Nama Barang
              </label>
              <input
                type="text"
                name="namaBarang"
                value={formData.namaBarang}
                onChange={handleChange}
                required
                className="w-full bg-background border border-input rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Supplier
              </label>
              <div className="relative">
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  required
                  className="w-full bg-background border border-input rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition text-sm md:text-base"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {Array.isArray(suppliers) &&
                    suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.namaSupplier}
                      </option>
                    ))}
                </select>
                {/* Custom Arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. Grid Responsif: 1 Kolom di HP, 2 Kolom di Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Harga Beli
                </label>
                <input
                  type="number"
                  name="hargaBeli"
                  value={formData.hargaBeli}
                  onChange={handleChange}
                  required
                  className="w-full bg-background border border-input rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-green-600 dark:text-green-400 mb-1.5">
                  Harga Jual
                </label>
                <input
                  type="number"
                  name="hargaJual"
                  value={formData.hargaJual}
                  onChange={handleChange}
                  required
                  className="w-full bg-background border border-green-200 dark:border-green-600/50 rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm md:text-base"
                />
              </div>
            </div>

            {/* Margin Preview */}
            <div className="text-sm bg-secondary/30 p-3 rounded-lg border border-border">
              <span className="text-muted-foreground">Estimasi Margin: </span>
              <span
                className={
                  Number(formData.hargaJual) - Number(formData.hargaBeli) >= 0
                    ? "text-green-600 dark:text-green-400 font-bold ml-1"
                    : "text-red-600 dark:text-red-400 font-bold ml-1"
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
              <label className="block text-sm font-bold text-orange-600 dark:text-orange-400 mb-1.5">
                Batas Overstock
              </label>
              <input
                type="number"
                name="maxStok"
                value={formData.maxStok}
                onChange={handleChange}
                required
                className="w-full bg-background border border-orange-200 dark:border-orange-600/50 rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm md:text-base"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Peringatan muncul jika stok melebihi angka ini.
              </p>
            </div>

            {/* Tombol Aksi */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg mt-4 flex justify-center items-center gap-2 transition shadow-lg active:scale-95 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                "Menyimpan..."
              ) : (
                <>
                  <Save size={18} /> Simpan Perubahan
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}

export default EditStokPage;
