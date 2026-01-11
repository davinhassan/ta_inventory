// src/app/api/stok-master/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  // 1. Cek sesi
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 2. Ambil semua data barang
    const barangs = await prisma.sukuCadang.findMany({
      orderBy: { namaBarang: "asc" },
      select: {
        id: true,
        kodeBarang: true,
        namaBarang: true,
        stok: true,
        hargaJual: true,
        
        // --- PERBAIKAN PENTING ---
        // Tambahkan field ini agar frontend bisa memfilter berdasarkan supplier
        supplierId: true, 
        
        // Opsional: Ambil nama supplier juga untuk tampilan debug/info
        supplier: {
            select: { namaSupplier: true }
        }
      }
    });

    return NextResponse.json(barangs);
  } catch (error) {
    console.error("Error ambil stok master:", error);
    return NextResponse.json({ error: "Gagal ambil data barang" }, { status: 500 });
  }
}