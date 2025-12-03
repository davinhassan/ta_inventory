import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white font-sans">
      {/* Sidebar Tetap di Kiri */}
      <Sidebar />

      {/* Konten Utama di Kanan */}
      <main className="flex-1 md:ml-64 transition-all duration-300">
        {/* Header Mobile (Opsional, untuk nanti) */}

        {/* Area Konten Halaman */}
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
