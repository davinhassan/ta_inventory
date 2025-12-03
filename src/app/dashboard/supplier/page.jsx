import Link from "next/link";
import SupplierButtons from "./SupplierButtons"; // 1. Kita IMPORT komponen tombol di sini

// Fungsi untuk mengambil data API dengan aman
async function getSuppliers() {
  try {
    // Pastikan URL ini sesuai dengan port server Anda
    const res = await fetch("http://localhost:3000/api/supplier", {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Gagal mengambil data:", res.statusText);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("Error koneksi:", error);
    return [];
  }
}

export default async function PageSupplier() {
  const suppliers = await getSuppliers();

  // Pastikan data selalu berupa Array agar tidak error .map()
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Manajemen Supplier</h1>

      {/* Tombol Tambah */}
      <div className="mb-4">
        <Link href="/dashboard/supplier/tambah">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition-all">
            + Tambah Supplier Baru
          </button>
        </Link>
      </div>

      {/* Tabel Data */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full bg-gray-800 text-sm text-left text-gray-300">
          <thead className="bg-gray-700 text-xs uppercase text-gray-300">
            <tr>
              <th className="py-3 px-4">Nama Supplier</th>
              <th className="py-3 px-4">Alamat</th>
              <th className="py-3 px-4">Telepon</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {safeSuppliers.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  Tidak ada data supplier.
                </td>
              </tr>
            ) : (
              safeSuppliers.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 font-medium text-white">
                    {item.namaSupplier}
                  </td>
                  <td className="py-3 px-4">{item.alamat}</td>
                  <td className="py-3 px-4">{item.telepon}</td>

                  {/* 2. Di sini kita PASANG komponen tombolnya */}
                  <td className="py-3 px-4 text-center">
                    <SupplierButtons id={item.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
