"use client"; // Ini wajib agar tombol bisa diklik

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SupplierButtons({ id }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Konfirmasi dulu sebelum hapus
    if (!confirm("Apakah Anda yakin ingin menghapus supplier ini?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/supplier/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Supplier berhasil dihapus");
        router.refresh(); // Refresh halaman agar data hilang dari tabel
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal menghapus");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2">
      {/* Tombol Edit: Link ke halaman edit */}
      <Link href={`/dashboard/supplier/edit/${id}`}>
        <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs transition">
          Edit
        </button>
      </Link>

      {/* Tombol Hapus: Menjalankan fungsi handleDelete */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs transition disabled:opacity-50"
      >
        {isDeleting ? "..." : "Hapus"}
      </button>
    </div>
  );
}
