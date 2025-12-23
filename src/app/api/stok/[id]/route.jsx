import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. GET (Sama seperti sebelumnya)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const barang = await prisma.sukuCadang.findUnique({
      where: { id: parseInt(id) },
    });
    if (!barang) return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });
    return NextResponse.json(barang);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// 2. PATCH: Update Barang (DIPERBAIKI)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // --- DEBUGGING: LIHAT TERMINAL VS CODE ---
    console.log("Data yang diterima API:", body);
    // -----------------------------------------

    const { kodeBarang, namaBarang, hargaBeli, supplierId, maxStok, hargaJual } = body;

    const updated = await prisma.sukuCadang.update({
      where: { id: parseInt(id) },
      data: {
        kodeBarang, 
        namaBarang,
        supplierId: parseInt(supplierId),

        // PERBAIKAN LOGIKA HARGA:
        // Gunakan Number() agar pasti jadi angka.
        // Jangan pakai "if (hargaBeli)" karena 0 akan dianggap false.
        
        hargaBeli: Number(hargaBeli),
        
        // Cek apakah hargaJual dikirim? Jika ya update, jika tidak (undefined) biarkan.
        hargaJual: hargaJual !== undefined ? Number(hargaJual) : undefined,
        
        maxStok: maxStok !== undefined ? Number(maxStok) : undefined,
      },
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gagal update:", error); // Cek terminal jika error
    return NextResponse.json({ error: "Gagal update database" }, { status: 500 });
  }
}

// 3. DELETE (Sama seperti sebelumnya)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.sukuCadang.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Terhapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}