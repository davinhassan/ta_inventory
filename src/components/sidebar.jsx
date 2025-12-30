"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // 1. Pakai Hook NextAuth
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  LogOut,
  ArrowLeftRight,
  Truck,
} from "lucide-react";

// 2. KONFIGURASI MENU (UPDATE: Tambahkan "MANAJER")
const MENU_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["PEMILIK", "ADMIN", "STAFF", "MANAJER"],
  },
  {
    name: "Stok Barang",
    href: "/dashboard/stok",
    icon: Package,
    roles: ["PEMILIK", "ADMIN", "STAFF", "MANAJER"],
  },
  {
    name: "Transaksi",
    href: "/dashboard/transaksi",
    icon: ArrowLeftRight,
    roles: ["ADMIN", "STAFF", "MANAJER"],
  },
  {
    name: "Supplier",
    href: "/dashboard/supplier",
    icon: Truck,
    roles: ["PEMILIK", "ADMIN", "STAFF", "MANAJER"],
  },
  {
    name: "Laporan",
    href: "/dashboard/laporan",
    icon: FileText,
    roles: ["MANAJER"], // Staff biasanya gaboleh lihat laporan
  },
  {
    name: "Kelola Pengguna",
    href: "/dashboard/pengguna",
    icon: Users,
    roles: ["ADMIN", "MANAJER"], // Admin/Staff gaboleh edit user
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession(); // 3. Ambil Role dari Session (Bukan LocalStorage)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ambil role dari session, kalau tidak ada anggap string kosong
  const userRole = session?.user?.role || "";

  // 4. FUNGSI LOGOUT RESMI NEXTAUTH
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" }); // Otomatis hapus cookie & redirect
  };

  if (!isMounted) return null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col border-r border-gray-800 z-50">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-blue-500">BENGKEL XYZ</h1>
        <div className="mt-2">
          <span className="text-xs text-gray-400">Login sebagai:</span>
          <div
            className={`text-xs font-bold px-2 py-1 rounded w-fit mt-1
            ${
              userRole === "PEMILIK"
                ? "bg-purple-600"
                : userRole === "ADMIN"
                ? "bg-blue-600"
                : userRole === "MANAJER"
                ? "bg-orange-600" // Warna Khusus Manajer
                : userRole === "STAFF"
                ? "bg-green-600"
                : "bg-gray-600"
            }`}
          >
            {userRole || "MEMUAT..."}
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          // Cek apakah role user ada di daftar izin menu ini
          if (!item.roles.includes(userRole)) return null;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tombol Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-red-400 hover:text-white px-4 py-2 hover:bg-red-900/30 rounded transition-colors"
        >
          <LogOut size={18} />
          <span className="font-bold">Logout</span>
        </button>
      </div>
    </aside>
  );
}
