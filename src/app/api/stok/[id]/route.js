import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // <--- Import Benar

// 1. GET: Ambil Detail Barang
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params; // Next.js 15

    const barang = await prisma.sukuCadang.findUnique({
      where: { id: parseInt(id) },
      include: { supplier: true },
    });

    if (!barang) return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });

    return NextResponse.json(barang);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// 2. PATCH: Update Barang
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "STAFF") {
    return NextResponse.json({ error: "Akses Ditolak" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.sukuCadang.update({
      where: { id: parseInt(id) },
      data: {
        kodeBarang: body.kodeBarang,
        namaBarang: body.namaBarang,
        supplierId: parseInt(body.supplierId),
        hargaBeli: parseFloat(body.hargaBeli),
        hargaJual: body.hargaJual !== undefined ? parseFloat(body.hargaJual) : undefined,
        maxStok: body.maxStok !== undefined ? parseInt(body.maxStok) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gagal update:", error);
    return NextResponse.json({ error: "Gagal update database" }, { status: 500 });
  }
}

// 3. DELETE: Hapus Barang
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "STAFF") {
    return NextResponse.json({ error: "Akses Ditolak" }, { status: 403 });
  }

  try {
    const { id } = await params;

    await prisma.sukuCadang.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Gagal: Barang ini sudah memiliki riwayat transaksi/PO." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}