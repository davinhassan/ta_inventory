import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logout Berhasil" });

  // Hapus cookie sesi NextAuth (untuk memastikan logout bersih)
  response.cookies.set("next-auth.session-token", "", { expires: new Date(0) });
  response.cookies.set("__Secure-next-auth.session-token", "", { expires: new Date(0) });

  return response;
}