import prisma from "@/lib/prisma";
import Link from "next/link";

// Fungsi mengambil data ringkasan
async function getDashboardData() {
  // 1. Hitung Total Data
  const totalBarang = await prisma.sukuCadang.count();
  const totalSupplier = await prisma.supplier.count();
  const totalTransaksi = await prisma.transaksiStok.count();

  // 2. Cari Barang dengan Stok Menipis (Di bawah 5)
  const stokMenipis = await prisma.sukuCadang.findMany({
    where: {
      stok: {
        lte: 5, // Less than or equal to 5
      },
    },
    take: 5,
    orderBy: { stok: "asc" },
  });

  // 3. Ambil 5 Transaksi Terakhir
  const transaksiTerbaru = await prisma.transaksiStok.findMany({
    take: 5,
    orderBy: { tanggal: "desc" },
    include: { sukuCadang: true },
  });

  return {
    totalBarang,
    totalSupplier,
    totalTransaksi,
    stokMenipis,
    transaksiTerbaru,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard Bengkel</h1>

      {/* --- BAGIAN 1: KARTU STATISTIK --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Kartu Barang */}
        <div className="bg-blue-900/50 p-6 rounded-xl border border-blue-700">
          <h3 className="text-blue-200 text-sm font-medium uppercase">
            Total Suku Cadang
          </h3>
          <p className="text-4xl font-bold text-white mt-2">
            {data.totalBarang}
          </p>
        </div>

        {/* Kartu Supplier */}
        <div className="bg-purple-900/50 p-6 rounded-xl border border-purple-700">
          <h3 className="text-purple-200 text-sm font-medium uppercase">
            Total Supplier
          </h3>
          <p className="text-4xl font-bold text-white mt-2">
            {data.totalSupplier}
          </p>
        </div>

        {/* Kartu Transaksi */}
        <div className="bg-emerald-900/50 p-6 rounded-xl border border-emerald-700">
          <h3 className="text-emerald-200 text-sm font-medium uppercase">
            Total Transaksi
          </h3>
          <p className="text-4xl font-bold text-white mt-2">
            {data.totalTransaksi}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- BAGIAN 2: PERINGATAN STOK MENIPIS --- */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-red-400">
              ⚠️ Stok Menipis (≤ 5)
            </h2>
            <Link
              href="/dashboard/stok"
              className="text-xs text-gray-400 hover:text-white"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="p-4">
            {data.stokMenipis.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Aman! Tidak ada stok kritis.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.stokMenipis.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center bg-gray-900 p-3 rounded"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {item.namaBarang}
                      </p>
                      <p className="text-xs text-gray-500">{item.kodeBarang}</p>
                    </div>
                    <span className="bg-red-900 text-red-200 text-xs font-bold px-2 py-1 rounded">
                      Sisa: {item.stok}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* --- BAGIAN 3: TRANSAKSI TERBARU --- */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">
              🔄 Transaksi Terakhir
            </h2>
            <Link
              href="/dashboard/transaksi"
              className="text-xs text-gray-400 hover:text-white"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="p-4">
            {data.transaksiTerbaru.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada transaksi.</p>
            ) : (
              <ul className="space-y-3">
                {data.transaksiTerbaru.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center border-b border-gray-700 pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-white text-sm">
                        <span
                          className={
                            item.tipe === "MASUK"
                              ? "text-green-400 font-bold"
                              : "text-red-400 font-bold"
                          }
                        >
                          {item.tipe}
                        </span>{" "}
                        - {item.sukuCadang?.namaBarang}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span className="text-white font-mono font-bold">
                      {item.jumlah} Pcs
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
