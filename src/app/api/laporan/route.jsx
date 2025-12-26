import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // 1. Ambil Parameter
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    // 2. Filter Kondisi Tanggal yang Lebih Akurat
    let whereCondition = {};
    if (startDate && endDate) {
      // Trik agar endDate mencakup sampai detik terakhir hari itu (23:59:59)
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereCondition = {
        tanggal: {
          gte: new Date(startDate),
          lte: endOfDay,
        },
      };
    }

    // 3. Ambil Transaksi (Filter Tanggal)
    const transaksi = await prisma.transaksiStok.findMany({
      where: whereCondition,
      include: {
        sukuCadang: true,
        dilakukanOleh: true,
      },
      orderBy: { tanggal: "desc" },
    });

    // 4. Hitung Statistik PERIODE INI (Berdasarkan transaksi di atas)
    let totalUangMasuk = 0; // Omzet (dari Barang Keluar)
    let totalUangKeluar = 0; // Belanja Stok (dari Barang Masuk)
    let estimasiProfit = 0; // Keuntungan (Jual - Beli)
    let itemTerjual = 0;
    let itemDibeli = 0;

    transaksi.forEach((trx) => {
      const hargaBeli = trx.sukuCadang?.hargaBeli || 0;
      const hargaJual = trx.sukuCadang?.hargaJual || 0;

      if (trx.tipe === "MASUK") {
        // Ini adalah Pengeluaran Bengkel (Restock)
        totalUangKeluar += trx.jumlah * hargaBeli;
        itemDibeli += trx.jumlah;
      } else if (trx.tipe === "KELUAR") {
        // Ini adalah Pemasukan Bengkel (Dipakai service/dijual)
        const omzetTransaksi = trx.jumlah * hargaJual;
        const modalTransaksi = trx.jumlah * hargaBeli;

        totalUangMasuk += omzetTransaksi;
        estimasiProfit += omzetTransaksi - modalTransaksi;
        itemTerjual += trx.jumlah;
      }
    });

    // 5. Hitung Valuasi Stok SAAT INI (Snapshot Gudang)
    // Data ini tetap penting untuk melihat sisa harta di gudang
    const stokItems = await prisma.sukuCadang.findMany();
    const totalAsetGudang = stokItems.reduce(
      (acc, item) => acc + item.hargaBeli * item.stok,
      0
    );
    const totalItemGudang = stokItems.reduce((acc, item) => acc + item.stok, 0);

    return NextResponse.json({
      // Data Transaksi (Tabel)
      transaksi,

      // Statistik Khusus Periode Filter (Misal: Laporan Bulan Januari)
      laporanPeriode: {
        totalUangKeluar, // Uang dipakai belanja stok
        totalUangMasuk, // Estimasi omzet dari sparepart
        estimasiProfit, // Estimasi keuntungan kotor
        itemTerjual,
        itemDibeli,
      },

      // Status Gudang Saat Ini (Realtime)
      statusGudang: {
        totalAset: totalAsetGudang,
        totalStok: totalItemGudang,
      },
    });
  } catch (error) {
    console.error("Error Laporan:", error);
    return NextResponse.json({ error: "Gagal ambil laporan" }, { status: 500 });
  }
}
