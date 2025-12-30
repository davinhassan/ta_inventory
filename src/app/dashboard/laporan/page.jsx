"use client";

import { useState, useEffect, useRef } from "react";
import TransaksiChart from "@/components/TransaksiChart";
import AuthGuard from "@/components/AuthGuard";
import { DollarSign, Package, Printer, FileSpreadsheet } from "lucide-react";
import { useReactToPrint } from "react-to-print";

// 1. Ganti Import Library Excel
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function LaporanPage() {
  const [data, setData] = useState({
    transaksi: [],
    laporanPeriode: {
      totalUangKeluar: 0,
      totalUangMasuk: 0,
      estimasiProfit: 0,
      itemTerjual: 0,
      itemDibeli: 0,
    },
    statusGudang: {
      totalAset: 0,
      totalStok: 0,
    },
  });

  const [loading, setLoading] = useState(true);

  const dateNow = new Date();
  const firstDay = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [filters, setFilters] = useState({
    start: firstDay,
    end: lastDay,
  });

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Laporan-Stok-${filters.start}-${filters.end}`,
  });

  // --- 2. FUNGSI EXPORT EXCEL BARU (Pakai ExcelJS) ---
  const handleExportExcel = async () => {
    if (data.transaksi.length === 0) {
      alert("Tidak ada data untuk diexport.");
      return;
    }

    // A. Buat Workbook & Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Transaksi");

    // B. Bikin Header Kolom (Lebih Rapi)
    worksheet.columns = [
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "Waktu", key: "waktu", width: 10 },
      { header: "Tipe", key: "tipe", width: 10 },
      { header: "Kode Barang", key: "kode", width: 15 },
      { header: "Nama Barang", key: "nama", width: 25 },
      { header: "Jumlah", key: "jumlah", width: 10 },
      { header: "Harga Satuan", key: "harga", width: 15 },
      { header: "Total Nominal", key: "total", width: 18 },
      { header: "Admin", key: "admin", width: 15 },
    ];

    // C. Masukkan Data Baris per Baris
    data.transaksi.forEach((item) => {
      const harga =
        item.tipe === "MASUK"
          ? item.sukuCadang?.hargaBeli || 0
          : item.sukuCadang?.hargaJual || 0;
      const nominal = harga * item.jumlah;

      worksheet.addRow({
        tanggal: new Date(item.tanggal).toLocaleDateString("id-ID"),
        waktu: new Date(item.tanggal).toLocaleTimeString("id-ID"),
        tipe: item.tipe,
        kode: item.sukuCadang?.kodeBarang || "-",
        nama: item.sukuCadang?.namaBarang || "-",
        jumlah: item.jumlah,
        harga: harga,
        total: nominal,
        admin: item.dilakukanOleh?.nama || "System",
      });
    });

    // D. Styling Header (Biar Cantik - Bold & Warna Abu)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };

    // E. Generate File & Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Laporan-Bengkel-${filters.start}-sampai-${filters.end}.xlsx`);
  };
  // ----------------------------------------------------

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/laporan?start=${filters.start}&end=${filters.end}`
      );
      const result = await res.json();
      if (res.ok) {
        setData(result);
      }
    } catch (error) {
      console.error("Gagal fetch laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  return (
    <AuthGuard allowedRoles={["MANAJER"]}>
      <div className="p-8">
        {/* HEADER & TOMBOL AKSI */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white">
            Laporan Keuangan & Stok
          </h1>

          <div className="flex flex-wrap gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
            <input
              type="date"
              value={filters.start}
              onChange={(e) =>
                setFilters({ ...filters, start: e.target.value })
              }
              className="bg-gray-900 border border-gray-600 text-white text-sm p-2 rounded"
            />
            <span className="text-white self-center">-</span>
            <input
              type="date"
              value={filters.end}
              onChange={(e) => setFilters({ ...filters, end: e.target.value })}
              className="bg-gray-900 border border-gray-600 text-white text-sm p-2 rounded"
            />
            <button
              onClick={fetchLaporan}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold"
            >
              Filter
            </button>

            {/* TOMBOL PRINT PDF */}
            <button
              onClick={handlePrint}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
            >
              <Printer size={16} /> Print PDF
            </button>

            {/* TOMBOL EXPORT EXCEL */}
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
            >
              <FileSpreadsheet size={16} /> Export Excel
            </button>
          </div>
        </div>

        {/* AREA PRINT (Wrapper) */}
        <div
          ref={componentRef}
          className="print:p-8 print:bg-white print:text-black"
        >
          {/* Header Print Only */}
          <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold text-black uppercase">
              Laporan Bengkel XYZ
            </h1>
            <p className="text-sm text-gray-600">
              Periode: {new Date(filters.start).toLocaleDateString("id-ID")} -{" "}
              {new Date(filters.end).toLocaleDateString("id-ID")}
            </p>
          </div>

          {/* STATUS GUDANG */}
          <div className="mb-8 break-inside-avoid">
            <h2 className="text-gray-400 print:text-gray-600 text-sm font-bold uppercase mb-3">
              Status Gudang (Realtime)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-900/40 print:bg-gray-100 p-6 rounded-xl border border-indigo-700 print:border-gray-300 flex items-center justify-between">
                <div>
                  <p className="text-indigo-300 print:text-gray-600 text-sm font-medium uppercase">
                    Valuasi Aset
                  </p>
                  <p className="text-3xl font-bold text-white print:text-black mt-1">
                    Rp {data.statusGudang?.totalAset.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="p-3 bg-indigo-800 print:hidden rounded-full text-indigo-200">
                  <DollarSign size={24} />
                </div>
              </div>

              <div className="bg-slate-800 print:bg-gray-100 p-6 rounded-xl border border-slate-700 print:border-gray-300 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 print:text-gray-600 text-sm font-medium uppercase">
                    Total Fisik
                  </p>
                  <p className="text-3xl font-bold text-white print:text-black mt-1">
                    {data.statusGudang?.totalStok.toLocaleString("id-ID")} Unit
                  </p>
                </div>
                <div className="p-3 bg-slate-700 print:hidden rounded-full text-slate-300">
                  <Package size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* PERFORMA BISNIS */}
          <div className="mb-8 break-inside-avoid">
            <h2 className="text-gray-400 print:text-gray-600 text-sm font-bold uppercase mb-3">
              Laporan Periode Terpilih
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Omzet */}
              <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-gray-700 p-6 rounded-xl">
                <h3 className="text-gray-400 print:text-black text-xs font-bold uppercase mb-1">
                  Pemasukan
                </h3>
                <p className="text-2xl font-bold text-green-400 print:text-black">
                  + Rp{" "}
                  {data.laporanPeriode?.totalUangMasuk.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Pengeluaran */}
              <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-gray-700 p-6 rounded-xl">
                <h3 className="text-gray-400 print:text-black text-xs font-bold uppercase mb-1">
                  Pengeluaran
                </h3>
                <p className="text-2xl font-bold text-red-400 print:text-black">
                  - Rp{" "}
                  {data.laporanPeriode?.totalUangKeluar.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Profit */}
              <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-blue-500 p-6 rounded-xl">
                <h3 className="text-blue-200 print:text-black text-xs font-bold uppercase mb-1">
                  Profit Kotor
                </h3>
                <p
                  className={`text-3xl font-bold ${
                    data.laporanPeriode?.estimasiProfit >= 0
                      ? "text-blue-400 print:text-black"
                      : "text-red-500"
                  }`}
                >
                  Rp{" "}
                  {data.laporanPeriode?.estimasiProfit.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* CHART (Hidden on Print) */}
          <div className="mb-8 print:hidden">
            <TransaksiChart dataTransaksi={data.transaksi} />
          </div>

          {/* TABEL TRANSAKSI */}
          <div className="bg-gray-800 print:bg-white rounded-xl border border-gray-700 print:border-gray-300 overflow-hidden">
            <div className="p-4 border-b border-gray-700 print:border-gray-300">
              <h2 className="text-lg font-bold text-white print:text-black">
                Rincian Transaksi
              </h2>
            </div>

            <table className="min-w-full text-sm text-left text-gray-300 print:text-black">
              <thead className="bg-gray-900 print:bg-gray-200 text-xs uppercase text-gray-400 print:text-black">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Barang</th>
                  <th className="py-3 px-4 text-right">Jml</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 print:divide-gray-300">
                {data.transaksi.map((item) => {
                  const harga =
                    item.tipe === "MASUK"
                      ? item.sukuCadang?.hargaBeli || 0
                      : item.sukuCadang?.hargaJual || 0;
                  const nominal = harga * item.jumlah;
                  return (
                    <tr
                      key={item.id}
                      className="print:border-b print:border-gray-300"
                    >
                      <td className="py-3 px-4">
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 px-4 font-bold">{item.tipe}</td>
                      <td className="py-3 px-4">
                        {item.sukuCadang?.namaBarang}
                      </td>
                      <td className="py-3 px-4 text-right">{item.jumlah}</td>
                      <td className="py-3 px-4 text-right">
                        Rp {nominal.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        {item.dilakukanOleh?.nama || "System"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Print */}
          <div className="hidden print:block mt-8 text-center text-xs text-gray-500 border-t pt-4">
            Dicetak pada: {new Date().toLocaleString("id-ID")}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
