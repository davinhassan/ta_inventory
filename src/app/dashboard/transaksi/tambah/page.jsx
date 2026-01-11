"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Upload, ShoppingCart, Trash, Search, ArrowLeft, AlertTriangle, Package, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Optimasi Gambar Next.js

export default function TambahTransaksiPage() {
  const router = useRouter();
  const fileInputRef = useRef(null); // Ref untuk reset input file

  // State Data
  const [barangs, setBarangs] = useState([]);
  const [keranjang, setKeranjang] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // State File & Preview
  const [fileBukti, setFileBukti] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // UX: Preview Gambar

  const [activeTab, setActiveTab] = useState("produk");

  // Fetch Data
  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const res = await fetch("/api/stok-master");
        if (res.ok) {
          const data = await res.json();
          setBarangs(data);
        }
      } catch (err) {
        console.error("Error koneksi:", err);
      }
    };
    fetchBarang();
  }, []);

  // --- LOGIKA KERANJANG YANG LEBIH AMAN ---
  const addToCart = (barang) => {
    const exist = keranjang.find((x) => x.id === barang.id);
    // Konversi harga ke Number untuk mencegah error matematika (String * Int = NaN)
    const hargaFix = Number(barang.hargaJual); 

    if (exist) {
      if (exist.qty + 1 > barang.stok) return alert(`Stok hanya tersisa ${barang.stok}!`);
      setKeranjang(
        keranjang.map((x) =>
          x.id === barang.id
            ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * hargaFix }
            : x
        )
      );
    } else {
      if (barang.stok < 1) return alert("Stok Habis!");
      setKeranjang([
        ...keranjang,
        { ...barang, qty: 1, hargaJual: hargaFix, subtotal: hargaFix },
      ]);
    }
    // Feedback Haptic (Getar) di HP
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const removeFromCart = (id) => {
    setKeranjang(keranjang.filter((x) => x.id !== id));
  };

  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    const barangAsli = barangs.find(b => b.id === id);
    if (newQty > barangAsli.stok) return alert("Melebihi stok tersedia!");

    setKeranjang(keranjang.map(item => 
      item.id === id 
        ? { ...item, qty: newQty, subtotal: newQty * item.hargaJual }
        : item
    ));
  };

  const hitungTotal = () => keranjang.reduce((a, b) => a + b.subtotal, 0);

  // --- HANDLER FILE DENGAN PREVIEW ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFileBukti(file);
        // Buat URL sementara untuk preview
        setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const clearFile = () => {
    setFileBukti(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- PROSES BAYAR ---
  const handleBayar = async () => {
    if (keranjang.length === 0) return alert("Keranjang masih kosong!");
    if (!fileBukti) return alert("Wajib upload Bukti Struk/Foto Barang!");
    
    // Konfirmasi UX yang lebih baik bisa pakai Modal, tapi confirm() cukup untuk MVP
    if (!confirm(`Total Rp ${hitungTotal().toLocaleString("id-ID")}\nProses transaksi ini?`)) return;

    setLoading(true);

    try {
      const formData = new FormData();
      // Backend akan menghitung ulang total, tapi kita kirim saja sebagai referensi
      formData.append("total", hitungTotal()); 
      
      // Map keranjang ke format yang efisien (hanya ID dan Qty)
      const itemsToSend = keranjang.map(item => ({
        id: item.id,
        qty: item.qty,
        hargaJual: item.hargaJual, // Backend akan override ini, tapi kirim saja
        subtotal: item.subtotal
      }));
      
      formData.append("items", JSON.stringify(itemsToSend));
      formData.append("buktiFoto", fileBukti);

      const res = await fetch("/api/transaksi", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert("Transaksi Berhasil!");
        // RESET STATE SETELAH SUKSES
        setKeranjang([]);
        clearFile();
        router.refresh(); 
        router.push("/dashboard/transaksi");
      } else {
        alert("Gagal: " + (result.error || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem/jaringan");
    } finally {
      setLoading(false);
    }
  };

  const filteredBarangs = barangs.filter((b) =>
    b.namaBarang?.toLowerCase().includes(search.toLowerCase()) ||
    b.kodeBarang?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN", "STAFF"]}>
      <div className="flex flex-col h-[100dvh] bg-gray-900 md:p-6 overflow-hidden">
        
        {/* HEADER MOBILE */}
        <div className="md:hidden flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-md z-10">
          <Link href="/dashboard/transaksi">
            <ArrowLeft className="text-gray-400" />
          </Link>
          <h1 className="text-lg font-bold text-white">
            {activeTab === "produk" ? "Kasir" : "Pembayaran"}
          </h1>
          <div className="w-6" />
        </div>

        {/* HEADER DESKTOP */}
        <div className="hidden md:flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/transaksi" className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition">
              <ArrowLeft size={20} className="text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Kasir Penjualan</h1>
          </div>
        </div>

        {/* KONTEN UTAMA */}
        <div className="flex-1 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* --- KOLOM KIRI: PRODUK --- */}
            <div className={`lg:col-span-2 flex flex-col h-full overflow-hidden ${activeTab === 'produk' ? 'flex' : 'hidden lg:flex'}`}>
              
              {/* Search Bar */}
              <div className="p-4 md:p-0 mb-4 shrink-0">
                 <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Cari nama barang atau kode..."
                      className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 placeholder-gray-500"
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
              </div>

              {/* Grid Barang */}
              <div className="flex-1 overflow-y-auto p-4 md:p-0 custom-scrollbar pb-24 md:pb-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {filteredBarangs.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center text-gray-500 mt-10">
                      <Package size={40} className="mb-2 opacity-50"/>
                      <p>Barang tidak ditemukan.</p>
                    </div>
                  ) : (
                    filteredBarangs.map((brg) => (
                      <div
                        key={brg.id}
                        onClick={() => addToCart(brg)}
                        className={`bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-700 cursor-pointer transition relative overflow-hidden group 
                          ${brg.stok === 0 ? 'opacity-50 pointer-events-none grayscale' : 'active:scale-95 hover:border-blue-500'}`}
                      >
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-300 font-mono">{brg.kodeBarang}</span>
                                    <span className={`text-[10px] font-bold ${brg.stok < 5 ? 'text-red-400' : 'text-green-400'}`}>
                                        Stok: {brg.stok}
                                    </span>
                                </div>
                                <h3 className="font-medium text-white text-sm line-clamp-2 leading-snug mb-2">{brg.namaBarang}</h3>
                            </div>
                            <p className="text-blue-400 font-bold text-sm">
                                Rp {Number(brg.hargaJual).toLocaleString("id-ID")}
                            </p>
                        </div>
                        {/* Ripple Effect Simulation */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 active:opacity-100 transition duration-75 pointer-events-none"/>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* --- KOLOM KANAN: KERANJANG --- */}
            <div className={`bg-gray-800 md:rounded-xl border-t md:border border-gray-700 h-full flex flex-col shadow-2xl 
                ${activeTab === 'keranjang' ? 'fixed inset-0 z-50 bg-gray-900 md:static' : 'hidden lg:flex'}`}>
              
              {/* Header Mobile Keranjang */}
              <div className="md:hidden flex items-center p-4 border-b border-gray-700 bg-gray-800">
                  <button onClick={() => setActiveTab('produk')} className="mr-3 text-gray-400 p-1">
                      <ArrowLeft size={24}/>
                  </button>
                  <h2 className="font-bold text-white text-lg">Detail Pesanan</h2>
              </div>

              {/* Header Desktop */}
              <div className="hidden md:flex p-5 border-b border-gray-700 justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingCart size={20} className="text-blue-400" /> Keranjang
                </h2>
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
                    {keranjang.reduce((a,b)=> a+b.qty, 0)} Item
                </span>
              </div>

              {/* List Item */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {keranjang.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <ShoppingCart size={48} className="mb-3 opacity-20" />
                    <p className="text-sm">Belum ada barang.</p>
                    <button onClick={() => setActiveTab('produk')} className="mt-4 md:hidden text-blue-400 text-sm underline">
                        Tambah Barang
                    </button>
                  </div>
                ) : (
                  keranjang.map((item, idx) => (
                    <div key={idx} className="bg-gray-700/40 p-3 rounded-lg border border-gray-700/50 flex gap-3">
                      {/* Kontrol Qty */}
                      <div className="flex flex-col justify-between items-center bg-gray-800 rounded w-8 border border-gray-600">
                         <button onClick={() => updateQty(item.id, item.qty + 1)} className="text-gray-400 hover:text-white pb-1">+</button>
                         <span className="text-xs font-bold text-white">{item.qty}</span>
                         <button onClick={() => updateQty(item.id, item.qty - 1)} className="text-gray-400 hover:text-white pt-1">-</button>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-medium text-white text-sm line-clamp-1">{item.namaBarang}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 ml-2">
                                <Trash size={14} />
                            </button>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-xs text-gray-400">@ {item.hargaJual.toLocaleString()}</span>
                            <span className="text-sm font-bold text-blue-400">Rp {item.subtotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bagian Bawah: Total & Upload */}
              <div className="p-5 border-t border-gray-700 bg-gray-800 md:rounded-b-xl space-y-4">
                
                {/* Total */}
                <div className="flex justify-between items-end">
                  <span className="text-gray-400 text-sm">Total Tagihan</span>
                  <span className="text-2xl font-bold text-green-400">
                    Rp {hitungTotal().toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Upload Struk dengan Preview */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 ml-1">Bukti Foto / Struk *</label>
                    
                    {!previewUrl ? (
                        <div className="relative group">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="bg-gray-900 border border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center gap-2 text-gray-400 group-hover:border-blue-500 transition hover:bg-gray-800/50">
                                <Upload size={20} />
                                <span className="text-xs">Klik untuk upload foto</span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative rounded-lg overflow-hidden border border-gray-600 h-32 w-full group">
                            <Image 
                                src={previewUrl} 
                                alt="Preview" 
                                fill 
                                className="object-cover" 
                            />
                            {/* Tombol Hapus Gambar */}
                            <button 
                                onClick={clearFile}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition"
                            >
                                <X size={14} />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 text-center truncate">
                                {fileBukti?.name}
                            </div>
                        </div>
                    )}
                </div>

                <button
                  onClick={handleBayar}
                  disabled={loading || keranjang.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                        Memproses...
                    </>
                  ) : "Bayar Sekarang"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM NAVIGATION (MOBILE ONLY) */}
        <div className="md:hidden bg-gray-800 border-t border-gray-700 p-2 flex justify-around items-center pb-safe">
            <button 
                onClick={() => setActiveTab('produk')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg w-1/2 transition ${activeTab === 'produk' ? 'text-blue-400 bg-gray-700/50' : 'text-gray-400'}`}
            >
                <Package size={20} />
                <span className="text-xs font-medium">Produk</span>
            </button>
            <button 
                onClick={() => setActiveTab('keranjang')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg w-1/2 transition relative ${activeTab === 'keranjang' ? 'text-blue-400 bg-gray-700/50' : 'text-gray-400'}`}
            >
                {keranjang.length > 0 && (
                    <span className="absolute top-1 right-[30%] bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                        {keranjang.reduce((a,b) => a + b.qty, 0)}
                    </span>
                )}
                <ShoppingCart size={20} />
                <span className="text-xs font-medium">Keranjang</span>
            </button>
        </div>

      </div>
    </AuthGuard>
  );
}