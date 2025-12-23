// src/app/api/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  // Buat respon sukses
  const response = NextResponse.json({ message: "Logout Berhasil" });

  // Perintah ke browser: "Hapus cookie bernama 'token' SEKARANG JUGA!"
  response.cookies.set("token", "", { 
    expires: new Date(0), 
    path: "/" 
  });

  return response;
}