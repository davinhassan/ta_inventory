import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Ambil Parameter URL
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    // 2. Filter Kondisi Tanggal
    let whereCondition = {};
    if (startDate && endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereCondition = {
        tanggal: {
          gte: new Date(startDate),
          lte: endOfDay,
        },
      };
    }

    // 3. Query Database (Ambil TransaksiStok)
    const laporan = await prisma.transaksiStok.findMany({
      where: whereCondition,
      include: {
        sukuCadang: { select: { namaBarang: true, kodeBarang: true, hargaBeli: true, hargaJual: true } },
        dilakukanOleh: { select: { nama: true } },
      },
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json(laporan);
  } catch (error) {
    console.error("Error Laporan:", error);
    return NextResponse.json({ error: "Gagal ambil laporan" }, { status: 500 });
  }
}