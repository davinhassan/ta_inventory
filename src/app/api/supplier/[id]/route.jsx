import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. GET: Ambil Data Supplier (Untuk mengisi Form Edit)
export async function GET(request, { params }) {
  try {
    const { id } = await params; // Wajib await di Next.js 15

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error GET supplier:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// 2. PATCH: Update Data Supplier
export async function PATCH(request, { params }) {
  try {
    const { id } = await params; // Wajib await
    const body = await request.json();
    const { namaSupplier, alamat, telepon } = body;

    const updatedSupplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: {
        namaSupplier,
        alamat,
        telepon,
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error PATCH supplier:", error);
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// 3. DELETE: Hapus Supplier
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Wajib await

    await prisma.supplier.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus data" },
      { status: 500 }
    );
  }
}
