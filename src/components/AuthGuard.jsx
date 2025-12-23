"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, allowedRoles }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek apakah ada data role tersimpan?
    const userRole = localStorage.getItem("userRole");

    if (!userRole) {
      // Jika tidak ada role (belum login), tendang ke login
      router.push("/login");
      return;
    }

    // 2. Cek apakah role user ada di daftar "allowedRoles"?
    if (allowedRoles.includes(userRole)) {
      setAuthorized(true); // IZINKAN
    } else {
      // DILARANG
      alert(`Akses Ditolak! Role '${userRole}' tidak diizinkan masuk sini.`);
      router.push("/dashboard"); // Kembalikan ke dashboard utama
    }
    
    setLoading(false);
  }, [allowedRoles, router]);

  // Tampilkan layar putih/loading saat pengecekan berlangsung
  if (loading) return <div className="p-10 text-center">Memeriksa Akses...</div>;

  // Jika tidak authorized, jangan render apapun (tunggu redirect)
  if (!authorized) return null;

  // Jika lolos, tampilkan halaman aslinya
  return <>{children}</>;
}