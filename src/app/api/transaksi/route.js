import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Pastikan path import ini benar sesuai projectmu
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

// POST: Buat Transaksi Kasir (WAJIB FOTO)
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
    // ------------------------------------

    // 3. Proses Upload File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Buat nama file unik: TRX_Timestamp_NamaFileAsli
    const filename = `TRX_${Date.now()}_` + file.name.replaceAll(" ", "_");
    
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true }); 
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // 4. Eksekusi Database (Transaction: Simpan Header, Detail, Update Stok, Catat Log)
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Simpan Header Transaksi
      const newTransaksi = await tx.transaksi.create({
        data: {
          userId: parseInt(session.user.id),
          total: total,
          status: "LUNAS",
          buktiFoto: `/uploads/${filename}`, // Path file
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

      // B. Update Stok & Catat Log Per Item
      for (const item of items) {
        const barangId = parseInt(item.id);
        const qty = parseInt(item.qty);

        // Kurangi Stok di Tabel Master Barang
        await tx.sukuCadang.update({
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
      }

      return newTransaksi;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("Error Transaksi:", error);
    return NextResponse.json({ error: "Gagal memproses transaksi: " + error.message }, { status: 500 });
  }
}