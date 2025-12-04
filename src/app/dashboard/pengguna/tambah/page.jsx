"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TambahUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    role: "STAFF",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("User berhasil ditambahkan!");
        router.push("/dashboard/pengguna");
        router.refresh();
      } else {
        const err = await res.json();
        alert("Gagal: " + err.error);
      }
    } catch (error) {
      alert("Error sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-white">
          Tambah Pengguna Baru
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1 text-sm">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Email</label>
            <input
              type="email"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Password</label>
            <input
              type="password"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm">
              Role / Jabatan
            </label>
            <select
              className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              value={formData.role}
            >
              <option value="STAFF">STAFF</option>
              <option value="MANAJER">MANAJER</option>
              <option value="PEMILIK">PEMILIK</option>
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700"
            >
              {loading ? "Menyimpan..." : "Simpan User"}
            </button>
            <Link href="/dashboard/pengguna">
              <button
                type="button"
                className="bg-gray-600 text-white font-bold py-2 px-6 rounded"
              >
                Batal
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
