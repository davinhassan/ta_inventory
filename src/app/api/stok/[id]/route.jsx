import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. GET: Ambil Detail Barang
export async function GET(request, { params }) {
  try {
    // Next.js 15 butuh await params
    const { id } = await params;

    const barang = await prisma.sukuCadang.findUnique({
      where: { id: parseInt(id) },
      // Optional: include relasi jika ingin melihat detail supplier/transaksi
      // include: { supplier: true }
    });

    if (!barang) {
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(barang);
  } catch (error) {
    console.error("Error GET:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// 2. PATCH: Update Barang (Harga Jual & Beli)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Debugging untuk melihat data yang dikirim frontend
    console.log("Data update diterima:", body);

    const updated = await prisma.sukuCadang.update({
      where: { id: parseInt(id) },
      data: {
        kodeBarang: body.kodeBarang,
        namaBarang: body.namaBarang,
        supplierId: parseInt(body.supplierId), // Pastikan Integer

        // Konversi Harga ke Float (Desimal)
        hargaBeli: parseFloat(body.hargaBeli),

        // Update Harga Jual (Jika ada, parse ke Float. Jika tidak, abaikan)
        hargaJual:
          body.hargaJual !== undefined ? parseFloat(body.hargaJual) : undefined,

        // Update Max Stok (Integer)
        maxStok:
          body.maxStok !== undefined ? parseInt(body.maxStok) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gagal update:", error);
    return NextResponse.json(
      { error: "Gagal update database. Pastikan input valid." },
      { status: 500 }
    );
  }
}

// 3. DELETE: Hapus Barang (Dengan Proteksi Relasi)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await prisma.sukuCadang.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.error("Error DELETE:", error);

    // MENANGANI ERROR FOREIGN KEY (P2003)
    // Ini terjadi jika barang sudah pernah dipakai di Transaksi atau PO
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Tidak dapat dihapus: Barang ini memiliki riwayat transaksi atau tercatat di PO.",
        },
        { status: 400 } // Bad Request
      );
    }

    return NextResponse.json(
      { error: "Gagal menghapus data" },
      { status: 500 }
    );
  }
}
