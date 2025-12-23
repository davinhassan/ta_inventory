import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import prisma from "@/lib/prisma";
import { AlertTriangle, TrendingUp } from "lucide-react";

// TAMBAHAN PENTING: Mencegah error cache static
export const dynamic = 'force-dynamic'; 

async function getDashboardData() {
  try {
    // 1. Ambil Data Suku Cadang
    const allItems = await prisma.sukuCadang.findMany();
    
    // 2. Hitung Total
    const totalSupplier = await prisma.supplier.count();
    const totalTransaksi = await prisma.transaksiStok.count();

    // 3. Ambil Transaksi Terakhir
    const transaksiTerbaru = await prisma.transaksiStok.findMany({
      take: 5,
      orderBy: { id: "desc" }, 
      include: { sukuCadang: true, dilakukanOleh: true },
    });

    // 4. Filter Data
    const lowStockItems = allItems.filter((item) => item.stok <= 5);
    const overstockItems = allItems.filter((item) => {
        // Handle jika maxStok null/undefined, default ke 50
        const batas = item.maxStok || 50; 
        return item.stok > batas;
    });

    return {
      allItems,
      totalSupplier,
      totalTransaksi,
      transaksiTerbaru,
      lowStockItems,
      overstockItems,
    };
  } catch (error) {
    console.error("Database Error di Dashboard:", error);
    // Return data kosong biar halaman tidak crash total
    return {
      allItems: [],
      totalSupplier: 0,
      totalTransaksi: 0,
      transaksiTerbaru: [],
      lowStockItems: [],
      overstockItems: [],
    };
  }
}

export default async function DashboardPage() {
  const { 
    allItems, 
    totalSupplier, 
    totalTransaksi, 
    transaksiTerbaru, 
    lowStockItems, 
    overstockItems 
  } = await getDashboardData();

  return (
    <AuthGuard allowedRoles={["PEMILIK", "ADMIN", "STAFF"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard Bengkel</h1>

        {/* --- BAGIAN 1: STATISTIK --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-900/40 border border-blue-700 p-6 rounded-xl">
            <h3 className="text-blue-200 text-sm font-medium uppercase">Total Suku Cadang</h3>
            <p className="text-4xl font-bold text-white mt-2">{allItems.length}</p>
          </div>
          <div className="bg-purple-900/40 border border-purple-700 p-6 rounded-xl">
            <h3 className="text-purple-200 text-sm font-medium uppercase">Total Supplier</h3>
            <p className="text-4xl font-bold text-white mt-2">{totalSupplier}</p>
          </div>
          <div className="bg-green-900/40 border border-green-700 p-6 rounded-xl">
            <h3 className="text-green-200 text-sm font-medium uppercase">Total Transaksi</h3>
            <p className="text-4xl font-bold text-white mt-2">{totalTransaksi}</p>
          </div>
        </div>

        {/* --- BAGIAN 2: PERINGATAN --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stok Menipis */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 bg-red-900/20 flex justify-between items-center">
              <h3 className="font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle size={18} /> Stok Menipis (≤ 5)
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-gray-500 text-center text-sm py-4">Aman. Tidak ada stok menipis.</p>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="bg-gray-900/50 p-3 rounded flex justify-between items-center border border-gray-700">
                    <div>
                        <p className="font-bold text-white">{item.namaBarang}</p>
                        <p className="text-xs text-gray-500">{item.kodeBarang}</p>
                    </div>
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      Sisa: {item.stok}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overstock */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 bg-orange-900/20 flex justify-between items-center">
              <h3 className="font-bold text-orange-400 flex items-center gap-2">
                <TrendingUp size={18} /> Overstock
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-3">
              {overstockItems.length === 0 ? (
                <p className="text-gray-500 text-center text-sm py-4">Efisiensi bagus.</p>
              ) : (
                overstockItems.map((item) => (
                  <div key={item.id} className="bg-gray-900/50 p-3 rounded flex justify-between items-center border border-gray-700">
                    <div>
                        <p className="font-bold text-white">{item.namaBarang}</p>
                        <p className="text-xs text-gray-500">Max: {item.maxStok || 50}</p>
                    </div>
                    <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">
                      Stok: {item.stok}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- BAGIAN 3: TRANSAKSI --- */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
             <h3 className="text-lg font-bold text-white">Transaksi Terakhir</h3>
             <Link href="/dashboard/transaksi" className="text-blue-400 text-sm hover:underline">Lihat Semua →</Link>
          </div>
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-700 text-xs uppercase text-gray-400">
               <tr>
                 <th className="px-4 py-3">Tipe</th>
                 <th className="px-4 py-3">Barang</th>
                 <th className="px-4 py-3 text-right">Jumlah</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
               {transaksiTerbaru.map((trx) => (
                 <tr key={trx.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                       <span className={`text-xs font-bold ${trx.tipe === 'MASUK' ? 'text-green-400' : 'text-red-400'}`}>
                         {trx.tipe}
                       </span>
                    </td>
                    <td className="px-4 py-3">{trx.sukuCadang?.namaBarang}</td>
                    <td className="px-4 py-3 text-right font-mono">{trx.jumlah} Pcs</td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGuard>
  );
}