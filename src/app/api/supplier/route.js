import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Mendefinisikan instruksi untuk metode GET
export async function GET() {
  try {
    // Instruksi: Ambil semua data dari model 'supplier'
    const suppliers = await prisma.supplier.findMany();

    // Instruksi: Kirimkan hasilnya sebagai respons JSON
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Gagal mengambil data supplier:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
