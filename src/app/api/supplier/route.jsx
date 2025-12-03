import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Ambil Semua Supplier
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { namaSupplier: "asc" },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// POST: Tambah Supplier Baru
export async function POST(request) {
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
    return NextResponse.json({ error: "Gagal tambah data" }, { status: 500 });
  }
}
