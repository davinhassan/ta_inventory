import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Gunakan helper resmi NextAuth

export async function middleware(req) {
  // 1. Ambil token sesi dari NextAuth (Otomatis handle dekripsi & verifikasi)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET, // Wajib sama dengan yang di .env
  });

  const { pathname } = req.nextUrl;

  // 2. PROTEKSI DASHBOARD
  // Jika mau masuk dashboard TAPI tidak punya token -> Tendang ke Login
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. PROTEKSI HALAMAN LOGIN
  // Jika mau masuk halaman Login TAPI sudah punya token -> Lempar ke Dashboard
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Konfigurasi matcher tetap sama
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
