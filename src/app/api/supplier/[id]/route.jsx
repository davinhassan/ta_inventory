import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { handler as authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. GET: Ambil Detail Supplier (SEMUA ROLE BOLEH LIHAT)
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params; // Next.js 15 requirement

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

// 2. PATCH: Update Data Supplier (STAFF DILARANG ⛔)
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

// 3. DELETE: Hapus Supplier (STAFF DILARANG ⛔)
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

    await prisma.supplier.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error DELETE supplier:", error);

    // Error Prisma P2003: Foreign Key Constraint (Supplier masih dipake sama Stok Barang)
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Gagal: Supplier ini masih menyuplai barang di Stok. Hapus barangnya dulu.",
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
