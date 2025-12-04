import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode("RAHASIA_DAPUR_BENGKEL_XYZ_2025"); // Harus sama dengan API Login

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika user mau masuk ke Dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      // Tidak ada token? Tendang ke Login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Cek keaslian token
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next(); // Silakan lewat
    } catch (error) {
      // Token palsu/expired? Tendang ke Login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. Jika user sudah login tapi mau buka halaman Login
  if (pathname === "/login") {
    if (token) {
      try {
        await jwtVerify(token, SECRET_KEY);
        // Sudah login kok mau login lagi? Langsung ke dashboard aja
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch (error) {
        // Token error, biarkan buka halaman login
      }
    }
  }

  return NextResponse.next();
}

// Tentukan halaman mana saja yang dijaga
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
