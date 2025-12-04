import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

// KUNCI RAHASIA (Ganti dengan string acak apa saja)
const SECRET_KEY = new TextEncoder().encode("RAHASIA_DAPUR_BENGKEL_XYZ_2025");

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Cari User berdasarkan Email
    const user = await prisma.pengguna.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Email tidak ditemukan" },
        { status: 401 }
      );
    }

    // 2. Cek Password (Bandingkan password input vs hash di DB)
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // 3. Buat Token (Kartu Akses)
    const token = await new SignJWT({
      id: user.id,
      nama: user.nama,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h") // Login berlaku 24 jam
      .sign(SECRET_KEY);

    // 4. Simpan Token di Cookies Browser
    cookies().set("token", token, {
      httpOnly: true, // Aman, tidak bisa dibaca script jahat
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 Hari
      path: "/",
    });

    return NextResponse.json({ message: "Login berhasil", role: user.role });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
