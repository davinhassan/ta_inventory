// src/app/api/transaksi/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
// Import fungsi email yang baru dibuat
import { kirimNotifikasiStok } from "@/lib/mail";

// GET: Ambil Riwayat Transaksi
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const transaksi = await prisma.transaksi.findMany({
      include: { 
        user: { select: { nama: true } }, 
        detail: { include: { sukuCadang: true } } 
      },
      orderBy: { tanggal: "desc" }
    });
    return NextResponse.json(transaksi);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// POST: Buat Transaksi Kasir + Upload Bukti + Cek Stok + Kirim Email
export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  // 1. Cek Session
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized: Silakan Login Ulang." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    
    // Ambil Data Form
    const total = parseFloat(formData.get("total"));
    const itemsRaw = formData.get("items");
    const items = JSON.parse(itemsRaw || "[]");
    const file = formData.get("buktiFoto");

    // Validasi Item Kosong
    if (!items || items.length === 0) {
        return NextResponse.json({ error: "Keranjang belanja kosong!" }, { status: 400 });
    }

    // --- 2. VALIDASI WAJIB FILE BUKTI ---
    if (!file || typeof file === "string" || file.size === 0) {
        return NextResponse.json({ error: "Bukti Struk/Foto Barang WAJIB diupload!" }, { status: 400 });
    }

    // 3. Proses Upload File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Buat nama file unik: TRX_Timestamp_NamaFileAsli
    const filename = `TRX_${Date.now()}_` + file.name.replaceAll(" ", "_");
    
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true }); 
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // 4. Eksekusi Database (Transaction)
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Simpan Header Transaksi
      const newTransaksi = await tx.transaksi.create({
        data: {
          userId: parseInt(session.user.id),
          total: total,
          status: "LUNAS",
          buktiFoto: `/uploads/${filename}`, 
          detail: {
            create: items.map((item) => ({
              sukuCadangId: parseInt(item.id),
              jumlah: parseInt(item.qty),
              hargaSatuan: parseFloat(item.hargaJual),
              subtotal: parseFloat(item.subtotal),
            })),
          },
        },
      });

      const barangUnderStock = []; // Penampung barang yang stoknya kritis

      // B. Update Stok & Catat Log Per Item
      for (const item of items) {
        const barangId = parseInt(item.id);
        const qty = parseInt(item.qty);

        // Update Stok dan ambil data terbaru (Updated Record)
        const updatedBarang = await tx.sukuCadang.update({
          where: { id: barangId },
          data: { stok: { decrement: qty } },
        });

        // Catat di Laporan Stok (Kartu Stok)
        await tx.transaksiStok.create({
          data: {
            tipe: "KELUAR",
            jumlah: qty,
            keterangan: `Penjualan Kasir #${newTransaksi.id}`,
            sukuCadangId: barangId,
            dilakukanOlehId: parseInt(session.user.id),
            tanggal: new Date(),
          },
        });

        // --- DETEKSI UNDER STOCK ---
        // Jika sisa stok <= minStok, masukkan ke daftar peringatan
        if (updatedBarang.stok <= updatedBarang.minStok) {
            barangUnderStock.push(updatedBarang);
        }
      }

      // Kembalikan objek yang berisi data transaksi dan daftar barang kritis
      return { transaksi: newTransaksi, barangUnderStock };
    });

    // 5. PROSES NOTIFIKASI EMAIL (Di luar transaksi DB agar tidak memblokir response)
    if (result.barangUnderStock.length > 0) {
        
        // Cari User dengan role Petinggi (ADMIN, MANAJER, PEMILIK)
        const paraPetinggi = await prisma.pengguna.findMany({
            where: {
                role: { in: ['ADMIN', 'MANAJER', 'PEMILIK'] }
            },
            select: { email: true }
        });

        // Ambil emailnya saja -> ['bos@gmail.com', 'admin@gmail.com']
        const emailTujuan = paraPetinggi.map(u => u.email);

        if (emailTujuan.length > 0) {
            // Jalankan fungsi kirim email (tanpa await agar client tidak menunggu)
            kirimNotifikasiStok(result.barangUnderStock, emailTujuan)
                .catch(err => console.error("Background Email Error:", err));
        }
    }

    return NextResponse.json(result.transaksi, { status: 201 });

  } catch (error) {
    console.error("Error Transaksi:", error);
    return NextResponse.json({ error: "Gagal memproses transaksi: " + error.message }, { status: 500 });
  }
}