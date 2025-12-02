import Link from "next/link";

// Ini adalah Server Component, bagus untuk mengambil data awal
async function PageSupplier() {
  // 1. Mengambil data dari API supplier yang sudah kita punya
  const response = await fetch("http://localhost:3000/api/supplier", {
    cache: "no-store", // Selalu ambil data terbaru
  });
  const suppliers = await response.json();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Manajemen Supplier</h1>

      {/* Tombol untuk menuju halaman tambah supplier (akan kita buat nanti) */}
      <div className="mb-4">
        <Link href="/dashboard/supplier/tambah">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400">
            + Tambah Supplier Baru
          </button>
        </Link>
      </div>

      {/* Tabel untuk menampilkan data supplier */}
      <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-left text-gray-300 uppercase text-sm">
            <th className="py-3 px-4">Nama Supplier</th>
            <th className="py-3 px-4">Alamat</th>
            <th className="py-3 px-4">Telepon</th>
            <th className="py-3 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-gray-200">
          {/* Loop melalui data suppliers dan buat satu baris untuk setiap item */}
          {suppliers.map((item) => (
            <tr
              key={item.id}
              className="border-t border-gray-700 hover:bg-gray-700/50"
            >
              <td className="py-3 px-4">{item.namaSupplier}</td>
              <td className="py-3 px-4">{item.alamat}</td>
              <td className="py-3 px-4">{item.telepon}</td>
              <td className="py-3 px-4 text-center">
                {/* Tombol Edit & Hapus akan kita tambahkan di sini nanti */}
                <div className="flex justify-center items-center space-x-2">
                  <button className="bg-yellow-500 text-white font-bold py-1 px-3 rounded text-xs opacity-50 cursor-not-allowed">
                    Edit
                  </button>
                  <button className="bg-red-600 text-white font-bold py-1 px-3 rounded text-xs opacity-50 cursor-not-allowed">
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PageSupplier;
