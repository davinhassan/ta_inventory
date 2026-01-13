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
  // Logic pengolahan data (Tidak berubah)
  const processedData = dataTransaksi.reduce((acc, curr) => {
    const date = new Date(curr.tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

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

  const chartData = processedData.reverse();

  return (
    // UBAH 1: Container menggunakan bg-card dan border-border
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">
        Grafik Pergerakan Stok
      </h3>

      <div className="w-full overflow-x-auto custom-scrollbar pb-2">
        <div className="h-[300px] min-w-[600px] w-full">
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
              {/* UBAH 2: Gunakan CSS Variable untuk warna garis */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)" // Garis grid mengikuti warna border tema
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)" // Teks sumbu X mengikuti warna muted
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="var(--muted-foreground)" // Teks sumbu Y mengikuti warna muted
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              {/* UBAH 3: Tooltip Pop-up yang Dinamis */}
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.3 }} // Highlight bar saat di-hover
                contentStyle={{
                  backgroundColor: "var(--card)", // Background Tooltip
                  borderColor: "var(--border)", // Border Tooltip
                  color: "var(--card-foreground)", // Teks Tooltip
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "var(--card-foreground)" }}
              />

              <Legend wrapperStyle={{ paddingTop: "10px" }} />

              {/* Bar tetap menggunakan warna pasti (Hijau/Merah) karena ini indikator universal */}
              <Bar
                dataKey="masuk"
                name="Barang Masuk"
                fill="#10B981" // Emerald-500
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
              <Bar
                dataKey="keluar"
                name="Barang Keluar"
                fill="#EF4444" // Red-500
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
