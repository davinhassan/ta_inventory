"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TransaksiChart({ dataTransaksi }) {
  // 1. Olah data agar cocok untuk grafik
  // Kita akan kelompokkan data berdasarkan TANGGAL

  const processedData = dataTransaksi.reduce((acc, curr) => {
    const date = new Date(curr.tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

    // Cari apakah tanggal ini sudah ada di accumulator
    const existing = acc.find((item) => item.name === date);

    if (existing) {
      if (curr.tipe === "MASUK") existing.masuk += curr.jumlah;
      else existing.keluar += curr.jumlah;
    } else {
      acc.push({
        name: date,
        masuk: curr.tipe === "MASUK" ? curr.jumlah : 0,
        keluar: curr.tipe === "KELUAR" ? curr.jumlah : 0,
      });
    }
    return acc;
  }, []);

  // Balik urutan agar tanggal lama di kiri, baru di kanan (karena data API desc)
  const chartData = processedData.reverse();

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">
        Grafik Pergerakan Stok
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <Bar
              dataKey="masuk"
              name="Barang Masuk"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="keluar"
              name="Barang Keluar"
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
