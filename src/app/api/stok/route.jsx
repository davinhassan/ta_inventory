import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { handler as authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. GET: AMBIL SEMUA DATA (Semua Role Boleh)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sukuCadang = await prisma.sukuCadang.findMany({
      include: { supplier: true },
      // orderBy: { createdAt: 'desc' } // Opsional
    });
    return NextResponse.json(sukuCadang);
  } catch (error) {
    console.error("Gagal ambil data:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 2. POST: TAMBAH BARANG (STAFF DILARANG ⛔)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // --- PROTEKSI STAFF ---
  if (session.user.role === "STAFF") {
    return NextResponse.json(
      { error: "Akses Ditolak: Staff hanya bisa melihat!" },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();

    // Default values
    const maxStokValue = data.maxStok ? parseInt(data.maxStok) : 50;
    const hargaJualValue = data.hargaJual ? parseFloat(data.hargaJual) : 0;

    const newSukuCadang = await prisma.sukuCadang.create({
      data: {
        kodeBarang: data.kodeBarang,
        namaBarang: data.namaBarang,
        hargaBeli: parseFloat(data.hargaBeli),
        hargaJual: hargaJualValue,
        stok: 0,
        maxStok: maxStokValue,
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
