import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Ambil parameter tanggal dari URL (misal: ?start=2023-01-01&end=2023-01-31)
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    // Filter kondisi
    let whereCondition = {};
    if (startDate && endDate) {
      whereCondition = {
        tanggal: {
          gte: new Date(startDate), // Greater than or Equal (Mulai dari)
          lte: new Date(endDate), // Less than or Equal (Sampai)
        },
      };
    }

    // 1. Ambil Transaksi Sesuai Filter
    const transaksi = await prisma.transaksiStok.findMany({
      where: whereCondition,
      include: {
        sukuCadang: true,
        dilakukanOleh: true, // Siapa yang melakukan
      },
      orderBy: { tanggal: "desc" },
    });

    // 2. Hitung Ringkasan (Valuasi Stok Saat Ini)
    // Ini tidak terpengaruh filter tanggal karena stok adalah kondisi "sekarang"
    const stokItems = await prisma.sukuCadang.findMany();
    const totalAset = stokItems.reduce(
      (acc, item) => acc + item.hargaBeli * item.stok,
      0
    );
    const totalItem = stokItems.reduce((acc, item) => acc + item.stok, 0);

    return NextResponse.json({
      transaksi,
      ringkasan: {
        totalAset,
        totalItem,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil laporan" }, { status: 500 });
  }
}
