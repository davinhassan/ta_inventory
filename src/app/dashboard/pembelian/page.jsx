"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useSession } from "next-auth/react";
import {
  Plus,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PembelianPage() {
  const { data: session } = useSession();

  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const fetchPO = async (halaman) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pembelian?page=${halaman}&limit=10`);
      const responseData = await res.json();

      if (responseData.data && Array.isArray(responseData.data)) {
        setPoList(responseData.data);
        setTotalPage(responseData.pagination?.totalPage || 1);
        setTotalData(responseData.pagination?.totalData || 0);
      } else {
        setPoList([]);
      }
    } catch (e) {
      console.error(e);
      setPoList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPO(page);
  }, [page]);

  const handleProcess = async (id, statusKeputusan) => {
    const pesan =
      statusKeputusan === "SELESAI"
        ? "Konfirmasi: Terima barang ini? Stok akan bertambah."
        : "Konfirmasi: Tolak PO ini? Stok TIDAK akan bertambah.";

    if (!confirm(pesan)) return;

    try {
      const res = await fetch(`/api/pembelian/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusKeputusan }),
      });

      if (res.ok) {
        alert(
          statusKeputusan === "SELESAI" ? "Berhasil disetujui!" : "PO Ditolak."
        );
        fetchPO(page);
      } else {
        alert("Gagal memproses data.");
      }
    } catch (e) {
      alert("Error koneksi");
    }
  };

  const canApprove = session?.user?.role !== "STAFF";

  return (
    <AuthGuard allowedRoles={["MANAJER", "ADMIN", "STAFF", "PEMILIK"]}>
      <div className="p-4 md:p-8 pb-24 md:pb-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground flex gap-2 items-center">
              <Package className="text-blue-600 dark:text-blue-400" /> Data
              Barang Masuk (PO)
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Total {totalData} request ditemukan.
            </p>
          </div>

          <Link href="/dashboard/pembelian/tambah" className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex justify-center items-center gap-2 shadow-lg transition text-sm md:text-base">
              <Plus size={18} /> Buat Request PO
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-muted/50 rounded-xl border border-border animate-pulse">
            <span className="text-muted-foreground">Memuat data PO...</span>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-foreground whitespace-nowrap text-sm md:text-base">
                <thead className="bg-secondary text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 md:px-6 md:py-4">No PO</th>
                    <th className="px-4 py-3 md:px-6 md:py-4">Supplier</th>
                    <th className="px-4 py-3 md:px-6 md:py-4">Item</th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-center">
                      Bukti
                    </th>
                    <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {poList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-muted-foreground"
                      >
                        Belum ada data.
                      </td>
                    </tr>
                  ) : (
                    poList.map((po) => (
                      <tr key={po.id} className="hover:bg-muted/50 transition">
                        <td className="px-4 py-3 md:px-6 md:py-4 font-mono font-bold text-foreground">
                          {po.noPO}
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4">
                          {po.supplier?.namaSupplier}
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4 text-sm">
                          <ul className="list-disc list-inside">
                            {po.items.map((i, idx) => (
                              <li key={idx}>
                                {i.sukuCadang?.namaBarang}{" "}
                                <span className="text-muted-foreground">
                                  (x{i.jumlah})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>

                        <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                          {po.buktiFoto ? (
                            <a
                              href={po.buktiFoto}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded hover:underline text-xs font-medium"
                            >
                              <FileText size={14} /> Lihat
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 md:px-6 md:py-4">
                          {po.status === "SELESAI" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs md:text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                              <CheckCircle size={14} /> Selesai
                            </span>
                          )}
                          {po.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs md:text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                              <Clock size={14} /> Pending
                            </span>
                          )}
                          {po.status === "DITOLAK" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs md:text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                              <XCircle size={14} /> Ditolak
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                          {po.status === "PENDING" && canApprove ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleProcess(po.id, "SELESAI")}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition shadow"
                              >
                                <CheckCircle size={14} /> Setuju
                              </button>
                              <button
                                onClick={() => handleProcess(po.id, "DITOLAK")}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition shadow"
                              >
                                <X size={14} /> Tolak
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              {po.status === "PENDING"
                                ? "Menunggu Approval"
                                : "Selesai"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTROLS PAGINATION */}
        {totalPage > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground disabled:opacity-50 hover:bg-muted transition text-sm shadow-sm"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-muted-foreground text-sm">
              Halaman <span className="text-foreground font-bold">{page}</span>{" "}
              dari {totalPage}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
              disabled={page === totalPage}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground disabled:opacity-50 hover:bg-muted transition text-sm shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
