"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    // UBAH 1: Hapus 'bg-gray-950 text-white'. Ganti dengan 'bg-background text-foreground'
    <div className="flex min-h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* OVERLAY MOBILE */}
      {/* Catatan: Pastikan di dalam Sidebar.jsx tidak ada overlay ganda. 
          Jika di Sidebar sudah ada overlay, bagian ini bisa dihapus. 
          Jika belum, biarkan saja. */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col md:ml-64 transition-all duration-300 min-w-0 h-screen overflow-y-auto">
        {/* HEADER MOBILE */}
        {/* UBAH 2: Ganti warna background dan border agar support Light Mode */}
        <div className="md:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between shadow-sm">
          {/* Logo Text */}
          <div className="font-bold text-primary text-lg">Bengkel XYZ</div>

          {/* Tombol Menu */}
          {/* UBAH 3: Update styling tombol agar tidak hardcoded gray-800 */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground bg-card hover:bg-secondary rounded-lg border border-border active:scale-95 transition-all"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* AREA KONTEN PAGE */}
        <div className="flex-1 w-full p-0">{children}</div>
      </main>
    </div>
  );
}
