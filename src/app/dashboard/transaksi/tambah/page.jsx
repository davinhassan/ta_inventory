"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Upload, ShoppingCart, Trash, Plus, Search, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function TambahTransaksiPage() {
  const router = useRouter();
  
  // State Data
  const [barangs, setBarangs] = useState([]);
  const [keranjang, setKeranjang] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // State File Upload
  const [fileBukti, setFileBukti] = useState(null);

  // 1. AMBIL DATA DARI API STOK MASTER (YANG BARU DIBUAT)
  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const res = await fetch("/api/stok-master"); // <-- Memanggil file route.js yang baru
        if (res.ok) {
            const data = await res.json();
            setBarangs(data);
        } else {
            console.error("Gagal load stok master");
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
    
    // Validasi Stok
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
  };

  const removeFromCart = (id) => {
    setKeranjang(keranjang.filter((x) => x.id !== id));
  };

  const hitungTotal = () => keranjang.reduce((a, b) => a + b.subtotal, 0);

  // LOGIKA BAYAR (SUDAH FIX FORMDATA)
  const handleBayar = async () => {
    if (keranjang.length === 0) return alert("Keranjang masih kosong!");
    if (!file) return alert("Wajib upload Bukti Struk/Foto Barang!");
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

  // Filter pencarian
  const filteredBarangs = barangs.filter(b => 
    b.namaBarang?.toLowerCase().includes(search.toLowerCase()) || 
    b.kodeBarang?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthGuard allowedRoles={["PEMILIK", "MANAJER", "ADMIN", "STAFF"]}>
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen overflow-hidden">
        
        {/* KOLOM KIRI: LIST BARANG & DISCLAIMER */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          
          {/* Header & Search */}
          <div className="mb-4 space-y-3">
             <div className="flex items-center gap-4">
                <Link href="/dashboard/transaksi" className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition">
                    <ArrowLeft size={20} className="text-white"/>
                </Link>
                <h1 className="text-2xl font-bold text-white">Kasir Penjualan</h1>
             </div>

             {/* --- DISCLAIMER (YANG KAMU MINTA) --- */}
             <div className="bg-yellow-900/40 border border-yellow-600 text-yellow-200 p-3 rounded-lg flex items-start gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-500 mt-0.5" />
                <div>
                    <strong>PENTING:</strong> Pastikan barang fisik sesuai dengan input. 
                    Klik tombol "Bayar" akan <span className="text-red-400 font-bold underline">LANGSUNG MEMOTONG STOK</span> database.
                </div>
             </div>
             {/* ------------------------------------ */}

             {/* Search Bar */}
             <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16}/>
                <input 
                    type="text" 
                    placeholder="Cari nama barang atau kode..." 
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                    onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>

          {/* Grid Barang (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredBarangs.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center text-gray-500 mt-10">
                        <p>Barang tidak ditemukan.</p>
                        <p className="text-xs">Pastikan stok tersedia di Gudang.</p>
                    </div>
                ) : (
                    filteredBarangs.map((brg) => (
                    <div
                        key={brg.id}
                        onClick={() => addToCart(brg)}
                        className={`bg-gray-800 p-4 rounded-xl border border-gray-700 cursor-pointer transition group relative overflow-hidden ${brg.stok === 0 ? 'opacity-50 pointer-events-none grayscale' : 'hover:border-blue-500 hover:shadow-lg'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white group-hover:text-blue-400 line-clamp-2 leading-tight">{brg.namaBarang}</h3>
                            <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-300 whitespace-nowrap ml-2">{brg.kodeBarang}</span>
                        </div>
                        
                        <div className="mt-auto flex justify-between items-end border-t border-gray-700/50 pt-2">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Stok</p>
                                <p className={`font-bold text-sm ${brg.stok < 5 ? 'text-red-400' : 'text-white'}`}>{brg.stok}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Harga</p>
                                <p className="text-green-400 font-bold text-sm">
                                Rp {brg.hargaJual.toLocaleString("id-ID")}
                                </p>
                            </div>
                        </div>
                        {/* Overlay Hover */}
                        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-[1px]">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                <Plus size={14}/> Tambah
                            </span>
                        </div>
                    </div>
                    ))
                )}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: KERANJANG & CHECKOUT */}
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 h-full max-h-[90vh] flex flex-col shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2 border-b border-gray-700 pb-3">
            <ShoppingCart size={20} className="text-blue-400"/> Keranjang
          </h2>

          {/* List Item Keranjang */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-2 custom-scrollbar pr-1">
            {keranjang.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg p-4">
                <ShoppingCart size={40} className="mb-2 opacity-20"/>
                <p className="text-sm">Belum ada barang.</p>
              </div>
            ) : (
              keranjang.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm text-gray-300 bg-gray-700/30 p-3 rounded-lg border border-gray-700 group hover:border-gray-500 transition">
                  <div>
                    <div className="font-bold text-white line-clamp-1">{item.namaBarang}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.qty} x Rp {item.hargaJual.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right pl-2">
                    <div className="font-bold text-blue-400">Rp {item.subtotal.toLocaleString()}</div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-white mt-1 p-1.5 hover:bg-red-600 rounded transition flex items-center justify-end w-full"
                      title="Hapus item"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bagian Bawah: Total & Bayar */}
          <div className="mt-auto pt-4 border-t border-gray-700 space-y-4 bg-gray-800">
             <div className="flex justify-between items-end">
                <span className="text-gray-400 text-sm">Total Bayar</span>
                <span className="text-2xl font-bold text-green-400">Rp {hitungTotal().toLocaleString("id-ID")}</span>
             </div>

             {/* Upload Struk */}
             <div className="relative group">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFileBukti(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="bg-gray-900 border border-dashed border-gray-600 rounded-lg p-3 flex items-center gap-3 text-gray-400 group-hover:border-blue-500 group-hover:text-blue-400 transition">
                    <div className="bg-gray-800 p-2 rounded group-hover:bg-gray-700">
                        <Upload size={18} />
                    </div>
                    <div className="text-xs overflow-hidden">
                        {fileBukti ? (
                            <span className="text-green-400 font-medium truncate block max-w-[150px]">{fileBukti.name}</span>
                        ) : (
                            <span>Upload Struk (Opsional)</span>
                        )}
                    </div>
                </div>
             </div>

             <button
                onClick={handleBayar}
                disabled={loading || keranjang.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
             >
                {loading ? "Memproses..." : "Bayar Sekarang"}
             </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}