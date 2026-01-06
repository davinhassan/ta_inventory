import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // <--- Import Benar

// 1. GET: AMBIL SEMUA DATA
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sukuCadang = await prisma.sukuCadang.findMany({
      include: { supplier: true },
      orderBy: { namaBarang: 'asc' }
    });
    return NextResponse.json(sukuCadang);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 2. POST: TAMBAH BARANG
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "STAFF") {
    return NextResponse.json({ error: "Akses Ditolak" }, { status: 403 });
  }

  try {
    const data = await request.json();

    const newSukuCadang = await prisma.sukuCadang.create({
      data: {
        kodeBarang: data.kodeBarang,
        namaBarang: data.namaBarang,
        hargaBeli: parseFloat(data.hargaBeli),
        hargaJual: data.hargaJual ? parseFloat(data.hargaJual) : 0,
        stok: 0,
        maxStok: data.maxStok ? parseInt(data.maxStok) : 50,
        supplier: {
          connect: { id: parseInt(data.supplierId) },
        },
      },
    });

    return NextResponse.json(newSukuCadang, { status: 201 });
  } catch (error) {
    console.error("Gagal tambah:", error);
    return NextResponse.json({ error: "Gagal menambah data" }, { status: 500 });
  }
}