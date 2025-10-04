import Link from "next/link";
// Komponen React selalu dimulai dengan huruf kapital
async function PageStok() {
  // Mengambil data dari API
  const response = await fetch("http://localhost:3000/api/stok", {
    cache: "no-store",
  });
  const sukuCadang = await response.json();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manajemen Stok Suku Cadang</h1>

      <div className="mb-4">
        <Link href="/dashboard/stok/tambah">
          <button className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            + Tambah Suku Cadang Baru
          </button>
        </Link>
      </div>

      <table className="min-w-full bg-black border border-gray-200">
        <thead>
          <tr className="bg-gray-500 text-left">
            <th className="py-2 px-4 border-b">Kode Barang</th>
            <th className="py-2 px-4 border-b">Nama Barang</th>
            <th className="py-2 px-4 border-b">Supplier</th>
            <th className="py-2 px-4 border-b">Stok</th>
            <th className="py-2 px-4 border-b">Harga Beli</th>
          </tr>
        </thead>
        <tbody>
          {sukuCadang.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{item.kodeBarang}</td>
              <td className="py-2 px-4 border-b">{item.namaBarang}</td>
              {/* Pastikan API Anda menyertakan data supplier */}
              <td className="py-2 px-4 border-b">
                {item.supplier?.namaSupplier || "N/A"}
              </td>
              <td className="py-2 px-4 border-b">{item.stok}</td>
              <td className="py-2 px-4 border-b">
                Rp{item.hargaBeli.toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PageStok;
