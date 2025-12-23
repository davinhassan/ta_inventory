import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// --- FUNGSI GET (TETAP SAMA) ---
export async function GET() {
  try {
    const sukuCadang = await prisma.sukuCadang.findMany({
      include: {
        supplier: true,
      },
      // KITA HAPUS BAGIAN orderBy KARENA KOLOM createdAt BELUM ADA
      // orderBy: {
      //   createdAt: 'desc' 
      // }
    });
    return NextResponse.json(sukuCadang);
  } catch (error) {
    console.error("Gagal mengambil data suku cadang:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// --- FUNGSI POST (SUDAH DITAMBAH HARGA JUAL) ---
export async function POST(request) {
  try {
    const data = await request.json();

    // 1. Cek Max Stok (Default 50 jika kosong)
    const maxStokValue = data.maxStok ? parseInt(data.maxStok) : 50;

    // 2. Cek Harga Jual (Default 0 jika kosong)
    const hargaJualValue = data.hargaJual ? parseFloat(data.hargaJual) : 0;

    const newSukuCadang = await prisma.sukuCadang.create({
      data: {
        kodeBarang: data.kodeBarang,
        namaBarang: data.namaBarang,
        hargaBeli: parseFloat(data.hargaBeli),
        
        // --- BAGIAN BARU: SIMPAN HARGA JUAL ---
        hargaJual: hargaJualValue,
        // --------------------------------------

        stok: 0,
        maxStok: maxStokValue, 
        supplier: {
          connect: {
            id: parseInt(data.supplierId),
          },
        },
      },
    });

    return NextResponse.json(newSukuCadang, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat suku cadang baru:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}