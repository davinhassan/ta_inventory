import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const barangs = await prisma.sukuCadang.findMany({
      where: { stok: { gt: 0 } },
      include: { supplier: { select: { namaSupplier: true } } }
    });

    const agingReport = await Promise.all(barangs.map(async (item) => {
      const lastPO = await prisma.purchaseOrder.findFirst({
        where: {
          items: { some: { sukuCadangId: item.id } },
          status: "SELESAI" 
        },
        orderBy: { tanggalPesan: 'desc' },
        select: { tanggalPesan: true }
      });

      const refDate = lastPO ? new Date(lastPO.tanggalPesan) : new Date(item.updatedAt);
      const today = new Date();
      const diffTime = Math.abs(today - refDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      let status = "AMAN";
      let color = "bg-green-500";
      
      if (diffDays > 90) {
        status = "DEAD STOCK (>90 Hari)";
        color = "bg-red-600";
      } else if (diffDays > 30) {
        status = "SLOW MOVING (31-90 Hari)";
        color = "bg-yellow-500";
      } else {
        status = "FRESH (0-30 Hari)";
        color = "bg-green-500";
      }

      return {
        ...item,
        lastRestock: refDate,
        ageDays: diffDays,
        status,
        color,
        nilaiAset: item.stok * item.hargaBeli
      };
    }));

    agingReport.sort((a, b) => b.ageDays - a.ageDays);

    return NextResponse.json(agingReport);
  } catch (error) {
    return NextResponse.json({ error: "Gagal analisa stok" }, { status: 500 });
  }
}