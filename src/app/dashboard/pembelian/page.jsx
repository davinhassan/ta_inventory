"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useSession } from "next-auth/react"; 
import { Plus, CheckCircle, XCircle, Package, Clock, X, FileText } from "lucide-react";

export default function PembelianPage() {
  const [poList, setPoList] = useState([]);
  const { data: session } = useSession(); 

  const fetchPO = async () => {
    try {
      const res = await fetch("/api/pembelian");
      const data = await res.json();
      setPoList(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchPO(); }, []);

  const handleProcess = async (id, statusKeputusan) => {
    const pesan = statusKeputusan === "SELESAI" 
        ? "Konfirmasi: Terima barang ini? Stok akan bertambah." 
        : "Konfirmasi: Tolak PO ini? Stok TIDAK akan bertambah.";

    if (!confirm(pesan)) return;

    try {
        const res = await fetch(`/api/pembelian/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: statusKeputusan }),
        });
        
        if(res.ok) { 
            alert(statusKeputusan === "SELESAI" ? "Berhasil disetujui!" : "PO Ditolak.");
            fetchPO(); 
        } else {
            alert("Gagal memproses data.");
        }
    } catch(e) { alert("Error koneksi"); }
  };

  const canApprove = session?.user?.role !== "STAFF";

  return (
    <AuthGuard allowedRoles={["MANAJER", "ADMIN", "STAFF", "PEMILIK"]}>
      {/* 1. Responsif Padding */}
      <div className="p-4 md:p-8">
        
        {/* 2. Header Responsif (Stack di HP) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-white flex gap-2 items-center">
            <Package className="text-blue-400"/> Data Barang Masuk (PO)
          </h1>
          <Link href="/dashboard/pembelian/tambah">
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 shadow-lg transition text-sm md:text-base">
              <Plus size={18}/> Buat Request PO
            </button>
          </Link>
        </div>
        
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
          {/* 3. Wrapper Table Scrollable */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300 whitespace-nowrap text-sm md:text-base">
              <thead className="bg-gray-900 text-xs uppercase text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 md:px-6 md:py-4">No PO</th>
                  <th className="px-4 py-3 md:px-6 md:py-4">Supplier</th>
                  <th className="px-4 py-3 md:px-6 md:py-4">Item</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-center">Bukti</th> 
                  <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {poList.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 md:px-6 md:py-4 font-mono font-bold text-white">{po.noPO}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4">{po.supplier?.namaSupplier}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm">
                      {po.items.map((i, idx) => (
                          <div key={idx}>{i.sukuCadang?.namaBarang} (x{i.jumlah})</div>
                      ))}
                    </td>
                    
                    {/* --- ISI KOLOM BUKTI --- */}
                    <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                      {po.buktiFoto ? (
                          <a 
                              href={po.buktiFoto} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline text-xs font-bold"
                          >
                              <FileText size={16} /> Lihat
                          </a>
                      ) : (
                          <span className="text-gray-600 text-xs italic">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 md:px-6 md:py-4">
                      {po.status === 'SELESAI' && (
                          <span className="text-green-400 font-bold flex items-center gap-1 text-xs md:text-sm"><CheckCircle size={14}/> Selesai</span>
                      )}
                      {po.status === 'PENDING' && (
                          <span className="text-yellow-400 font-bold flex items-center gap-1 text-xs md:text-sm"><Clock size={14}/> Pending</span>
                      )}
                      {po.status === 'DITOLAK' && (
                          <span className="text-red-400 font-bold flex items-center gap-1 text-xs md:text-sm"><XCircle size={14}/> Ditolak</span>
                      )}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                      {po.status === "PENDING" && canApprove ? (
                        <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => handleProcess(po.id, "SELESAI")} 
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition shadow"
                            >
                              <CheckCircle size={14}/> Setuju
                            </button>
                            <button 
                              onClick={() => handleProcess(po.id, "DITOLAK")} 
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition shadow"
                            >
                              <X size={14}/> Tolak
                            </button>
                        </div>
                      ) : (
                          <span className="text-xs text-gray-500 italic">
                              {po.status === "PENDING" ? "Menunggu Approval" : "-"}
                          </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {poList.length === 0 && (
             <div className="p-8 text-center text-gray-500">Belum ada data request barang.</div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}