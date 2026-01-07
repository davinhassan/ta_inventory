import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import prisma from "@/lib/prisma";
import {
  AlertTriangle,
  TrendingUp,
  Package,
  Users,
  ArrowRightLeft,
} from "lucide-react";

// Mencegah error cache static
export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const allItems = await prisma.sukuCadang.findMany();
    const totalSupplier = await prisma.supplier.count();
    const totalTransaksi = await prisma.transaksiStok.count();

    const transaksiTerbaru = await prisma.transaksiStok.findMany({
      take: 5,
      orderBy: { id: "desc" },
      include: {
        sukuCadang: true,
        dilakukanOleh: true,
      },
    });

    const lowStockItems = allItems.filter((item) => item.stok <= 5);
    const overstockItems = allItems.filter((item) => {
      const batas = item.maxStok || 50;
      return item.stok > batas;
    });

    return { allItems, totalSupplier, totalTransaksi, transaksiTerbaru, lowStockItems, overstockItems };
  } catch (error) {
    console.error("Database Error:", error);
    return { allItems: [], totalSupplier: 0, totalTransaksi: 0, transaksiTerbaru: [], lowStockItems: [], overstockItems: [] };
  }
}

export default async function DashboardPage() {
  const { allItems, totalSupplier, totalTransaksi, transaksiTerbaru, lowStockItems, overstockItems } = await getDashboardData();

  return (
    <AuthGuard allowedRoles={["MANAJER", "ADMIN", "STAFF", "PEMILIK"]}>
      {/* PERBAIKAN CONTAINER: 
         - max-w-full: Mencegah overflow container
         - overflow-x-hidden: Mencegah scrollbar ganda
      */}
      <div className="p-4 md:p-8 w-full max-w-full pb-24 md:pb-8 space-y-6 md:space-y-8">
        
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Dashboard Bengkel
        </h1>

        {/* --- BAGIAN 1: STATISTIK --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card Total Barang */}
          <div className="bg-blue-900/30 border border-blue-700/50 p-5 rounded-xl flex items-center justify-between shadow-lg backdrop-blur-sm">
            <div>
              <h3 className="text-blue-200 text-xs font-bold uppercase tracking-wider">Total Suku Cadang</h3>
              <p className="text-3xl font-bold text-white mt-2">{allItems.length}</p>
            </div>
            <div className="p-3 bg-blue-600/20 rounded-lg text-blue-400">
              <Package className="w-6 h-6" />
            </div>
          </div>

          {/* Card Total Supplier */}
          <div className="bg-purple-900/30 border border-purple-700/50 p-5 rounded-xl flex items-center justify-between shadow-lg backdrop-blur-sm">
            <div>
              <h3 className="text-purple-200 text-xs font-bold uppercase tracking-wider">Total Supplier</h3>
              <p className="text-3xl font-bold text-white mt-2">{totalSupplier}</p>
            </div>
            <div className="p-3 bg-purple-600/20 rounded-lg text-purple-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card Total Transaksi */}
          <div className="bg-emerald-900/30 border border-emerald-700/50 p-5 rounded-xl flex items-center justify-between shadow-lg backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <div>
              <h3 className="text-emerald-200 text-xs font-bold uppercase tracking-wider">Total Transaksi</h3>
              <p className="text-3xl font-bold text-white mt-2">{totalTransaksi}</p>
            </div>
            <div className="p-3 bg-emerald-600/20 rounded-lg text-emerald-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* --- BAGIAN 2: PERINGATAN --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Stok Menipis */}
          <div className="bg-gray-800/80 border border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-lg h-[350px]">
            <div className="p-4 border-b border-gray-700 bg-red-900/20 flex justify-between items-center">
              <h3 className="font-bold text-red-400 flex items-center gap-2 text-sm">
                <AlertTriangle size={18} /> Stok Menipis (≤ 5)
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Package size={32} className="mb-2 opacity-30"/>
                  <p className="text-sm">Stok aman terkendali.</p>
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="bg-gray-900/50 p-3 rounded-lg flex justify-between items-center border border-gray-700/50">
                    <div className="overflow-hidden mr-3">
                      <p className="font-medium text-white text-sm truncate">{item.namaBarang}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{item.kodeBarang}</p>
                    </div>
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-2 py-1 rounded">
                      Sisa: {item.stok}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overstock */}
          <div className="bg-gray-800/80 border border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-lg h-[350px]">
            <div className="p-4 border-b border-gray-700 bg-orange-900/20 flex justify-between items-center">
              <h3 className="font-bold text-orange-400 flex items-center gap-2 text-sm">
                <TrendingUp size={18} /> Overstock
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {overstockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <TrendingUp size={32} className="mb-2 opacity-30"/>
                  <p className="text-sm">Tidak ada penumpukan stok.</p>
                </div>
              ) : (
                overstockItems.map((item) => (
                  <div key={item.id} className="bg-gray-900/50 p-3 rounded-lg flex justify-between items-center border border-gray-700/50">
                    <div className="overflow-hidden mr-3">
                      <p className="font-medium text-white text-sm truncate">{item.namaBarang}</p>
                      <p className="text-[10px] text-gray-500">Batas: {item.maxStok || 50}</p>
                    </div>
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold px-2 py-1 rounded">
                      Stok: {item.stok}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- BAGIAN 3: TRANSAKSI TERAKHIR --- */}
        <div className="bg-gray-800/80 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30">
            <h3 className="text-base font-bold text-white">Transaksi Terakhir</h3>
            <Link href="/dashboard/transaksi" className="text-blue-400 text-sm hover:text-blue-300 font-medium transition-colors">
              Lihat Semua →
            </Link>
          </div>
          
          {/* WRAPPER TABEL RESPONSIF */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="bg-gray-900/80 text-xs uppercase text-gray-400 font-semibold">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap min-w-[100px]">Tipe</th>
                  <th className="px-6 py-4 whitespace-nowrap min-w-[200px]">Barang</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Jumlah</th>
                  <th className="px-6 py-4 whitespace-nowrap">Oleh</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transaksiTerbaru.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      Belum ada transaksi tercatat.
                    </td>
                  </tr>
                ) : (
                  transaksiTerbaru.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                          trx.tipe === "MASUK" 
                            ? "bg-green-900/30 text-green-400 border-green-800" 
                            : "bg-red-900/30 text-red-400 border-red-800"
                        }`}>
                          {trx.tipe}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {trx.sukuCadang?.namaBarang || <span className="text-gray-500 italic">Item dihapus</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-white">
                        {trx.jumlah}
                      </td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                        {trx.dilakukanOleh?.nama || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs text-right whitespace-nowrap">
                        {new Date(trx.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}