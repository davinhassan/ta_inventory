"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  LogOut,
  ArrowLeftRight,
  Truck
} from "lucide-react"; 

// Konfigurasi Menu
const MENU_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["PEMILIK", "ADMIN", "STAFF"] },
  { name: "Stok Barang", href: "/dashboard/stok", icon: Package, roles: ["PEMILIK", "ADMIN", "STAFF"] },
  { name: "Transaksi", href: "/dashboard/transaksi", icon: ArrowLeftRight, roles: ["PEMILIK", "ADMIN", "STAFF"] },
  { name: "Supplier", href: "/dashboard/supplier", icon: Truck, roles: ["PEMILIK", "ADMIN", "STAFF"] },
  { name: "Laporan", href: "/dashboard/laporan", icon: FileText, roles: ["PEMILIK", "ADMIN"] },
  { name: "Kelola Pengguna", href: "/dashboard/pengguna", icon: Users, roles: ["PEMILIK"] },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setUserRole(localStorage.getItem("userRole") || "");
  }, []);

  // --- FUNGSI LOGOUT ANTI-GAGAL ---
  const handleLogout = async () => {
    try {
      // 1. Panggil API Server untuk hapus Cookie (Paling Ampuh)
      await fetch("/api/logout", { method: "POST" });
      
      // 2. Hapus LocalStorage
      localStorage.clear();

      // 3. Redirect Paksa ke Login
      window.location.href = "/login";
    } catch (error) {
      console.error("Gagal logout:", error);
      // Fallback jika server error
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  if (!isMounted) return null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col border-r border-gray-800 z-50">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-blue-500">BENGKEL XYZ</h1>
        <div className="mt-2">
          <span className="text-xs text-gray-400">Login sebagai:</span>
          <div className={`text-xs font-bold px-2 py-1 rounded w-fit mt-1
            ${userRole === 'PEMILIK' ? 'bg-purple-600' : 
              userRole === 'ADMIN' ? 'bg-blue-600' : 
              userRole === 'STAFF' ? 'bg-green-600' : 'bg-gray-600'}`}>
            {userRole || "GUEST"}
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          if (!item.roles.includes(userRole)) return null;
          const isActive = pathname === item.href;
          
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