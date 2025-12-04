"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { name: "Dashboard", href: "/dashboard", icon: "🏠" },
  { name: "Supplier", href: "/dashboard/supplier", icon: "🚚" },
  { name: "Stok Barang", href: "/dashboard/stok", icon: "📦" },
  { name: "Transaksi", href: "/dashboard/transaksi", icon: "💰" },
  { name: "Pengguna", href: "/dashboard/pengguna", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 border-r border-gray-800 hidden md:block">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-500">Bengkel XYZ</h1>
        <p className="text-xs text-gray-500 mt-1">Sistem Inventaris v1.0</p>
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {menus.map((menu) => {
          const isActive = pathname === menu.href;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="mr-3">{menu.icon}</span>
              <span className="font-medium">{menu.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <button className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-gray-800 rounded transition">
          <span>🚪</span>
          <span className="ml-3 font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
