import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. Import Providers yang sudah dibuat
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bengkel App",
  description: "Sistem Manajemen Stok & Pengguna Bengkel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
      >
        {/* 2. Bungkus {children} dengan Providers agar Session bisa dibaca di seluruh aplikasi */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
