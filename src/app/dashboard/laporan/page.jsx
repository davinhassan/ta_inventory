"use client";

import { useState, useEffect, useRef } from "react";
import TransaksiChart from "@/components/TransaksiChart";
import AuthGuard from "@/components/AuthGuard";
import { 
  Printer, 
  FileSpreadsheet, 
  Filter, 
  DollarSign, 
  Clock, 
  AlertTriangle 
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState("keuangan");
  const [loading, setLoading] = useState(false);

  const [dataKeuangan, setDataKeuangan] = useState({
    transaksi: [],
    laporanPeriode: {
      totalUangKeluar: 0,
      totalUangMasuk: 0,
      estimasiProfit: 0,
      itemTerjual: 0,
      itemDibeli: 0,
    },
  });

  const [dataAging, setDataAging] = useState([]);
  const [statsAging, setStatsAging] = useState({
    totalAset: 0,
    deadStockValue: 0,
  });

  const dateNow = new Date();
  const firstDay = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0).toISOString().split("T")[0];
  const [filters, setFilters] = useState({ start: firstDay, end: lastDay });

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Laporan-${activeTab}-${filters.start}`,
  });

  const fetchKeuangan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/laporan?start=${filters.start}&end=${filters.end}`);
      const result = await res.json();

      if (res.ok && Array.isArray(result)) {
        let totalMasuk = 0, totalKeluar = 0, itemTerjual = 0, itemDibeli = 0;

        result.forEach((item) => {
           const harga = item.tipe === "MASUK" 
             ? (item.sukuCadang?.hargaBeli || 0) 
             : (item.sukuCadang?.hargaJual || 0);
           const subtotal = harga * item.jumlah;

           if (item.tipe === "MASUK") {
             totalKeluar += subtotal;
             itemDibeli += item.jumlah;
           } else {
             totalMasuk += subtotal;
             itemTerjual += item.jumlah;
           }
        });

        setDataKeuangan({
          transaksi: result,
          laporanPeriode: {
            totalUangMasuk: totalMasuk,
            totalUangKeluar: totalKeluar,
            estimasiProfit: totalMasuk - totalKeluar,
            itemTerjual,
            itemDibeli
          }
        });
      }
    } catch (error) {
      console.error("Gagal fetch keuangan:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAging = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/laporan/aging");
      const json = await res.json();
      
      if (Array.isArray(json)) {
        setDataAging(json);
        let total = 0, dead = 0;
        json.forEach(item => {
          total += item.nilaiAset;
          if (item.ageDays > 90) dead += item.nilaiAset;
        });
        setStatsAging({ totalAset: total, deadStockValue: dead });
      }
    } catch (error) {
      console.error("Gagal fetch aging:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "keuangan") fetchKeuangan();
    if (activeTab === "aging") fetchAging();
  }, [activeTab]);

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    
    if (activeTab === "keuangan") {
        if (dataKeuangan.transaksi.length === 0) return alert("Data kosong.");
        const worksheet = workbook.addWorksheet("Keuangan");
        
        worksheet.columns = [
          { header: "Tanggal", key: "tgl", width: 15 },
          { header: "Tipe", key: "tipe", width: 10 },
          { header: "Barang", key: "brg", width: 25 },
          { header: "Qty", key: "qty", width: 10 },
          { header: "Nominal (Rp)", key: "nom", width: 20 },
        ];

        dataKeuangan.transaksi.forEach((item) => {
          const harga = item.tipe === "MASUK" ? (item.sukuCadang?.hargaBeli || 0) : (item.sukuCadang?.hargaJual || 0);
          worksheet.addRow({
            tgl: new Date(item.tanggal).toLocaleDateString("id-ID"),
            tipe: item.tipe,
            brg: item.sukuCadang?.namaBarang || "-",
            qty: item.jumlah,
            nom: harga * item.jumlah,
          });
        });
    } else {
        if (dataAging.length === 0) return alert("Data kosong.");
        const worksheet = workbook.addWorksheet("Aging Stok");

        worksheet.columns = [
            { header: "Barang", key: "brg", width: 25 },
            { header: "Stok", key: "stok", width: 10 },
            { header: "Umur (Hari)", key: "age", width: 15 },
            { header: "Status", key: "stat", width: 20 },
            { header: "Nilai Aset", key: "val", width: 20 },
        ];

        dataAging.forEach((item) => {
            worksheet.addRow({
                brg: item.namaBarang,
                stok: item.stok,
                age: item.ageDays,
                stat: item.status,
                val: item.nilaiAset
            });
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Laporan-${activeTab}.xlsx`);
  };

  return (
    <AuthGuard allowedRoles={["MANAJER"]}>
      {/* 1. CONTAINER UTAMA: max-w-full mencegah overflow ke samping */}
      <div className="p-4 md:p-8 w-full max-w-full space-y-6">
        
        {/* HEADER & TAB CONTROL */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="w-full xl:w-auto">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-3">Pusat Laporan & Analisa</h1>
            
            {/* TABS */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveTab("keuangan")}
                className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === "keuangan" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
              >
                <DollarSign size={16}/> <span>Keuangan</span>
              </button>
              <button 
                onClick={() => setActiveTab("aging")}
                className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === "aging" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
              >
                <Clock size={16}/> <span>Analisa Stok</span>
              </button>
            </div>
          </div>
          
          {/* ACTIONS & FILTERS - PERBAIKAN UTAMA DISINI */}
          <div className="w-full xl:w-auto flex flex-col md:flex-row gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
            
            {activeTab === "keuangan" && (
              /* Menggunakan flex-wrap agar aman di layar kecil */
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto border-b md:border-b-0 md:border-r border-gray-600 pb-3 md:pb-0 md:pr-3">
                {/* Wrapper Input Tanggal: min-w-[200px] agar tidak gepeng */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <input 
                    type="date" 
                    value={filters.start} 
                    onChange={(e) => setFilters({...filters, start: e.target.value})} 
                    className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 text-xs md:text-sm"
                  />
                  <span className="text-white shrink-0">-</span>
                  <input 
                    type="date" 
                    value={filters.end} 
                    onChange={(e) => setFilters({...filters, end: e.target.value})} 
                    className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 text-xs md:text-sm"
                  />
                </div>
                <button onClick={fetchKeuangan} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-bold shrink-0">
                  <Filter size={16}/>
                </button>
              </div>
            )}
            
            {/* Tombol Export */}
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={handlePrint} className="flex-1 md:flex-none justify-center bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded font-bold flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
                <Printer size={16}/> PDF
              </button>
              <button onClick={handleExportExcel} className="flex-1 md:flex-none justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded font-bold flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
                <FileSpreadsheet size={16}/> Excel
              </button>
            </div>
          </div>
        </div>

        {/* --- KONTEN UTAMA --- */}
        <div ref={componentRef} className="print:p-8 print:bg-white print:text-black min-w-0">
          
          <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold text-black uppercase">Laporan {activeTab === "keuangan" ? "Keuangan" : "Analisa Stok"}</h1>
            <p>Dicetak Tanggal: {new Date().toLocaleDateString("id-ID")}</p>
          </div>

          {activeTab === "keuangan" && (
            <>
              {/* Ringkasan: Grid Responsif */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 break-inside-avoid">
                 <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-gray-700 p-5 rounded-xl">
                    <h3 className="text-gray-400 print:text-black text-xs font-bold uppercase mb-1">Pemasukan</h3>
                    <p className="text-xl md:text-2xl font-bold text-green-400 print:text-black truncate">+ Rp {dataKeuangan.laporanPeriode.totalUangMasuk.toLocaleString("id-ID")}</p>
                 </div>
                 <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-gray-700 p-5 rounded-xl">
                    <h3 className="text-gray-400 print:text-black text-xs font-bold uppercase mb-1">Pengeluaran</h3>
                    <p className="text-xl md:text-2xl font-bold text-red-400 print:text-black truncate">- Rp {dataKeuangan.laporanPeriode.totalUangKeluar.toLocaleString("id-ID")}</p>
                 </div>
                 <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-blue-500/50 p-5 rounded-xl">
                    <h3 className="text-blue-200 print:text-black text-xs font-bold uppercase mb-1">Profit</h3>
                    <p className={`text-xl md:text-2xl font-bold truncate ${dataKeuangan.laporanPeriode.estimasiProfit >= 0 ? "text-blue-400 print:text-black" : "text-red-500"}`}>
                       Rp {dataKeuangan.laporanPeriode.estimasiProfit.toLocaleString("id-ID")}
                    </p>
                 </div>
              </div>

              <div className="mb-8 print:hidden">
                <TransaksiChart dataTransaksi={dataKeuangan.transaksi} />
              </div>

              {/* TABEL: Wrapper overflow-x-auto wajib ada */}
              <div className="bg-gray-800 print:bg-white rounded-xl border border-gray-700 print:border-gray-300 overflow-hidden shadow-lg w-full">
                 <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left text-gray-300 print:text-black whitespace-nowrap">
                        <thead className="bg-gray-900 print:bg-gray-200 text-xs uppercase text-gray-400 print:text-black">
                        <tr>
                            <th className="px-6 py-4">Tanggal</th>
                            <th className="px-6 py-4">Tipe</th>
                            <th className="px-6 py-4">Barang</th>
                            <th className="px-6 py-4 text-right">Jml</th>
                            <th className="px-6 py-4 text-right">Nominal</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 print:divide-gray-300">
                        {dataKeuangan.transaksi.length === 0 ? (
                            <tr><td colSpan="5" className="p-6 text-center">Data kosong.</td></tr>
                        ) : (
                            dataKeuangan.transaksi.map((item) => {
                                const harga = item.tipe === "MASUK" ? (item.sukuCadang?.hargaBeli || 0) : (item.sukuCadang?.hargaJual || 0);
                                const nominal = harga * item.jumlah;
                                return (
                                    <tr key={item.id} className="print:border-b print:border-gray-300 hover:bg-gray-700/50">
                                    <td className="px-6 py-3">{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                                    <td className="px-6 py-3 font-bold">
                                        <span className={`px-2 py-1 rounded text-[10px] ${item.tipe==="MASUK"?"bg-green-900/30 text-green-400 border border-green-800":"bg-red-900/30 text-red-400 border border-red-800"}`}>
                                            {item.tipe}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">{item.sukuCadang?.namaBarang}</td>
                                    <td className="px-6 py-3 text-right">{item.jumlah}</td>
                                    <td className="px-6 py-3 text-right">Rp {nominal.toLocaleString("id-ID")}</td>
                                    </tr>
                                )
                            })
                        )}
                        </tbody>
                    </table>
                 </div>
              </div>
            </>
          )}

          {activeTab === "aging" && (
            <>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 break-inside-avoid">
                    <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-gray-700 p-6 rounded-xl">
                        <h3 className="text-gray-400 print:text-black text-sm font-bold uppercase">Total Nilai Aset</h3>
                        <p className="text-2xl md:text-3xl font-bold text-white print:text-black mt-2 truncate">Rp {statsAging.totalAset.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-red-900/50 p-6 rounded-xl">
                        <h3 className="text-red-400 print:text-black text-sm font-bold uppercase flex items-center gap-2">
                            <AlertTriangle size={18}/> Aset "Mati" {'>'} 90 Hari
                        </h3>
                        <p className="text-2xl md:text-3xl font-bold text-red-500 print:text-black mt-2 truncate">Rp {statsAging.deadStockValue.toLocaleString("id-ID")}</p>
                    </div>
                </div>

                {/* Tabel Aging */}
                <div className="bg-gray-800 print:bg-white rounded-xl overflow-hidden border border-gray-700 print:border-gray-300 shadow-lg w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-gray-300 print:text-black text-sm whitespace-nowrap">
                            <thead className="bg-gray-900 print:bg-gray-200 text-xs uppercase text-gray-400 print:text-black border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Barang</th>
                                    <th className="px-6 py-4 text-center">Stok</th>
                                    <th className="px-6 py-4 text-center">Umur (Hari)</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Nilai Aset</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700 print:divide-gray-300">
                                {dataAging.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">Stok kosong.</td></tr>
                                ) : (
                                    dataAging.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold">{item.namaBarang}</div>
                                            <div className="text-xs text-gray-500">{item.kodeBarang}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-base">{item.stok}</td>
                                        <td className="px-6 py-4 text-center font-bold">{item.ageDays} Hari</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold shadow text-white ${item.color}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">
                                            Rp {item.nilaiAset.toLocaleString("id-ID")}
                                        </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}