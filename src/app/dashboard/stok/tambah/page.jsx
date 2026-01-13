"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save } from "lucide-react";

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
    hargaJual: "",
    maxStok: "",
    supplierId: "",
  });

  // 2. Fetch Data Supplier
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/supplier");
        const data = await response.json();

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
    } finally {
      setIsSaving(false);
    }
  };

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

        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-6">
          Tambah Barang Baru
        </h1>

        {/* Form Container */}
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
                onChange={handleChange}
                placeholder="Contoh: BRG-001"
                className="w-full bg-background border border-input rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base placeholder:text-muted-foreground"
                required
              />
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
                placeholder="Contoh: Oli Mesin 1L"
                className="w-full bg-background border border-input rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base placeholder:text-muted-foreground"
                required
              />
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
                  className="w-full bg-background border border-input rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base placeholder:text-muted-foreground"
                  required
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
                  className="w-full bg-background border border-green-200 dark:border-green-600/50 rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm md:text-base placeholder:text-muted-foreground"
                  required
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

            {/* Supplier Dropdown */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Supplier
              </label>
              <div className="relative">
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className="w-full bg-background border border-input rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition text-sm md:text-base"
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
                      {isLoadingSuppliers
                        ? "Memuat..."
                        : "Data supplier kosong"}
                    </option>
                  )}
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

            {/* Max Stok */}
            <div>
              <label className="block text-sm font-bold text-orange-600 dark:text-orange-400 mb-1.5">
                Batas Max Stok (Opsional)
              </label>
              <input
                type="number"
                name="maxStok"
                value={formData.maxStok}
                onChange={handleChange}
                placeholder="Default: 50"
                className="w-full bg-background border border-orange-200 dark:border-orange-600/50 rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm md:text-base placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sistem akan memberi peringatan jika stok melebihi angka ini.
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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
