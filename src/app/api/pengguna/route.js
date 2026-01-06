import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

// --- PERBAIKAN PENTING DI SINI ---
// Ambil authOptions dari file baru di lib
import { authOptions } from "@/lib/auth"; 
// ---------------------------------

// 1. GET: AMBIL DATA USER
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myRole = session.user.role;

  try {
    let users;
    // Admin hanya boleh lihat Staff
    if (myRole === "ADMIN") {
      users = await prisma.pengguna.findMany({
        where: { role: "STAFF" },
        orderBy: { id: "desc" },
      });
    } else {
      // Manajer/Pemilik boleh lihat semua
      users = await prisma.pengguna.findMany({
        orderBy: { id: "desc" },
      });
    }
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// 2. POST: TAMBAH USER BARU
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myRole = session.user.role;
  const body = await request.json();
  const { nama, email, password, role } = body;

  // Proteksi: Admin cuma boleh bikin Staff
  if (myRole === "ADMIN" && role !== "STAFF") {
    return NextResponse.json(
      { error: "Admin hanya boleh membuat akun Staff!" },
      { status: 403 }
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.pengguna.create({
      data: { nama, email, password: hashedPassword, role },
    });
    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Email mungkin sudah terdaftar" },
      { status: 400 }
    );
  }
}

// 3. DELETE: HAPUS USER
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id"));
  const myRole = session.user.role;

  try {
    const targetUser = await prisma.pengguna.findUnique({ where: { id } });
    if (!targetUser)
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );

    // Proteksi: Admin gaboleh hapus atasan/sesama
    if (myRole === "ADMIN" && targetUser.role !== "STAFF") {
      return NextResponse.json(
        { error: "Admin dilarang menghapus atasan/sesama!" },
        { status: 403 }
      );
    }

    await prisma.pengguna.delete({ where: { id } });
    return NextResponse.json({ message: "User dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}

// 4. PUT: EDIT USER & GANTI PASSWORD
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myRole = session.user.role;
  const body = await request.json();
  const { id, nama, role, password } = body;

  try {
    const targetUser = await prisma.pengguna.findUnique({
      where: { id: parseInt(id) },
    });
    if (!targetUser)
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );

    // Proteksi: Admin gaboleh edit atasan
    if (myRole === "ADMIN") {
      if (targetUser.role !== "STAFF") {
        return NextResponse.json(
          { error: "DILARANG! Admin hanya boleh mengedit akun Staff." },
          { status: 403 }
        );
      }
      if (role !== "STAFF") {
        return NextResponse.json(
          { error: "DILARANG! Admin tidak bisa menaikkan jabatan." },
          { status: 403 }
        );
      }
    }

    const updateData = { nama, role };

    // Cuma ganti password kalau diisi
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.pengguna.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}