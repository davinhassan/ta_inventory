import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// --- FUNGSI GET (TETAP SAMA) ---
export async function GET() {
  try {
    const sukuCadang = await prisma.sukuCadang.findMany({
      include: {
        supplier: true,
      },
    });
    return NextResponse.json(sukuCadang);
  } catch (error) {
    console.error("Gagal mengambil data suku cadang:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// --- FUNGSI POST (DENGAN PERBAIKAN) ---
export async function POST(request) {
  try {
    const data = await request.json();

    // Menggunakan Prisma untuk membuat record baru di tabel SukuCadang
    const newSukuCadang = await prisma.sukuCadang.create({
      data: {
        kodeBarang: data.kodeBarang,
        namaBarang: data.namaBarang,
        hargaBeli: parseFloat(data.hargaBeli),
        // CARA YANG BENAR UNTUK MENGHUBUNGKAN RELASI
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
