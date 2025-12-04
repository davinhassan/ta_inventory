"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserButtons({ id }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Yakin hapus user ini?")) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/pengguna/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus user");
      }
    } catch (error) {
      alert("Error jaringan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      <Link href={`/dashboard/pengguna/edit/${id}`}>
        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-bold">
          Edit
        </button>
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-50"
      >
        {isDeleting ? "..." : "Hapus"}
      </button>
    </div>
  );
}
