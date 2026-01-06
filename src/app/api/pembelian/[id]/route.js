import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Next.js 15 params harus di-await
    const { id } = await params;
    const { status } = await request.json(); // Kita kirim status: "SELESAI"

    // 1. Cari Data PO
    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: { items: true, supplier: true },
    });

    if (!existingPO) return NextResponse.json({ error: "PO Tidak ditemukan" }, { status: 404 });

    // 2. LOGIKA APPROVAL (Hanya jika status berubah jadi SELESAI)
    if (status === "SELESAI" && existingPO.status !== "SELESAI") {
      
      await prisma.$transaction(async (tx) => {
        // A. Update Status PO jadi SELESAI
        await tx.purchaseOrder.update({
          where: { id: parseInt(id) },
          data: { status: "SELESAI" },
        });

        // B. Loop Barang untuk Tambah Stok Otomatis
        for (const item of existingPO.items) {
          
          // 1. Update Stok Fisik di Tabel SukuCadang
          await tx.sukuCadang.update({
            where: { id: item.sukuCadangId },
            data: { stok: { increment: item.jumlah } }, // <--- STOK BERTAMBAH DISINI!
          });

          // 2. Catat di Riwayat Stok (Agar muncul di laporan)
          await tx.transaksiStok.create({
            data: {
              tipe: "MASUK",
              jumlah: item.jumlah,
              keterangan: `PO: ${existingPO.noPO} (${existingPO.supplier.namaSupplier})`,
              sukuCadangId: item.sukuCadangId,
              dilakukanOlehId: parseInt(session.user.id),
              tanggal: new Date(),
            },
          });
        }
      });
      return NextResponse.json({ message: "Approved & Stok Ditambahkan" });
    }

    return NextResponse.json({ error: "Status tidak valid atau sudah selesai" }, { status: 400 });

  } catch (error) {
    console.error("Error Approval:", error);
    return NextResponse.json({ error: "Gagal memproses approval" }, { status: 500 });
  }
}