"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Save, Plus, Trash } from "lucide-react";

export default function TambahPOPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [stokBarang, setStokBarang] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState("");
  const [file, setFile] = useState(null);
  
  // Item Cart State
  const [selectedBarangId, setSelectedBarangId] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);

  // 1. Ambil Data Supplier & Barang
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSup, resStok] = await Promise.all([
            fetch("/api/supplier"),
            fetch("/api/stok")
        ]);
        const dataSup = await resSup.json();
        const dataStok = await resStok.json();
        
        if(Array.isArray(dataSup)) setSuppliers(dataSup);
        if(Array.isArray(dataStok)) setStokBarang(dataStok);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      }
    };
    fetchData();
  }, []);

  // 2. Tambah Barang ke Cart
  const handleAddItem = () => {
    if (!selectedBarangId || qty <= 0) return alert("Pilih barang dan jumlah valid!");
    
    const existingItem = cart.find(item => item.id === selectedBarangId);
    if (existingItem) {
        alert("Barang ini sudah ada di daftar.");
        return;
    }

    const barangInfo = stokBarang.find(b => b.id === parseInt(selectedBarangId));
    
    setCart([...cart, {
        id: selectedBarangId,
        nama: barangInfo.namaBarang,
        qty: parseInt(qty)
    }]);
    
    setQty(1);
    setSelectedBarangId("");
  };

  // 3. Hapus Item
  const handleRemoveItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // 4. Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) return alert("Pilih Supplier!");
    if (cart.length === 0) return alert("Daftar barang masih kosong!");
    if (!file) return alert("Wajib upload Bukti Faktur/Invoice!");
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("supplierId", supplierId);
      formData.append("items", JSON.stringify(cart));
      if (file) formData.append("buktiFoto", file);

      const res = await fetch("/api/pembelian", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || "Gagal buat PO");
      }

      alert("Request PO Berhasil Dibuat!");
      router.push("/dashboard/pembelian");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["ADMIN", "MANAJER", "PEMILIK", "STAFF"]}> 
      {/* 1. Responsif Padding: p-4 di HP, p-8 di Desktop */}
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
            <ArrowLeft size={20}/> Kembali
        </button>

        <h1 className="text-xl md:text-2xl font-bold text-white mb-6">Buat Request Barang Masuk (PO)</h1>

        <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 shadow-xl">
            
            {/* --- FORM HEADER (Grid 1 kolom di HP, 2 di Desktop) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Pilih Supplier</label>
                    <select 
                        className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        value={supplierId}
                        onChange={(e) => setSupplierId(e.target.value)}
                    >
                        <option value="">-- Pilih Supplier --</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.namaSupplier}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Upload Faktur / Invoice <span className="text-red-500">*</span></label>
                    <input 
                        type="file" 
                        required
                        className="w-full bg-gray-900 border border-gray-600 text-gray-300 p-2 rounded-lg text-sm file:bg-gray-700 file:border-0 file:text-white file:mr-4 file:py-1 file:px-3 file:rounded-md hover:file:bg-gray-600"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>
            </div>

            <hr className="border-gray-700 my-6"/>

            {/* --- FORM INPUT BARANG (Flex Col di HP, Row di Desktop) --- */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700 mb-6">
                <h3 className="text-white font-bold mb-4 text-sm uppercase">Tambah Item ke PO</h3>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Cari Barang</label>
                        <select 
                            className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded text-sm"
                            value={selectedBarangId}
                            onChange={(e) => setSelectedBarangId(e.target.value)}
                        >
                            <option value="">-- Pilih Barang --</option>
                            {stokBarang.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.namaBarang} (Kode: {b.kodeBarang})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-24">
                        <label className="text-xs text-gray-400 mb-1 block">Qty</label>
                        <input 
                            type="number" 
                            min="1"
                            className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded text-sm"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleAddItem}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 font-bold transition text-sm"
                    >
                        <Plus size={18}/> Tambah
                    </button>
                </div>
            </div>

            {/* --- TABEL CART (Responsive Scroll) --- */}
            <div className="overflow-hidden rounded-lg border border-gray-600 mb-8 shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300 whitespace-nowrap">
                        <thead className="bg-gray-900 text-xs uppercase">
                            <tr>
                                <th className="p-3">Nama Barang</th>
                                <th className="p-3 text-center">Qty</th>
                                <th className="p-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {cart.length === 0 ? (
                                <tr><td colSpan="3" className="p-4 text-center text-gray-500 italic text-sm">Belum ada barang dipilih</td></tr>
                            ) : (
                                cart.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 font-bold text-white text-sm">{item.nama}</td>
                                        <td className="p-3 text-center text-sm">{item.qty}</td>
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-400 hover:text-red-300 p-1 hover:bg-gray-700 rounded transition"
                                            >
                                                <Trash size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- TOMBOL SUBMIT --- */}
            <button 
                onClick={handleSubmit}
                disabled={loading || cart.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
                {loading ? "Menyimpan..." : (
                    <>
                        <Save size={20}/> Simpan Request PO
                    </>
                )}
            </button>

        </div>
      </div>
    </AuthGuard>
  );
}