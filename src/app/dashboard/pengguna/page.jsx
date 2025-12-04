import Link from "next/link";
import UserButtons from "./UserButtons";

async function getUsers() {
  try {
    const res = await fetch("http://localhost:3000/api/pengguna", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function PagePengguna() {
  const users = await getUsers();
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Manajemen Akun Pengguna
        </h1>
        <Link href="/dashboard/pengguna/tambah">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition">
            + Tambah User Baru
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full bg-gray-800 text-sm text-left text-gray-300">
          <thead className="bg-gray-700 text-xs uppercase text-gray-300">
            <tr>
              <th className="py-3 px-4">Nama Lengkap</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role / Jabatan</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {safeUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  Belum ada user.
                </td>
              </tr>
            ) : (
              safeUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 font-medium text-white">
                    {user.nama}
                  </td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        user.role === "PEMILIK"
                          ? "bg-purple-900 text-purple-200"
                          : user.role === "MANAJER"
                          ? "bg-blue-900 text-blue-200"
                          : "bg-green-900 text-green-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <UserButtons id={user.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
