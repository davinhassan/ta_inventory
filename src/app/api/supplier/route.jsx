import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { handler as authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. GET: Ambil Semua Supplier (SEMUA ROLE BOLEH LIHAT)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { namaSupplier: "asc" },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error GET Supplier:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // --- PROTEKSI: STAFF DILARANG TAMBAH DATA ---
  if (session.user.role === "STAFF") {
    return NextResponse.json(
      { error: "Akses Ditolak: Staff hanya bisa melihat data!" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { namaSupplier, alamat, telepon } = body;

    const newSupplier = await prisma.supplier.create({
      data: {
        namaSupplier,
        alamat,
        telepon,
      },
    });

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Error POST Supplier:", error);
    return NextResponse.json({ error: "Gagal tambah data" }, { status: 500 });
  }
}
