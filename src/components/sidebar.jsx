"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  LogOut,
  ArrowUpRight,   // Ikon Barang Keluar
  ArrowDownLeft,  // Ikon Barang Masuk
  Truck,
} from "lucide-react";

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
  // --- UBAH NAMA JADI BARANG MASUK ---
  {
    name: "Barang Masuk", 
    href: "/dashboard/pembelian", 
    icon: ArrowDownLeft,
    roles: ["PEMILIK", "ADMIN", "STAFF", "MANAJER"],
  },
  // --- UBAH NAMA JADI BARANG KELUAR ---
  {
    name: "Barang Keluar", 
    href: "/dashboard/transaksi", 
    icon: ArrowUpRight,
    roles: ["ADMIN", "STAFF", "MANAJER"],
  },
  {
    name: "Supplier",
    href: "/dashboard/supplier",
    icon: Truck,
    roles: ["PEMILIK", "ADMIN", "STAFF", "MANAJER"],
  },
  // --- PERBAIKAN LINK LAPORAN (Hapus /stok) ---
  {
    name: "Laporan",
    href: "/dashboard/laporan", // <--- Arahkan ke dashboard/laporan/page.jsx
    icon: FileText,
    roles: ["MANAJER",], 
  },
  {
    name: "Kelola Pengguna",
    href: "/dashboard/pengguna",
    icon: Users,
    roles: ["ADMIN", "MANAJER", "PEMILIK"], 
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession(); 
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const userRole = session?.user?.role || "";

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" }); 
  };

  if (!isMounted) return null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col border-r border-gray-800 z-50">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-blue-500">BENGKEL XYZ</h1>
        <div className="mt-2">
          <span className="text-xs text-gray-400">Login sebagai:</span>
          <div className={`text-xs font-bold px-2 py-1 rounded w-fit mt-1 bg-gray-700 uppercase`}>
            {userRole}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          if (!item.roles.includes(userRole)) return null;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:text-white px-4 py-2 hover:bg-red-900/30 rounded transition-colors">
          <LogOut size={18} />
          <span className="font-bold">Logout</span>
        </button>
      </div>
    </aside>
  );
}