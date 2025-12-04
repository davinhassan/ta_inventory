import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: Ambil 1 User (Untuk Edit)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await prisma.pengguna.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user)
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Error server" }, { status: 500 });
  }
}

// PATCH: Edit User
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, email, role, password } = body;

    // Siapkan data update
    let updateData = { nama, email, role };

    // Jika password diisi, hash password baru. Jika kosong, biarkan password lama.
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updated = await prisma.pengguna.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update user" }, { status: 500 });
  }
}

// DELETE: Hapus User
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.pengguna.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Terhapus" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal hapus (User mungkin memiliki data transaksi)" },
      { status: 500 }
    );
  }
}
