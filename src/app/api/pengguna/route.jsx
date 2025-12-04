import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"; // Import library enkripsi

// GET: Ambil Semua User
export async function GET() {
  try {
    const users = await prisma.pengguna.findMany({
      orderBy: { nama: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// POST: Tambah User Baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, email, password, role } = body;

    // 1. Validasi
    if (!nama || !email || !password || !role) {
      return NextResponse.json(
        { error: "Semua kolom wajib diisi" },
        { status: 400 }
      );
    }

    // 2. Cek Email Kembar
    const existing = await prisma.pengguna.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // 3. Enkripsi Password (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan ke DB
    const newUser = await prisma.pengguna.create({
      data: {
        nama,
        email,
        password: hashedPassword, // Simpan password yang sudah diacak
        role,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal tambah user" }, { status: 500 });
  }
}
