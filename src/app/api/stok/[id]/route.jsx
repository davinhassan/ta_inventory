import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { handler as authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. GET: Ambil Detail Barang (SEMUA ROLE BOLEH LIHAT)
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    const barang = await prisma.sukuCadang.findUnique({
      where: { id: parseInt(id) },
      include: { supplier: true },
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

// 2. PATCH: Update Barang (STAFF DILARANG ⛔)
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // --- PROTEKSI: STAFF DILARANG EDIT ---
  if (session.user.role === "STAFF") {
    return NextResponse.json(
      { error: "Akses Ditolak: Staff tidak boleh mengedit data!" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Debugging
    console.log("Data update diterima:", body);

    const updated = await prisma.sukuCadang.update({
      where: { id: parseInt(id) },
      data: {
        kodeBarang: body.kodeBarang,
        namaBarang: body.namaBarang,
        supplierId: parseInt(body.supplierId),

        // Konversi ke Float/Integer
        hargaBeli: parseFloat(body.hargaBeli),

        // Update kondisional (hanya jika dikirim)
        hargaJual:
          body.hargaJual !== undefined ? parseFloat(body.hargaJual) : undefined,
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

// 3. DELETE: Hapus Barang (STAFF DILARANG ⛔)
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // --- PROTEKSI: STAFF DILARANG HAPUS ---
  if (session.user.role === "STAFF") {
    return NextResponse.json(
      { error: "Akses Ditolak: Staff tidak boleh menghapus data!" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    await prisma.sukuCadang.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.error("Error DELETE:", error);

    // Error Prisma P2003: Foreign Key Constraint
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Gagal: Barang ini sudah memiliki riwayat transaksi/PO dan tidak bisa dihapus.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Gagal menghapus data" },
      { status: 500 }
    );
  }
}
