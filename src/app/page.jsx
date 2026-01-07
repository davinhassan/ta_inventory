import Link from "next/link";
import { Wrench } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-center">
      
      {/* Animasi Icon */}
      <div className="bg-blue-600/10 p-6 rounded-full mb-6 animate-pulse">
        <Wrench size={64} className="text-blue-500" />
      </div>

      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
        Sistem Bengkel <span className="text-blue-500">XYZ</span>
      </h1>
      
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-8">
        Kelola stok, transaksi, supplier, dan laporan bengkel Anda dalam satu aplikasi yang terintegrasi, aman, dan mudah digunakan.
      </p>

      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105 shadow-lg shadow-blue-900/20"
        >
          Masuk ke Dashboard
        </Link>
      </div>

      <footer className="absolute bottom-6 text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Bengkel XYZ. All rights reserved.
      </footer>
    </div>
  );
}