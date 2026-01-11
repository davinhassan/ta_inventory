// src/app/api/transaksi/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kirimNotifikasiStok } from "@/lib/mail";
import { createClient } from "@supabase/supabase-js";

// --- KONFIGURASI SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
);

const BUCKET_NAME = "inventory-images";

// Helper: Upload
async function uploadToSupabase(file, filename) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(`transaksi/${filename}`, buffer, {
      contentType: file.type,
      upsert: false,
    });
  if (error) throw new Error("Gagal upload ke Supabase: " + error.message);
  
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`transaksi/${filename}`);
  return data.publicUrl;
}

// Helper: Rollback (Hapus) File
async function deleteFromSupabase(filename) {
  await supabase.storage.from(BUCKET_NAME).remove([`transaksi/${filename}`]);
}

// --- GET: Pagination Tetap Sama ---
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const [transaksi, totalData] = await prisma.$transaction([
      prisma.transaksi.findMany({
        skip: skip,
        take: limit,
        include: {
          user: { select: { nama: true } },
          detail: { include: { sukuCadang: true } },
        },
        orderBy: { tanggal: "desc" },
      }),
      prisma.transaksi.count(),
    ]);

    return NextResponse.json({
      data: transaksi,
      pagination: { totalData, totalPage: Math.ceil(totalData / limit), currentPage: page, limit },
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// --- POST: Transaksi Aman (Server-Side Calculation) ---
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uploadedFilename = null;

  try {
    const formData = await request.formData();
    // Kita TIDAK LAGI mempercayai total dari formData mentah-mentah untuk keamanan
    // const total = parseFloat(formData.get("total")); <-- HAPUS/ABAIKAN INI
    
    const itemsRaw = formData.get("items");
    const itemsInput = JSON.parse(itemsRaw || "[]");
    const file = formData.get("buktiFoto");

    // 1. Validasi Input Dasar
    if (!itemsInput || itemsInput.length === 0) {
      return NextResponse.json({ error: "Keranjang belanja kosong!" }, { status: 400 });
    }
    if (!file || typeof file === "string" || file.size === 0) {
      return NextResponse.json({ error: "Bukti foto wajib diupload!" }, { status: 400 });
    }

    // 2. Upload Gambar Dulu
    const cleanFileName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
    uploadedFilename = `TRX_${Date.now()}_${cleanFileName}`;
    const imageUrl = await uploadToSupabase(file, uploadedFilename);

    // 3. DATABASE TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      
      // --- A. LOGIKA PENJUMLAHAN (SERVER SIDE CALCULATION) ---
      // Ambil ID barang dari input
      const itemIds = itemsInput.map(item => parseInt(item.id));
      
      // Ambil data barang ASLI dari database (termasuk harga dan stok terkini)
      const dbItems = await tx.sukuCadang.findMany({
        where: { id: { in: itemIds } }
      });

      // Siapkan array untuk detail transaksi yang valid
      const detailTransaksiData = [];
      let grandTotal = 0;
      const barangUnderStock = [];

      // Loop input user, cocokkan dengan data DB
      for (const inputItem of itemsInput) {
        const dbItem = dbItems.find(i => i.id === parseInt(inputItem.id));
        
        if (!dbItem) {
          throw new Error(`Barang dengan ID ${inputItem.id} tidak ditemukan.`);
        }

        const qty = parseInt(inputItem.qty);
        if (qty <= 0) throw new Error(`Jumlah barang ${dbItem.namaBarang} tidak valid.`);

        // Cek Stok (Mencegah Race Condition di level logika)
        if (dbItem.stok < qty) {
           throw new Error(`Stok "${dbItem.namaBarang}" tidak cukup. (Sisa: ${dbItem.stok}, Diminta: ${qty})`);
        }

        // HITUNG ULANG: Gunakan harga dari DB, bukan dari frontend
        // Konversi Decimal ke Number untuk perhitungan JS, lalu nanti Prisma handle balik ke Decimal
        const hargaSatuan = Number(dbItem.hargaJual); 
        const subtotal = hargaSatuan * qty;
        
        grandTotal += subtotal;

        // Masukkan ke array persiapan
        detailTransaksiData.push({
          sukuCadangId: dbItem.id,
          jumlah: qty,
          hargaSatuan: hargaSatuan,
          subtotal: subtotal
        });

        // --- B. KURANGI STOK (ATOMIC UPDATE) ---
        // Gunakan updateMany untuk memastikan stok dikurangi secara aman di DB
        await tx.sukuCadang.updateMany({
           where: { id: dbItem.id, stok: { gte: qty } },
           data: { stok: { decrement: qty } }
        });

        // Cek apakah setelah dikurangi jadi sekarat?
        const updatedStok = dbItem.stok - qty; // Estimasi sisa stok
        if (updatedStok <= dbItem.minStok) {
           barangUnderStock.push({ ...dbItem, stok: updatedStok });
        }
      }

      // --- C. SIMPAN TRANSAKSI & DETAIL ---
      // Simpan Header dengan Total yang sudah dihitung server
      const newTransaksi = await tx.transaksi.create({
        data: {
          userId: parseInt(session.user.id),
          total: grandTotal, // HASIL PERHITUNGAN SERVER
          status: "LUNAS",
          buktiFoto: imageUrl,
          detail: {
            create: detailTransaksiData // DETAIL YANG SUDAH DIVALIDASI
          },
        },
      });

      // --- D. CATAT LOG (KARTU STOK) ---
      // Kita buat log setelah transaksi header jadi, biar punya ID transaksi
      for (const det of detailTransaksiData) {
        await tx.transaksiStok.create({
          data: {
            tipe: "KELUAR",
            jumlah: det.jumlah,
            keterangan: `Penjualan Kasir #${newTransaksi.id}`,
            sukuCadangId: det.sukuCadangId,
            dilakukanOlehId: parseInt(session.user.id),
            tanggal: new Date(),
          },
        });
      }

      return { transaksi: newTransaksi, barangUnderStock };
    });

    // 4. Kirim Email (Background)
    if (result.barangUnderStock.length > 0) {
      const users = await prisma.pengguna.findMany({
        where: { role: { in: ["ADMIN", "MANAJER", "PEMILIK"] } },
        select: { email: true },
      });
      const emails = users.map(u => u.email);
      if (emails.length) kirimNotifikasiStok(result.barangUnderStock, emails).catch(console.error);
    }

    return NextResponse.json(result.transaksi, { status: 201 });

  } catch (error) {
    console.error("Error Transaksi:", error);
    // Rollback Gambar jika DB Gagal
    if (uploadedFilename) await deleteFromSupabase(uploadedFilename).catch(console.error);
    
    return NextResponse.json({ 
      error: error.message || "Terjadi kesalahan server" 
    }, { status: 500 }); // Gunakan 500 atau 400 tergantung jenis error
  }
}