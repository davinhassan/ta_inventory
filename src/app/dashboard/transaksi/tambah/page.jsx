"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Upload, ShoppingCart, Trash, Plus, Search, ArrowLeft, AlertTriangle, Package, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TambahTransaksiPage() {
  const router = useRouter();

  // State Data
  const [barangs, setBarangs] = useState([]);
  const [keranjang, setKeranjang] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fileBukti, setFileBukti] = useState(null);

  // STATE BARU: Untuk Tab Mobile (Produk vs Keranjang)
  const [activeTab, setActiveTab] = useState("produk"); // 'produk' | 'keranjang'

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

  // Fungsi Tambah ke Keranjang
  const addToCart = (barang) => {
    const exist = keranjang.find((x) => x.id === barang.id);

    if (exist) {
      if (exist.qty + 1 > barang.stok) return alert(`Stok hanya tersisa ${barang.stok}!`);
      setKeranjang(
        keranjang.map((x) =>
          x.id === barang.id
            ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.hargaJual }
            : x
        )
      );
    } else {
      if (barang.stok < 1) return alert("Stok Habis!");
      setKeranjang([
        ...keranjang,
        { ...barang, qty: 1, subtotal: barang.hargaJual },
      ]);
    }
    // Opsional: Beri feedback visual kecil (vibrate di HP)
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const removeFromCart = (id) => {
    setKeranjang(keranjang.filter((x) => x.id !== id));
  };

  const hitungTotal = () => keranjang.reduce((a, b) => a + b.subtotal, 0);

  const handleBayar = async () => {
    if (keranjang.length === 0) return alert("Keranjang masih kosong!");
    
    // REVISI: Perbaikan variabel 'file' menjadi 'fileBukti'
    if (!fileBukti) return alert("Wajib upload Bukti Struk/Foto Barang!");
    
    if (!confirm("Proses transaksi ini? Stok akan langsung berkurang.")) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("total", hitungTotal());
      formData.append("items", JSON.stringify(keranjang));

      if (fileBukti) {
        formData.append("buktiFoto", fileBukti);
      }

      const res = await fetch("/api/transaksi", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Transaksi Berhasil!");
        router.push("/dashboard/transaksi");
        router.refresh();
      } else {
        const errData = await res.json();
        alert("Gagal: " + (errData.error || "Terjadi kesalahan"));
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
      {/* LAYOUT UTAMA: Menggunakan h-[100dvh] (Dynamic Viewport Height) 
          agar pas di browser HP (Chrome/Safari Mobile).
      */}
      <div className="flex flex-col h-[100dvh] bg-gray-900 md:p-6 overflow-hidden">
        
        {/* HEADER MOBILE (Fixed Top) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <Link href="/dashboard/transaksi">
            <ArrowLeft className="text-gray-400" />
          </Link>
          <h1 className="text-lg font-bold text-white">
            {activeTab === "produk" ? "Pilih Produk" : "Keranjang & Bayar"}
          </h1>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* HEADER DESKTOP (Hidden on Mobile) */}
        <div className="hidden md:flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/transaksi" className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition">
              <ArrowLeft size={20} className="text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Kasir Penjualan</h1>
          </div>
        </div>

        {/* KONTEN UTAMA (GRID) */}
        <div className="flex-1 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* --- KOLOM KIRI: PRODUK --- 
                Di Mobile: Tampil HANYA JIKA activeTab === 'produk'
                Di Desktop: SELALU Tampil (flex)
            */}
            <div className={`lg:col-span-2 flex flex-col h-full overflow-hidden ${activeTab === 'produk' ? 'flex' : 'hidden lg:flex'}`}>
              
              {/* Search & Disclaimer */}
              <div className="p-4 md:p-0 space-y-3 shrink-0">
                 {/* Disclaimer Desktop Only (Biar mobile gak penuh) */}
                 <div className="hidden md:flex bg-yellow-900/40 border border-yellow-600 text-yellow-200 p-3 rounded-lg items-start gap-3 text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-500 mt-0.5" />
                    <div>
                        <strong>PENTING:</strong> Klik tombol "Bayar" akan <span className="text-red-400 font-bold underline">LANGSUNG MEMOTONG STOK</span>.
                    </div>
                 </div>

                 <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Cari nama barang..."
                      className="w-full bg-gray-800 md:bg-gray-700 text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 md:border-gray-600"
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
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">{brg.kodeBarang}</span>
                                <span className={`text-[10px] font-bold ${brg.stok < 5 ? 'text-red-400' : 'text-green-400'}`}>
                                    Stok: {brg.stok}
                                </span>
                            </div>
                            <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight mb-2">{brg.namaBarang}</h3>
                            <div className="mt-auto">
                                <p className="text-blue-400 font-bold text-sm">
                                    Rp {brg.hargaJual.toLocaleString("id-ID")}
                                </p>
                            </div>
                        </div>
                        {/* Mobile Tap Effect Feedback */}
                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 active:opacity-100 transition duration-75 pointer-events-none"/>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* --- KOLOM KANAN: KERANJANG --- 
                Di Mobile: Tampil HANYA JIKA activeTab === 'keranjang'
                Di Desktop: SELALU Tampil (flex)
            */}
            <div className={`bg-gray-800 md:p-5 rounded-xl border-t md:border border-gray-700 h-full md:max-h-[90vh] flex flex-col shadow-2xl 
                ${activeTab === 'keranjang' ? 'flex absolute inset-0 z-20 md:static' : 'hidden lg:flex'}`}>
              
              {/* Header Keranjang Mobile (Ada tombol back) */}
              <div className="md:hidden flex items-center p-4 border-b border-gray-700 bg-gray-800">
                  <button onClick={() => setActiveTab('produk')} className="mr-3 text-gray-400">
                      <ArrowLeft size={24}/>
                  </button>
                  <h2 className="font-bold text-white">Keranjang Belanja</h2>
              </div>

              {/* Header Keranjang Desktop */}
              <h2 className="hidden md:flex text-lg font-bold text-white mb-3 items-center gap-2 border-b border-gray-700 pb-3">
                <ShoppingCart size={20} className="text-blue-400" /> Keranjang
              </h2>

              {/* List Item */}
              <div className="flex-1 overflow-y-auto p-4 md:p-0 mb-4 space-y-2 custom-scrollbar">
                {keranjang.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                    <ShoppingCart size={40} className="mb-2 opacity-20" />
                    <p className="text-sm">Keranjang kosong.</p>
                    <button 
                        onClick={() => setActiveTab('produk')}
                        className="mt-4 md:hidden text-blue-400 text-sm underline"
                    >
                        Mulai Belanja
                    </button>
                  </div>
                ) : (
                  keranjang.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm text-gray-300 bg-gray-700/30 p-3 rounded-lg border border-gray-700">
                      <div className="flex-1">
                        <div className="font-bold text-white line-clamp-1">{item.namaBarang}</div>
                        <div className="text-xs text-gray-400 mt-1 flex justify-between w-full pr-4">
                          <span>{item.qty} x {item.hargaJual.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-400">Rp {item.subtotal.toLocaleString()}</div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-300 mt-1 p-1 rounded transition text-xs flex items-center gap-1 justify-end w-full"
                        >
                          <Trash size={12} /> Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bagian Bawah: Total & Upload */}
              <div className="mt-auto p-4 md:p-0 pt-4 border-t border-gray-700 space-y-4 bg-gray-800 md:bg-transparent">
                <div className="flex justify-between items-end">
                  <span className="text-gray-400 text-sm">Total Bayar</span>
                  <span className="text-2xl font-bold text-green-400">
                    Rp {hitungTotal().toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Upload Struk */}
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFileBukti(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-gray-900 border border-dashed border-gray-600 rounded-lg p-3 flex items-center gap-3 text-gray-400 group-hover:border-blue-500 transition">
                    <div className="bg-gray-800 p-2 rounded">
                      <Upload size={18} />
                    </div>
                    <div className="text-xs overflow-hidden flex-1">
                      {fileBukti ? (
                        <span className="text-green-400 font-medium truncate block">
                          {fileBukti.name}
                        </span>
                      ) : (
                        <span>Upload Struk (Wajib)</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBayar}
                  disabled={loading || keranjang.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? "Memproses..." : "Bayar Sekarang"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM NAVIGATION (MOBILE ONLY) 
            Ini muncul hanya di Mobile untuk pindah tab dengan cepat
        */}
        <div className="md:hidden bg-gray-800 border-t border-gray-700 p-2 flex justify-around items-center safe-area-pb">
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
                {/* Badge Jumlah Item */}
                {keranjang.length > 0 && (
                    <span className="absolute top-1 right-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {keranjang.reduce((a,b) => a + b.qty, 0)}
                    </span>
                )}
                <ShoppingCart size={20} />
                <span className="text-xs font-medium">
                    {keranjang.length > 0 ? `Rp ${hitungTotal().toLocaleString()}` : "Keranjang"}
                </span>
            </button>
        </div>

      </div>
    </AuthGuard>
  );
}