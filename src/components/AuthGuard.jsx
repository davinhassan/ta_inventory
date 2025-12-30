"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children, allowedRoles }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    } else {
      // Cek apakah role user ada di daftar allowedRoles
      // Contoh allowedRoles: ["MANAJER", "ADMIN"]
      if (allowedRoles && !allowedRoles.includes(session.user.role)) {
        alert("Anda tidak memiliki akses ke halaman ini!");
        router.push("/dashboard");
      }
    }
  }, [session, status, router, allowedRoles]);

  if (status === "loading" || !session) {
    return <div className="p-8 text-white">Memuat akses...</div>;
  }

  // Jika lolos pengecekan role, tampilkan konten
  // Pastikan logic ini aman:
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return null; // Jangan render apa-apa kalau dilarang
  }

  return children;
}
