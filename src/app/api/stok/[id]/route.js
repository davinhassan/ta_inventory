import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// FUNGSI BARU: GET untuk mengambil detail SATU suku cadang
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);

    // Cari satu suku cadang yang id-nya cocok
    const sukuCadang = await prisma.sukuCadang.findUnique({
      where: { id: id },
      include: {
        // Kita juga butuh info supplier-nya
        supplier: true,
      },
    });

    // Jika tidak ditemukan, kirim error 404 Not Found
    if (!sukuCadang) {
      return new NextResponse("Suku cadang tidak ditemukan", { status: 404 });
    }

    // Jika ditemukan, kirim datanya
    return NextResponse.json(sukuCadang);
  } catch (error) {
    console.error("Gagal mengambil data suku cadang:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// FUNGSI BARU: PUT untuk menyimpan perubahan (update)
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json(); // Ambil data baru dari body request

    // Update data suku cadang yang id-nya cocok
    const updatedSukuCadang = await prisma.sukuCadang.update({
      where: { id: id },
      data: {
        kodeBarang: data.kodeBarang,
        namaBarang: data.namaBarang,
        hargaBeli: parseFloat(data.hargaBeli),
        supplier: {
          connect: {
            id: parseInt(data.supplierId),
          },
        },
      },
    });

    // Kirim kembali data yang sudah di-update
    return NextResponse.json(updatedSukuCadang);
  } catch (error) {
    console.error("Gagal memperbarui suku cadang:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// FUNGSI LAMA: DELETE untuk menghapus suku cadang (tidak berubah)
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    await prisma.sukuCadang.delete({
      where: { id: id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Gagal menghapus suku cadang:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
