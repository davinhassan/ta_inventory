import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. GET: Ambil Data Barang (Untuk Form Edit)
export async function GET(request, { params }) {
  try {
    const { id } = await params; // Wajib await di Next.js 15

    const barang = await prisma.sukuCadang.findUnique({
      where: { id: parseInt(id) },
    });

    if (!barang) {
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(barang);
  } catch (error) {
    console.error("Error GET stok:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// 2. PATCH: Update Barang
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { kodeBarang, namaBarang, hargaBeli, supplierId } = body;

    const updated = await prisma.sukuCadang.update({
      where: { id: parseInt(id) },
      data: {
        kodeBarang, // Bisa diupdate jika perlu, atau hapus baris ini jika readonly
        namaBarang,
        hargaBeli: parseFloat(hargaBeli),
        supplierId: parseInt(supplierId),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

// 3. DELETE: Hapus Barang
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.sukuCadang.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Terhapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}
