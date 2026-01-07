"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-950 text-white font-sans overflow-hidden">
      
      {/* Pastikan komponen Sidebar Anda memiliki logic CSS:
         - Mobile: fixed z-50 h-full (agar menumpuk di atas konten)
         - Desktop: fixed w-64 h-full
      */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* OVERLAY GELAP SAAT SIDEBAR BUKA DI MOBILE */}
      {/* Tambahkan ini agar user bisa klik di luar sidebar untuk menutupnya */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* KONTEN UTAMA */}
      {/* PERBAIKAN: Tambahkan 'min-w-0' agar tabel di dalam children tidak merusak layout flex */}
      <main className="flex-1 flex flex-col md:ml-64 transition-all duration-300 min-w-0 h-screen overflow-y-auto">
        
        {/* HEADER MOBILE */}
        <div className="md:hidden sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-4 flex items-center justify-between shadow-md">
          <div className="font-bold text-blue-500 text-lg">Bengkel XYZ</div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-300 hover:text-white bg-gray-800 rounded-lg border border-gray-700 active:scale-95 transition"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* AREA KONTEN PAGE */}
        <div className="flex-1 w-full p-0">
            {children}
        </div>
      </main>
    </div>
  );
}