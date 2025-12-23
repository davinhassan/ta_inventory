import Link from "next/link";
// 1. Import AuthGuard
import AuthGuard from "@/components/AuthGuard";

// Fungsi ambil data transaksi dari API
async function getTransaksi() {
  try {
    const res = await fetch("http://localhost:3000/api/transaksi", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function PageTransaksi() {
  const dataTransaksi = await getTransaksi();
  const safeData = Array.isArray(dataTransaksi) ? dataTransaksi : [];

  return (
    // 2. Pasang AuthGuard: Izinkan SEMUA ROLE
    // Karena ini adalah fitur operasional utama
    <AuthGuard allowedRoles={["PEMILIK", "ADMIN", "STAFF"]}>
      
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            Riwayat Transaksi Stok
          </h1>

          {/* Tombol Tambah Transaksi */}
          <Link href="/dashboard/transaksi/tambah">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all">
              + Catat Transaksi Baru
            </button>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full bg-gray-800 text-sm text-left text-gray-300">
            <thead className="bg-gray-700 text-xs uppercase text-gray-300">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Nama Barang</th>
                <th className="py-3 px-4">Jumlah</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Admin</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {safeData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : (
                safeData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-700 hover:bg-gray-700/50"
                  >
                    {/* Tanggal */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {new Date(item.tanggal).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Tipe (Warna-warni) */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          item.tipe === "MASUK"
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {item.tipe}
                      </span>
                    </td>

                    {/* Nama Barang */}
                    <td className="py-3 px-4 font-medium text-white">
                      {item.sukuCadang?.namaBarang || "Barang Dihapus"}
                    </td>

                    {/* Jumlah */}
                    <td className="py-3 px-4 font-mono font-bold text-base">
                      {item.jumlah}
                    </td>

                    {/* Keterangan */}
                    <td className="py-3 px-4 italic text-gray-400">
                      {item.keterangan || "-"}
                    </td>

                    {/* Admin (Sementara ID dulu) */}
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {item.dilakukanOleh?.nama || `ID: ${item.dilakukanOlehId}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </AuthGuard>
  );
}