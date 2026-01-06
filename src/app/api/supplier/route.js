import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


// GET: Ambil Semua Supplier
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // PROTEKSI: Staff tidak boleh tambah
  if (session.user.role === "STAFF") {
    return NextResponse.json(
      { error: "Akses Ditolak: Staff hanya bisa melihat data!" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { namaSupplier, alamat, telepon } = body;

    // Validasi Input Sederhana
    if (!namaSupplier || !telepon) {
        return NextResponse.json({ error: "Nama dan Telepon wajib diisi" }, { status: 400 });
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        namaSupplier,
        alamat,
        telepon,
      },
    });

    return NextResponse.json(newSupplier, { status: 201 });

  } catch (error) {
    // MENANGANI DUPLIKAT DATA
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "Nomor Telepon sudah terdaftar!" }, { status: 400 });
    }
    
    console.error("Error POST Supplier:", error);
    return NextResponse.json({ error: "Gagal tambah data" }, { status: 500 });
  }
}