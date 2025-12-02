import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  console.log("DATABASE_URL YANG DIGUNAKAN:", process.env.DATABASE_URL);
  try {
    const suppliers = await prisma.Supplier.findMany({
      orderBy: {
        namaSupplier: "asc",
      },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Gagal mengambil data supplier:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
