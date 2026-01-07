import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  
  // Cek sesi login
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cek Role (Staff tidak boleh approve/reject)
  if (session.user.role === "STAFF") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const { id } = await params; // Next.js 15
    const body = await request.json();
    const { status } = body; // Kita akan kirim "SELESAI" atau "DITOLAK"

    // Validasi input status
    if (status !== "SELESAI" && status !== "DITOLAK") {
        return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    // --- SKENARIO 1: DISETUJUI (Barang Masuk -> Tambah Stok) ---
    if (status === "SELESAI") {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Status PO
            const updatedPO = await tx.purchaseOrder.update({
                where: { id: parseInt(id) },
                data: { status: "SELESAI" },
                include: { items: true } // Ambil item untuk loop stok
            });

            // 2. Loop item untuk tambah stok
            for (const item of updatedPO.items) {
                // Update Master Stok
                await tx.sukuCadang.update({
                    where: { id: item.sukuCadangId },
                    data: { stok: { increment: item.jumlah } }
                });

                // Catat Riwayat Masuk (Kartu Stok)
                await tx.transaksiStok.create({
                    data: {
                        tipe: "MASUK",
                        jumlah: item.jumlah,
                        keterangan: `PO Masuk #${updatedPO.noPO}`,
                        sukuCadangId: item.sukuCadangId,
                        dilakukanOlehId: parseInt(session.user.id),
                        tanggal: new Date(),
                    }
                });
            }
            return updatedPO;
        });
        return NextResponse.json(result);
    } 
    
    // --- SKENARIO 2: DITOLAK (Hanya Ganti Status) ---
    else if (status === "DITOLAK") {
        const rejectedPO = await prisma.purchaseOrder.update({
            where: { id: parseInt(id) },
            data: { status: "DITOLAK" }
        });
        return NextResponse.json(rejectedPO);
    }

  } catch (error) {
    console.error("Error Update PO:", error);
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}