"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useSession } from "next-auth/react"; // Import Session
import { Plus, CheckCircle, Package, FileText, Clock } from "lucide-react";

export default function PembelianPage() {
  const [poList, setPoList] = useState([]);
  const { data: session } = useSession(); // Ambil data user

  const fetchPO = async () => {
    try {
      const res = await fetch("/api/pembelian");
      const data = await res.json();
      setPoList(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchPO(); }, []);

  const handleApprove = async (id) => {
    if (!confirm("Terima barang ini? Stok akan bertambah.")) return;
    try {
        const res = await fetch(`/api/pembelian/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "SELESAI" }),
        });
        if(res.ok) { fetchPO(); alert("Stok bertambah!"); }
    } catch(e) { alert("Error"); }
  };

  // Cek apakah user boleh approve (Bukan Staff)
  const canApprove = session?.user?.role !== "STAFF";

  return (
    <AuthGuard allowedRoles={["MANAJER", "ADMIN", "STAFF", "PEMILIK"]}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white flex gap-2 items-center">
            <Package className="text-blue-400"/> Data Barang Masuk (PO)
          </h1>
          <Link href="/dashboard/pembelian/tambah">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg transition">
              <Plus size={18}/> Buat Request PO
            </button>
          </Link>
        </div>
        
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900 text-xs uppercase text-gray-400 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4">No PO</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {poList.map((po) => (
                <tr key={po.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-mono font-bold text-white">{po.noPO}</td>
                  <td className="px-6 py-4">{po.supplier?.namaSupplier}</td>
                  <td className="px-6 py-4 text-sm">
                    {po.items.map((i, idx) => (
                        <div key={idx}>{i.sukuCadang?.namaBarang} (x{i.jumlah})</div>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    {po.status === 'SELESAI' ? (
                        <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle size={14}/> Selesai</span>
                    ) : (
                        <span className="text-yellow-400 font-bold flex items-center gap-1"><Clock size={14}/> Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* HANYA TAMPIL JIKA STATUS PENDING DAN BUKAN STAFF */}
                    {po.status === "PENDING" && canApprove && (
                      <button onClick={() => handleApprove(po.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold">
                        Setujui
                      </button>
                    )}
                    {po.status === "PENDING" && !canApprove && (
                        <span className="text-xs text-gray-500 italic">Menunggu Approval</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGuard>
  );
}