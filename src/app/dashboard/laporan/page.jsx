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
  // --- STATE UMUM ---
  const [activeTab, setActiveTab] = useState("keuangan"); // 'keuangan' | 'aging'
  const [loading, setLoading] = useState(false);

  // --- STATE LAPORAN KEUANGAN ---
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

  // --- STATE LAPORAN AGING ---
  const [dataAging, setDataAging] = useState([]);
  const [statsAging, setStatsAging] = useState({
    totalAset: 0,
    deadStockValue: 0,
  });

  // --- FILTER TANGGAL (Hanya untuk Keuangan) ---
  const dateNow = new Date();
  const firstDay = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0).toISOString().split("T")[0];
  const [filters, setFilters] = useState({ start: firstDay, end: lastDay });

  // --- REF PRINT ---
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Laporan-${activeTab}-${filters.start}`,
  });

  // =========================================
  // 1. FETCH LAPORAN KEUANGAN
  // =========================================
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

  // =========================================
  // 2. FETCH LAPORAN AGING (STOK)
  // =========================================
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

  // Effect: Ambil data sesuai Tab yang aktif
  useEffect(() => {
    if (activeTab === "keuangan") fetchKeuangan();
    if (activeTab === "aging") fetchAging();
  }, [activeTab]); // Refetch saat ganti tab

  // =========================================
  // 3. EXPORT EXCEL (Dynamic based on Tab)
  // =========================================
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
      <div className="p-8">
        
        {/* HEADER & TAB CONTROL */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Pusat Laporan & Analisa</h1>
            
            {/* TABS */}
            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab("keuangan")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === "keuangan" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                    <DollarSign size={16}/> Laporan Keuangan
                </button>
                <button 
                    onClick={() => setActiveTab("aging")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === "aging" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                    <Clock size={16}/> Analisa Stok (Aging)
                </button>
            </div>
          </div>
          
          {/* ACTIONS (Filter hanya muncul di tab keuangan) */}
          <div className="flex flex-wrap gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700 items-center">
            {activeTab === "keuangan" && (
                <>
                    <input type="date" value={filters.start} onChange={(e) => setFilters({...filters, start: e.target.value})} className="bg-gray-900 text-white p-2 rounded border border-gray-600 text-sm"/>
                    <span className="text-white">-</span>
                    <input type="date" value={filters.end} onChange={(e) => setFilters({...filters, end: e.target.value})} className="bg-gray-900 text-white p-2 rounded border border-gray-600 text-sm"/>
                    <button onClick={fetchKeuangan} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-bold"><Filter size={16}/></button>
                    <div className="w-px h-6 bg-gray-600 mx-1"></div>
                </>
            )}
            
            <button onClick={handlePrint} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded font-bold flex items-center gap-2 text-sm"><Printer size={16}/> PDF</button>
            <button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded font-bold flex items-center gap-2 text-sm"><FileSpreadsheet size={16}/> Excel</button>
          </div>
        </div>

        {/* --- KONTEN UTAMA (SWITCH BERDASARKAN TAB) --- */}
        <div ref={componentRef} className="print:p-8 print:bg-white print:text-black">
          
          {/* Judul Print */}
          <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold text-black uppercase">Laporan {activeTab === "keuangan" ? "Keuangan" : "Analisa Stok"}</h1>
            <p>Dicetak Tanggal: {new Date().toLocaleDateString("id-ID")}</p>
          </div>

          {/* ======================= */}
          {/* VIEW: KEUANGAN          */}
          {/* ======================= */}
          {activeTab === "keuangan" && (
            <>
              {/* Ringkasan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 break-inside-avoid">
                 <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-gray-700 p-6 rounded-xl">
                    <h3 className="text-gray-400 print:text-black text-xs font-bold uppercase mb-1">Pemasukan</h3>
                    <p className="text-2xl font-bold text-green-400 print:text-black">+ Rp {dataKeuangan.laporanPeriode.totalUangMasuk.toLocaleString("id-ID")}</p>
                 </div>
                 <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-gray-700 p-6 rounded-xl">
                    <h3 className="text-gray-400 print:text-black text-xs font-bold uppercase mb-1">Pengeluaran</h3>
                    <p className="text-2xl font-bold text-red-400 print:text-black">- Rp {dataKeuangan.laporanPeriode.totalUangKeluar.toLocaleString("id-ID")}</p>
                 </div>
                 <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-blue-500 p-6 rounded-xl">
                    <h3 className="text-blue-200 print:text-black text-xs font-bold uppercase mb-1">Profit</h3>
                    <p className={`text-3xl font-bold ${dataKeuangan.laporanPeriode.estimasiProfit >= 0 ? "text-blue-400 print:text-black" : "text-red-500"}`}>
                       Rp {dataKeuangan.laporanPeriode.estimasiProfit.toLocaleString("id-ID")}
                    </p>
                 </div>
              </div>

              {/* Chart */}
              <div className="mb-8 print:hidden">
                <TransaksiChart dataTransaksi={dataKeuangan.transaksi} />
              </div>

              {/* Tabel */}
              <div className="bg-gray-800 print:bg-white rounded-xl border border-gray-700 print:border-gray-300 overflow-hidden">
                 <table className="w-full text-sm text-left text-gray-300 print:text-black">
                    <thead className="bg-gray-900 print:bg-gray-200 text-xs uppercase text-gray-400 print:text-black">
                       <tr>
                          <th className="px-6 py-3">Tanggal</th>
                          <th className="px-6 py-3">Tipe</th>
                          <th className="px-6 py-3">Barang</th>
                          <th className="px-6 py-3 text-right">Jml</th>
                          <th className="px-6 py-3 text-right">Nominal</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 print:divide-gray-300">
                       {dataKeuangan.transaksi.length === 0 ? (
                          <tr><td colSpan="5" className="p-4 text-center">Data kosong.</td></tr>
                       ) : (
                          dataKeuangan.transaksi.map((item) => {
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
                                </tr>
                             )
                          })
                       )}
                    </tbody>
                 </table>
              </div>
            </>
          )}

          {/* ======================= */}
          {/* VIEW: AGING             */}
          {/* ======================= */}
          {activeTab === "aging" && (
            <>
               {/* Ringkasan Aging */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 break-inside-avoid">
                    <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-gray-700 p-6 rounded-xl">
                        <h3 className="text-gray-400 print:text-black text-sm font-bold uppercase">Total Nilai Aset</h3>
                        <p className="text-3xl font-bold text-white print:text-black mt-2">Rp {statsAging.totalAset.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-gray-800 print:bg-white print:border-gray-300 border border-red-900/50 p-6 rounded-xl">
                        <h3 className="text-red-400 print:text-black text-sm font-bold uppercase flex items-center gap-2">
                            <AlertTriangle size={16}/> Aset "Mati" {'>'} 90 Hari
                        </h3>
                        <p className="text-3xl font-bold text-red-500 print:text-black mt-2">Rp {statsAging.deadStockValue.toLocaleString("id-ID")}</p>
                    </div>
                </div>

                {/* Tabel Aging */}
                <div className="bg-gray-800 print:bg-white rounded-xl overflow-hidden border border-gray-700 print:border-gray-300">
                    <table className="w-full text-left text-gray-300 print:text-black text-sm">
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
            </>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}