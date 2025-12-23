import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
// 1. Import AuthGuard
import AuthGuard from "@/components/AuthGuard";
import { UserCog, Save, XCircle, User, Mail, Shield, ChevronLeft } from "lucide-react";

export default async function EditPenggunaPage({ params }) {
  // Ambil ID & Data User
  const { id } = await params;
  const userIdInt = parseInt(id);

  const user = await prisma.pengguna.findUnique({
    where: { id: userIdInt },
  });

  // --- KONDISI 1: JIKA USER TIDAK KETEMU ---
  if (!user) {
    return (
      // Hanya PEMILIK yang boleh melihat halaman ini (meskipun error)
      <AuthGuard allowedRoles={["PEMILIK"]}>
        <div className="max-w-lg mx-auto mt-20 p-8 bg-gray-800 border border-red-900/50 rounded-xl text-center shadow-lg">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white font-bold text-2xl mb-2">User Tidak Ditemukan</h2>
          <p className="text-gray-400 mb-6">
            Data pengguna dengan ID <span className="font-mono text-red-400">{id}</span> tidak tersedia.
          </p>
          <Link
            href="/dashboard/pengguna"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold border border-gray-600"
          >
            <ChevronLeft size={20}/> Kembali ke Daftar
          </Link>
        </div>
      </AuthGuard>
    );
  }

  // --- SERVER ACTION UNTUK UPDATE ---
  async function updateUser(formData) {
    "use server";

    const nama = formData.get("nama");
    const email = formData.get("email");
    const role = formData.get("role");

    try {
      await prisma.pengguna.update({
        where: { id: userIdInt },
        data: { nama, email, role },
      });
    } catch (error) {
      console.error("Gagal update pengguna:", error);
      return;
    }
    redirect("/dashboard/pengguna");
  }

  // --- KONDISI 2: TAMPILAN UTAMA FORM EDIT ---
  return (
    // Hanya PEMILIK yang boleh mengakses form edit ini
    <AuthGuard allowedRoles={["PEMILIK"]}>
      
      <div className="max-w-3xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-400 flex items-center gap-2">
          <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
          <span className="text-gray-600">/</span>
          <Link href="/dashboard/pengguna" className="hover:text-blue-400 transition-colors">Pengguna</Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-medium px-2 py-0.5 bg-gray-800 rounded text-xs">Edit ID: {user.id}</span>
        </div>

        {/* Card Form Utama */}
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
          
          {/* Header Card */}
          <div className="px-8 py-6 bg-gray-700/50 border-b border-gray-700 flex items-center gap-4">
            <div className="p-3 bg-blue-900/40 rounded-lg text-blue-400 shadow-sm shadow-blue-900/20 border border-blue-900/50">
              <UserCog size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Edit Pengguna</h2>
              <p className="text-sm text-gray-400 mt-1">
                Perbarui detail informasi dan hak akses sistem.
              </p>
            </div>
          </div>

          {/* Body Form */}
          <form action={updateUser} className="p-8 space-y-6">
            
            {/* Input Group: Nama */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <User size={18} className="text-blue-400"/> Nama Lengkap
              </label>
              <input
                type="text"
                name="nama"
                defaultValue={user.nama}
                required
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Input Group: Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Mail size={18} className="text-blue-400"/> Alamat Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                required
                placeholder="contoh@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Input Group: Role */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Shield size={18} className="text-blue-400"/> Role / Jabatan
              </label>
              <div className="relative">
                <select
                  name="role"
                  defaultValue={user.role}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="PEMILIK">PEMILIK</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STAFF">STAFF</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1">Menentukan tingkat izin akses aplikasi.</p>
            </div>

            {/* Footer: Tombol Aksi */}
            <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-700 mt-8">
              <Link
                href="/dashboard/pengguna"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-700 hover:text-white transition-all"
              >
                <XCircle size={18} />
                Batal
              </Link>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 active:scale-95"
              >
                <Save size={18} />
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>

    </AuthGuard>
  );
}