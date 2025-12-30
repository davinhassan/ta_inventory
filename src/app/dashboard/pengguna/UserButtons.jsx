"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react"; // 1. Import Session

export default function UserButtons({ id, role }) {
  const router = useRouter();
  const { data: session } = useSession(); // 2. Ambil data user yang sedang login
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUserRole = session?.user?.role;

  // 3. LOGIKA HIERARKI:
  // Jika saya ADMIN, saya DILARANG mengutak-atik MANAJER atau sesama ADMIN
  const isRestricted =
    currentUserRole === "ADMIN" && (role === "MANAJER" || role === "ADMIN");

  const handleDelete = async () => {
    if (!confirm("Yakin hapus user ini?")) return;
    setIsDeleting(true);

    try {
      // Pastikan route API delete sesuai
      // (Bisa via query param atau dynamic route, di sini saya pakai dynamic route sesuai contohmu)
      const res = await fetch(`/api/pengguna/${id}`, { method: "DELETE" });

      if (res.ok) {
        router.refresh();
      } else {
        const json = await res.json();
        alert(json.error || "Gagal menghapus user");
      }
    } catch (error) {
      alert("Error jaringan / Koneksi database terputus");
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. Jika akses dibatasi, sembunyikan tombol
  if (isRestricted) {
    return (
      <span className="text-xs text-gray-500 italic select-none">
        -- No Access --
      </span>
    );
  }

  return (
    <div className="flex gap-2 justify-center">
      <Link href={`/dashboard/pengguna/edit/${id}`}>
        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
          Edit
        </button>
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-50 transition-colors"
      >
        {isDeleting ? "..." : "Hapus"}
      </button>
    </div>
  );
}
