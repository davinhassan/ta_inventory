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
  ArrowUpRight,
  ArrowDownLeft,
  Truck,
  X, // Import icon Close
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["PEMILIK", "ADMIN", "STAFF", "MANAJER"] },
  { name: "Stok Barang", href: "/dashboard/stok", icon: Package, roles: ["PEMILIK", "ADMIN", "STAFF", "MANAJER"] },
  { name: "Barang Masuk", href: "/dashboard/pembelian", icon: ArrowDownLeft, roles: ["PEMILIK", "ADMIN", "STAFF", "MANAJER"] },
  { name: "Barang Keluar", href: "/dashboard/transaksi", icon: ArrowUpRight, roles: ["ADMIN", "STAFF", "MANAJER"] },
  { name: "Supplier", href: "/dashboard/supplier", icon: Truck, roles: ["PEMILIK", "ADMIN", "STAFF", "MANAJER"] },
  { name: "Laporan", href: "/dashboard/laporan", icon: FileText, roles: ["MANAJER", "PEMILIK"] },
  { name: "Kelola Pengguna", href: "/dashboard/pengguna", icon: Users, roles: ["ADMIN", "MANAJER", "PEMILIK"] },
];

// 1. Terima props isOpen dan onClose dari Layout
export default function Sidebar({ isOpen, onClose }) {
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
    <>
      {/* 2. OVERLAY GELAP (Hanya muncul di Mobile saat isOpen = true) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* 3. CONTAINER SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-white flex flex-col border-r border-gray-800 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 
      `}>
        
        {/* Header Sidebar */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-blue-500">BENGKEL XYZ</h1>
            <div className="mt-2">
              <span className="text-xs text-gray-400">Login sebagai:</span>
              <div className="text-xs font-bold px-2 py-1 rounded w-fit mt-1 bg-gray-700 uppercase">
                {userRole}
              </div>
            </div>
          </div>
          
          {/* Tombol Close (Hanya di Mobile) */}
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {MENU_ITEMS.map((item) => {
            if (!item.roles.includes(userRole)) return null;
            
            // Logic Active State yang lebih baik (support sub-path)
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose} // 4. Tutup sidebar otomatis saat menu diklik (UX Mobile)
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-2 text-red-400 hover:text-white px-4 py-3 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}