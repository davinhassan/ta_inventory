"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
// PERBAIKAN: Menambahkan 'Package' ke dalam import
import { ArrowLeft, Save, Plus, Trash, Upload, X, Package } from "lucide-react"; 
import Image from "next/image";

export default function TambahPOPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [suppliers, setSuppliers] = useState([]);
  const [stokBarang, setStokBarang] = useState([]); // Semua Data Barang
  const [loading, setLoading] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Item Cart State
  const [selectedBarangId, setSelectedBarangId] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);

  // --- 1. Ambil Data Master ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSup, resStok] = await Promise.all([
            fetch("/api/supplier"),
            fetch("/api/stok-master") 
        ]);
        const dataSup = await resSup.json();
        const dataStok = await resStok.json();
        
        if(Array.isArray(dataSup)) setSuppliers(dataSup);
        
        // Handle format data stok
        if(dataStok.data && Array.isArray(dataStok.data)) setStokBarang(dataStok.data);
        else if(Array.isArray(dataStok)) setStokBarang(dataStok);

      } catch (error) {
        console.error("Gagal ambil data:", error);
      }
    };
    fetchData();
  }, []);

  // --- 2. Logic Filter Barang By Supplier ---
  // Kita buat list turunan yang sudah difilter
  const filteredBarang = stokBarang.filter(barang => {
      // Pastikan barang punya supplierId dan cocok dengan yang dipilih
      // Jika supplierId belum dipilih, list kosong
      return supplierId && barang.supplierId === parseInt(supplierId);
  });

  // --- 3. Handle Ganti Supplier (Dengan Warning Reset) ---
  const handleSupplierChange = (e) => {
      const newId = e.target.value;
      
      // Jika cart sudah ada isinya dan user coba ganti supplier
      if (cart.length > 0 && newId !== supplierId) {
          if (confirm("Perhatian: Mengganti supplier akan MENGHAPUS daftar barang yang sudah dipilih (karena beda supplier). Lanjutkan?")) {
              setCart([]); // Kosongkan cart
              setSupplierId(newId); // Set supplier baru
              setSelectedBarangId(""); // Reset pilihan barang
          }
          // Jika cancel, supplier tidak berubah (tetap yang lama)
      } else {
          // Jika cart kosong, langsung ganti saja
          setSupplierId(newId);
          setSelectedBarangId(""); 
      }
  };

  // --- 4. Handle File ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- 5. Cart Actions ---
  const handleAddItem = () => {
    if (!selectedBarangId || qty <= 0) return alert("Pilih barang dan jumlah valid!");
    
    const existingItem = cart.find(item => item.id === selectedBarangId);
    if (existingItem) return alert("Barang ini sudah ada di daftar.");

    const barangInfo = stokBarang.find(b => b.id === parseInt(selectedBarangId));
    
    setCart([...cart, {
        id: selectedBarangId,
        nama: barangInfo.namaBarang,
        kode: barangInfo.kodeBarang,
        qty: parseInt(qty)
    }]);
    
    setQty(1);
    setSelectedBarangId("");
  };

  const handleRemoveItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // --- 6. Submit ---
  const handleSubmit = async () => {
    if (!supplierId) return alert("Pilih Supplier!");
    if (cart.length === 0) return alert("Daftar barang masih kosong!");
    if (!file) return alert("Wajib upload Bukti Faktur/Invoice!");
    
    if (!confirm("Buat Request PO ini?")) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("supplierId", supplierId);
      formData.append("items", JSON.stringify(cart));
      formData.append("buktiFoto", file);

      const res = await fetch("/api/pembelian", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Gagal buat PO");

      alert("Request PO Berhasil Dibuat!");
      router.push("/dashboard/pembelian");
      router.refresh();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["ADMIN", "MANAJER", "PEMILIK", "STAFF"]}> 
      <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
            <ArrowLeft size={20}/> Kembali
        </button>

        <h1 className="text-xl md:text-2xl font-bold text-white mb-6">Buat Request Barang Masuk (PO)</h1>

        <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 shadow-xl space-y-6">
            
            {/* --- HEADER: PILIH SUPPLIER & UPLOAD --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Pilih Supplier</label>
                    <select 
                        className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        value={supplierId}
                        onChange={handleSupplierChange} 
                    >
                        <option value="">-- Pilih Supplier --</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.namaSupplier}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                        *Barang yang muncul akan disesuaikan dengan supplier yang dipilih.
                    </p>
                </div>
                
                {/* Upload Invoice */}
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Upload Faktur / Invoice *</label>
                    {!previewUrl ? (
                        <div className="relative group">
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleFileChange}
                            />
                            <div className="bg-gray-900 border border-dashed border-gray-600 rounded-lg p-3 flex items-center gap-3 text-gray-400 group-hover:border-blue-500 transition">
                                <div className="bg-gray-800 p-2 rounded"><Upload size={18} /></div>
                                <span className="text-sm">Klik untuk upload foto</span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-600 group">
                             <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                             <button onClick={clearFile} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition z-20 shadow-md">
                                <X size={16} />
                             </button>
                             <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 text-center truncate">
                                {file.name}
                             </div>
                        </div>
                    )}
                </div>
            </div>

            <hr className="border-gray-700"/>

            {/* --- INPUT BARANG (FILTERED) --- */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-sm uppercase">Tambah Item</h3>
                    {supplierId && (
                        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded border border-blue-800">
                            Supplier Terpilih: {suppliers.find(s => s.id == supplierId)?.namaSupplier}
                        </span>
                    )}
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Barang (Hanya dari Supplier Terpilih)</label>
                        <select 
                            className="w-full bg-gray-900 border border-gray-600 text-white p-2.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            value={selectedBarangId}
                            onChange={(e) => setSelectedBarangId(e.target.value)}
                            disabled={!supplierId} 
                        >
                            <option value="">
                                {supplierId ? "-- Pilih Barang --" : "-- Pilih Supplier Terlebih Dahulu --"}
                            </option>
                            
                            {/* RENDER HANYA BARANG YANG COCOK */}
                            {filteredBarang.length > 0 ? (
                                filteredBarang.map(b => (
                                    <option key={b.id} value={b.id}>
                                        {b.namaBarang} (Kode: {b.kodeBarang})
                                    </option>
                                ))
                            ) : (
                                supplierId && <option disabled>Tidak ada barang untuk supplier ini</option>
                            )}

                        </select>
                    </div>
                    <div className="w-full md:w-24">
                        <label className="text-xs text-gray-400 mb-1 block">Qty</label>
                        <input 
                            type="number" 
                            min="1"
                            className="w-full bg-gray-900 border border-gray-600 text-white p-2.5 rounded text-sm"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleAddItem}
                        disabled={!supplierId}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded flex items-center justify-center gap-2 font-bold transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={18}/> Tambah
                    </button>
                </div>
            </div>

            {/* --- CART LIST --- */}
            <div className="overflow-hidden rounded-lg border border-gray-600">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-900 text-xs uppercase">
                        <tr>
                            <th className="p-3 pl-4">Barang</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-right pr-4">Hapus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 bg-gray-800">
                        {cart.length === 0 ? (
                            <tr><td colSpan="3" className="p-8 text-center text-gray-500 italic text-sm">
                                {/* PACKAGE ICON DIGUNAKAN DISINI */}
                                <Package className="mx-auto mb-2 opacity-30" size={24}/>
                                Belum ada barang dipilih
                            </td></tr>
                        ) : (
                            cart.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="p-3 pl-4 text-sm">
                                        <div className="font-bold text-white">{item.nama}</div>
                                        <div className="text-xs text-gray-500">{item.kode}</div>
                                    </td>
                                    <td className="p-3 text-center text-sm font-mono">{item.qty}</td>
                                    <td className="p-3 text-right pr-4">
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300 hover:bg-gray-700 p-1.5 rounded transition">
                                            <Trash size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <button 
                onClick={handleSubmit}
                disabled={loading || cart.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base active:scale-[0.98]"
            >
                {loading ? "Menyimpan..." : ( <><Save size={20}/> Simpan Request PO</> )}
            </button>
        </div>
      </div>
    </AuthGuard>
  );
}