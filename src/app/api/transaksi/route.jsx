import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.transaksiStok.findMany({
      include: {
        sukuCadang: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tipe, jumlah, keterangan, sukuCadangId } = body;

    // 1. Konversi Tipe Data (PENTING!)
    const jumlahInt = parseInt(jumlah);
    const sukuCadangIdInt = parseInt(sukuCadangId);

    // 2. Validasi Input
    if (!tipe || !jumlahInt || !sukuCadangIdInt) {
      return NextResponse.json(
        { error: "Tipe, Barang, dan Jumlah wajib diisi & valid" },
        { status: 400 }
      );
    }

    // 3. Cek Barang
    const barang = await prisma.sukuCadang.findUnique({
      where: { id: sukuCadangIdInt },
    });

    if (!barang) {
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      );
    }

    // 4. Cek Stok Cukup (Khusus Keluar)
    if (tipe === "KELUAR" && barang.stok < jumlahInt) {
      return NextResponse.json(
        { error: `Stok tidak cukup! Sisa: ${barang.stok}` },
        { status: 400 }
      );
    }

    // 5. Cek User Dummy (Untuk menghindari error Foreign Key)
    // Kita cari user pertama yg ada di DB. Kalau kosong, kita buat user dummy.
    let user = await prisma.pengguna.findFirst();
    if (!user) {
      user = await prisma.pengguna.create({
        data: {
          nama: "Admin Sistem",
          email: "admin@bengkel.com",
          password: "123", // Dummy
          role: "PEMILIK",
        },
      });
    }

    // 6. Jalankan Transaksi Database
    const result = await prisma.$transaction(async (tx) => {
      // A. Catat Riwayat
      const transaksi = await tx.transaksiStok.create({
        data: {
          tipe,
          jumlah: jumlahInt,
          keterangan: keterangan || "-", // Default dash jika kosong
          sukuCadangId: sukuCadangIdInt,
          dilakukanOlehId: user.id, // Pakai ID user yang valid
        },
      });

      // B. Update Stok
      const updateData =
        tipe === "MASUK" ? { increment: jumlahInt } : { decrement: jumlahInt };

      await tx.sukuCadang.update({
        where: { id: sukuCadangIdInt },
        data: { stok: updateData },
      });

      return transaksi;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Transaksi Error Detail:", error); // Cek terminal untuk lihat error detailnya
    return NextResponse.json(
      { error: "Gagal memproses transaksi: " + error.message },
      { status: 500 }
    );
  }
}
