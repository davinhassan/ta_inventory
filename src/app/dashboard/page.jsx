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

export const dynamic = "force-dynamic";

async function getDashboardData() {
  /* ... (Logic Data Fetching biarkan sama) ... */
  try {
    const allItems = await prisma.sukuCadang.findMany();
    const totalSupplier = await prisma.supplier.count();
    const totalTransaksi = await prisma.transaksiStok.count();
    const transaksiTerbaru = await prisma.transaksiStok.findMany({
      take: 5,
      orderBy: { id: "desc" },
      include: { sukuCadang: true, dilakukanOleh: true },
    });
    const lowStockItems = allItems.filter((item) => item.stok <= 5);
    const overstockItems = allItems.filter((item) => {
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
    overstockItems,
  } = await getDashboardData();

  return (
    <AuthGuard allowedRoles={["MANAJER", "ADMIN", "STAFF", "PEMILIK"]}>
      <div className="p-4 md:p-8 w-full max-w-full pb-24 md:pb-8 space-y-6 md:space-y-8">
        {/* PERBAIKAN KONTRAS JUDUL: 
            Gunakan text-gray-800 (Gelap) saat Light Mode 
            Gunakan text-white (Putih) saat Dark Mode 
        */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard Bengkel
        </h1>

        {/* --- STATISTIK --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card menggunakan bg-card (Putih/Navy) dan border-border */}
          <div className="rounded-xl p-5 shadow-sm border border-border bg-card text-card-foreground transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                  Total Suku Cadang
                </h3>
                <p className="text-3xl font-bold mt-2">{allItems.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5 shadow-sm border border-border bg-card text-card-foreground transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                  Total Supplier
                </h3>
                <p className="text-3xl font-bold mt-2">{totalSupplier}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5 shadow-sm border border-border bg-card text-card-foreground transition-all sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                  Total Transaksi
                </h3>
                <p className="text-3xl font-bold mt-2">{totalTransaksi}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* --- PERINGATAN --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stok Menipis */}
          <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-card flex flex-col h-[350px]">
            <div className="p-4 border-b border-border bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <AlertTriangle size={18} /> Stok Menipis (≤ 5)
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <Package size={32} className="mb-2" />
                  <p className="text-sm">Stok aman terkendali.</p>
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg flex justify-between items-center border border-border bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="overflow-hidden mr-3">
                      <p className="font-medium text-sm truncate">
                        {item.namaBarang}
                      </p>
                      <p className="text-[10px] opacity-70 uppercase">
                        {item.kodeBarang}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                      Sisa: {item.stok}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overstock */}
          <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-card flex flex-col h-[350px]">
            <div className="p-4 border-b border-border bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <TrendingUp size={18} /> Overstock
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {overstockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <TrendingUp size={32} className="mb-2" />
                  <p className="text-sm">Tidak ada penumpukan stok.</p>
                </div>
              ) : (
                overstockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg flex justify-between items-center border border-border bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="overflow-hidden mr-3">
                      <p className="font-medium text-sm truncate">
                        {item.namaBarang}
                      </p>
                      <p className="text-[10px] opacity-70">
                        Batas: {item.maxStok || 50}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                      Stok: {item.stok}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- TRANSAKSI --- */}
        <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
          <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
            <h3 className="text-base font-bold">Transaksi Terakhir</h3>
            <Link
              href="/dashboard/transaksi"
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline font-medium"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left opacity-90">
              <thead className="text-xs uppercase font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Barang</th>
                  <th className="px-6 py-4 text-right">Jumlah</th>
                  <th className="px-6 py-4">Oleh</th>
                  <th className="px-6 py-4 text-right">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transaksiTerbaru.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                          trx.tipe === "MASUK"
                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                            : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                        }`}
                      >
                        {trx.tipe}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {trx.sukuCadang?.namaBarang}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      {trx.jumlah}
                    </td>
                    <td className="px-6 py-4 opacity-70">
                      {trx.dilakukanOleh?.nama}
                    </td>
                    <td className="px-6 py-4 text-right text-xs opacity-70">
                      {new Date(trx.tanggal).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
