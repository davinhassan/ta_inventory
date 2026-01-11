// src/app/api/pengguna/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. GET: AMBIL DATA USER
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myRole = session.user.role;

  try {
    let users;

    // PERBAIKAN LOGIKA AKSES
    if (myRole === "ADMIN") {
      // Admin HANYA boleh lihat Staff
      users = await prisma.pengguna.findMany({
        where: { role: "STAFF" },
        orderBy: { id: "desc" },
      });
    } else if (myRole === "MANAJER" || myRole === "PEMILIK") {
      // Manajer & Pemilik boleh lihat semua
      users = await prisma.pengguna.findMany({
        orderBy: { id: "desc" },
      });
    } else {
      // Staff atau role lain tidak boleh lihat daftar user
      return NextResponse.json(
        { error: "Anda tidak memiliki akses melihat data pengguna." },
        { status: 403 }
      );
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

  // PERBAIKAN: Validasi Input Dasar
  if (!nama || !email || !password || !role) {
    return NextResponse.json(
      { error: "Semua field (Nama, Email, Password, Role) wajib diisi!" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password minimal 6 karakter!" },
      { status: 400 }
    );
  }

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
    // Hapus password dari response agar aman
    const { password: _, ...userWithoutPass } = newUser;
    
    return NextResponse.json(userWithoutPass);
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
  const myId = parseInt(session.user.id);

  // PERBAIKAN: Cegah hapus diri sendiri
  if (id === myId) {
    return NextResponse.json(
      { error: "DILARANG! Anda tidak bisa menghapus akun sendiri." },
      { status: 400 }
    );
  }

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
    // Handle error constraint (misal user sudah pernah transaksi)
    if (error.code === 'P2003') {
       return NextResponse.json({ error: "Gagal: User ini memiliki riwayat transaksi/stok." }, { status: 500 });
    }
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
      if (password.length < 6) {
          return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
      }
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