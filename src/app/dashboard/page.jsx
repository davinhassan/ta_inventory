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

// Mencegah error cache static (Data selalu fresh tiap direfresh)
export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    // 1. Ambil Data Suku Cadang
    const allItems = await prisma.sukuCadang.findMany();

    // 2. Hitung Total
    const totalSupplier = await prisma.supplier.count();
    const totalTransaksi = await prisma.transaksiStok.count();

    // 3. Ambil 5 Transaksi Terakhir (Termasuk info user yang input)
    const transaksiTerbaru = await prisma.transaksiStok.findMany({
      take: 5,
      orderBy: { id: "desc" },
      include: {
        sukuCadang: true,
        dilakukanOleh: true, // Kita ambil nama user-nya
      },
    });

    // 4. Filter Logic
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
    console.error("Database Error di Dashboard:", error);
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
    // FINAL: Role sudah disesuaikan agar STAFF juga bisa masuk
    <AuthGuard allowedRoles={["MANAJER", "ADMIN", "STAFF"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">
          Dashboard Bengkel
        </h1>

        {/* --- BAGIAN 1: STATISTIK --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-900/40 border border-blue-700 p-6 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-blue-200 text-sm font-medium uppercase">
                Total Suku Cadang
              </h3>
              <p className="text-4xl font-bold text-white mt-2">
                {allItems.length}
              </p>
            </div>
            <div className="p-3 bg-blue-800 rounded-full text-blue-200">
              <Package size={24} />
            </div>
          </div>

          <div className="bg-purple-900/40 border border-purple-700 p-6 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-purple-200 text-sm font-medium uppercase">
                Total Supplier
              </h3>
              <p className="text-4xl font-bold text-white mt-2">
                {totalSupplier}
              </p>
            </div>
            <div className="p-3 bg-purple-800 rounded-full text-purple-200">
              <Users size={24} />
            </div>
          </div>

          <div className="bg-emerald-900/40 border border-emerald-700 p-6 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-emerald-200 text-sm font-medium uppercase">
                Total Transaksi
              </h3>
              <p className="text-4xl font-bold text-white mt-2">
                {totalTransaksi}
              </p>
            </div>
            <div className="p-3 bg-emerald-800 rounded-full text-emerald-200">
              <ArrowRightLeft size={24} />
            </div>
          </div>
        </div>

        {/* --- BAGIAN 2: PERINGATAN (STOK MENIPIS & OVERSTOCK) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stok Menipis */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-700 bg-red-900/20 flex justify-between items-center">
              <h3 className="font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle size={18} /> Stok Menipis (≤ 5)
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-3 custom-scrollbar">
              {lowStockItems.length === 0 ? (
                <p className="text-gray-500 text-center text-sm py-4">
                  Aman. Tidak ada stok kritis.
                </p>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-900/50 p-3 rounded flex justify-between items-center border border-gray-700 hover:border-red-500 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-white">{item.namaBarang}</p>
                      <p className="text-xs text-gray-500">{item.kodeBarang}</p>
                    </div>
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Sisa: {item.stok}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overstock */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-700 bg-orange-900/20 flex justify-between items-center">
              <h3 className="font-bold text-orange-400 flex items-center gap-2">
                <TrendingUp size={18} /> Overstock
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-3 custom-scrollbar">
              {overstockItems.length === 0 ? (
                <p className="text-gray-500 text-center text-sm py-4">
                  Efisiensi stok bagus.
                </p>
              ) : (
                overstockItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-900/50 p-3 rounded flex justify-between items-center border border-gray-700 hover:border-orange-500 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-white">{item.namaBarang}</p>
                      <p className="text-xs text-gray-500">
                        Max: {item.maxStok || 50}
                      </p>
                    </div>
                    <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Stok: {item.stok}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- BAGIAN 3: TRANSAKSI TERAKHIR --- */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Transaksi Terakhir</h3>
            <Link
              href="/dashboard/transaksi"
              className="text-blue-400 text-sm hover:text-blue-300 font-medium"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="bg-gray-900 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-3">Tipe</th>
                  <th className="px-6 py-3">Barang</th>
                  <th className="px-6 py-3 text-right">Jumlah</th>
                  <th className="px-6 py-3">Oleh</th>
                  <th className="px-6 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transaksiTerbaru.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  transaksiTerbaru.map((trx) => (
                    <tr
                      key={trx.id}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            trx.tipe === "MASUK"
                              ? "bg-green-900 text-green-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {trx.tipe}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {trx.sukuCadang?.namaBarang || (
                          <span className="text-red-500 italic">
                            Barang Dihapus
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-white">
                        {trx.jumlah} Pcs
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {trx.dilakukanOleh?.nama || "Sistem"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(trx.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
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
