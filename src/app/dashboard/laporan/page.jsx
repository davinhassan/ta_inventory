"use client";

import { useState, useEffect, useRef } from "react";
import TransaksiChart from "@/components/TransaksiChart";
import AuthGuard from "@/components/AuthGuard";
import { Printer, FileSpreadsheet, Filter } from "lucide-react";
import { useReactToPrint } from "react-to-print";
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

  // Set Tanggal Awal & Akhir Bulan Ini
  const dateNow = new Date();
  const firstDay = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0).toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    start: firstDay,
    end: lastDay,
  });

  const componentRef = useRef();
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Laporan-${filters.start}-${filters.end}`,
  });

  // --- EXPORT EXCEL ---
  const handleExportExcel = async () => {
    if (data.transaksi.length === 0) return alert("Tidak ada data.");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan");

    worksheet.columns = [
      { header: "Tanggal", key: "tgl", width: 15 },
      { header: "Tipe", key: "tipe", width: 10 },
      { header: "Barang", key: "brg", width: 25 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "Nominal (Rp)", key: "nom", width: 20 },
      { header: "Admin", key: "adm", width: 15 },
    ];

    data.transaksi.forEach((item) => {
      const harga = item.tipe === "MASUK" 
        ? (item.sukuCadang?.hargaBeli || 0) 
        : (item.sukuCadang?.hargaJual || 0);
      const nominal = harga * item.jumlah;

      worksheet.addRow({
        tgl: new Date(item.tanggal).toLocaleDateString("id-ID"),
        tipe: item.tipe,
        brg: item.sukuCadang?.namaBarang || "-",
        qty: item.jumlah,
        nom: nominal,
        adm: item.dilakukanOleh?.nama || "System",
      });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Laporan-${filters.start}.xlsx`);
  };

  // --- FETCH DATA & HITUNG MANUAL ---
  const fetchLaporan = async () => {
    setLoading(true);
    try {
      // --- PERBAIKAN DI SINI: URL mengarah ke /api/laporan (bukan /api/laporan/stok) ---
      const res = await fetch(`/api/laporan?start=${filters.start}&end=${filters.end}`);
      const result = await res.json();

      if (res.ok && Array.isArray(result)) {
        
        // --- LOGIKA HITUNG MANUAL DI SINI ---
        let totalMasuk = 0;
        let totalKeluar = 0;
        let itemTerjual = 0;
        let itemDibeli = 0;

        result.forEach((item) => {
           // Tentukan Harga
           const harga = item.tipe === "MASUK" 
             ? (item.sukuCadang?.hargaBeli || 0) 
             : (item.sukuCadang?.hargaJual || 0);
           
           const subtotal = harga * item.jumlah;

           if (item.tipe === "MASUK") {
             totalKeluar += subtotal; // Uang Keluar (Beli Barang)
             itemDibeli += item.jumlah;
           } else {
             totalMasuk += subtotal; // Uang Masuk (Jual Barang)
             itemTerjual += item.jumlah;
           }
        });

        setData({
          transaksi: result,
          laporanPeriode: {
            totalUangMasuk: totalMasuk,
            totalUangKeluar: totalKeluar,
            estimasiProfit: totalMasuk - totalKeluar,
            itemTerjual,
            itemDibeli
          },
          statusGudang: {
            totalAset: 0, 
            totalStok: 0  
          }
        });

      } else {
        setData(prev => ({ ...prev, transaksi: [] }));
      }
    } catch (error) {
      console.error("Gagal:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLaporan(); }, []);

  return (
    <AuthGuard allowedRoles={["MANAJER",]}>
      <div className="p-8">
        
        {/* HEADER & FILTER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white">Laporan Keuangan & Stok</h1>
          
          <div className="flex flex-wrap gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
            <input type="date" value={filters.start} onChange={(e) => setFilters({...filters, start: e.target.value})} className="bg-gray-900 text-white p-2 rounded border border-gray-600"/>
            <span className="text-white self-center">-</span>
            <input type="date" value={filters.end} onChange={(e) => setFilters({...filters, end: e.target.value})} className="bg-gray-900 text-white p-2 rounded border border-gray-600"/>
            
            <button onClick={fetchLaporan} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2">
                <Filter size={16}/> Filter
            </button>
            <button onClick={handlePrint} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2">
                <Printer size={16}/> PDF
            </button>
            <button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2">
                <FileSpreadsheet size={16}/> Excel
            </button>
          </div>
        </div>

        {/* PRINT AREA */}
        <div ref={componentRef} className="print:p-8 print:bg-white print:text-black">
          
          <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold text-black uppercase">Laporan Bengkel XYZ</h1>
            <p>Periode: {filters.start} s/d {filters.end}</p>
          </div>

          {/* KARTU RINGKASAN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 break-inside-avoid">
             {/* Pemasukan */}
             <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-gray-700 p-6 rounded-xl">
                <h3 className="text-gray-400 print:text-black text-xs font-bold uppercase mb-1">Pemasukan (Penjualan)</h3>
                <p className="text-2xl font-bold text-green-400 print:text-black">+ Rp {data.laporanPeriode.totalUangMasuk.toLocaleString("id-ID")}</p>
                <p className="text-xs text-gray-500 mt-1">{data.laporanPeriode.itemTerjual} Barang Terjual</p>
             </div>
             
             {/* Pengeluaran */}
             <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-gray-700 p-6 rounded-xl">
                <h3 className="text-gray-400 print:text-black text-xs font-bold uppercase mb-1">Pengeluaran (Belanja)</h3>
                <p className="text-2xl font-bold text-red-400 print:text-black">- Rp {data.laporanPeriode.totalUangKeluar.toLocaleString("id-ID")}</p>
                <p className="text-xs text-gray-500 mt-1">{data.laporanPeriode.itemDibeli} Barang Masuk</p>
             </div>

             {/* Profit */}
             <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-blue-500 p-6 rounded-xl">
                <h3 className="text-blue-200 print:text-black text-xs font-bold uppercase mb-1">Estimasi Profit</h3>
                <p className={`text-3xl font-bold ${data.laporanPeriode.estimasiProfit >= 0 ? "text-blue-400 print:text-black" : "text-red-500"}`}>
                   Rp {data.laporanPeriode.estimasiProfit.toLocaleString("id-ID")}
                </p>
             </div>
          </div>

          {/* CHART */}
          <div className="mb-8 print:hidden">
            <TransaksiChart dataTransaksi={data.transaksi} />
          </div>

          {/* TABEL DATA */}
          <div className="bg-gray-800 print:bg-white rounded-xl border border-gray-700 print:border-gray-300 overflow-hidden">
             <table className="w-full text-sm text-left text-gray-300 print:text-black">
                <thead className="bg-gray-900 print:bg-gray-200 text-xs uppercase text-gray-400 print:text-black">
                   <tr>
                      <th className="px-6 py-3">Tanggal</th>
                      <th className="px-6 py-3">Tipe</th>
                      <th className="px-6 py-3">Barang</th>
                      <th className="px-6 py-3 text-right">Jml</th>
                      <th className="px-6 py-3 text-right">Nominal</th>
                      <th className="px-6 py-3">Admin</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 print:divide-gray-300">
                   {data.transaksi.length === 0 ? (
                      <tr><td colSpan="6" className="p-4 text-center">Data kosong.</td></tr>
                   ) : (
                      data.transaksi.map((item) => {
                         const harga = item.tipe === "MASUK" ? (item.sukuCadang?.hargaBeli || 0) : (item.sukuCadang?.hargaJual || 0);
                         const nominal = harga * item.jumlah;
                         return (
                            <tr key={item.id} className="print:border-b print:border-gray-300">
                               <td className="px-6 py-3">{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                               <td className="px-6 py-3 font-bold">
                                  <span className={item.tipe==="MASUK"?"text-green-400 print:text-black":"text-red-400 print:text-black"}>{item.tipe}</span>
                               </td>
                               <td className="px-6 py-3">{item.sukuCadang?.namaBarang}</td>
                               <td className="px-6 py-3 text-right">{item.jumlah}</td>
                               <td className="px-6 py-3 text-right">Rp {nominal.toLocaleString("id-ID")}</td>
                               <td className="px-6 py-3 text-xs">{item.dilakukanOleh?.nama}</td>
                            </tr>
                         )
                      })
                   )}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}