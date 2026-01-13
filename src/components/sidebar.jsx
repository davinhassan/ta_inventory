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
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

/* ... (MENU_ITEMS tetap sama, tidak perlu diubah) ... */
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
    name: "Barang Masuk",
    href: "/dashboard/pembelian",
    icon: ArrowDownLeft,
    roles: ["PEMILIK", "ADMIN", "STAFF", "MANAJER"],
  },
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
  {
    name: "Laporan",
    href: "/dashboard/laporan",
    icon: FileText,
    roles: ["MANAJER", "PEMILIK"],
  },
  {
    name: "Kelola Pengguna",
    href: "/dashboard/pengguna",
    icon: Users,
    roles: ["ADMIN", "MANAJER", "PEMILIK"],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userRole = session?.user?.role || "";
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  if (!isMounted) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* PERBAIKAN: Gunakan bg-card dan border-border agar sinkron dengan tema */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-screen w-64 
        bg-card text-card-foreground border-r border-border
        flex flex-col 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 shadow-xl
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-500">
              BENGKEL XYZ
            </h1>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground opacity-70">
                Login sebagai:
              </span>
              <div className="text-xs font-bold px-2 py-1 rounded w-fit mt-1 bg-gray-100 dark:bg-gray-800 uppercase">
                {userRole}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            if (!item.roles.includes(userRole)) return null;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : ""} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between px-4 py-2 mb-2 rounded-lg border border-border bg-gray-50 dark:bg-gray-800/50">
            <span className="text-sm font-medium opacity-70">Tampilan</span>
            <ThemeToggle />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-3 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
