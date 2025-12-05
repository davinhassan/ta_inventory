import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Hapus cookie bernama 'token'
  cookies().delete("token");

  return NextResponse.json({ message: "Berhasil logout" });
}
