import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// --- KONFIGURASI SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const BUCKET_NAME = "inventory-images";

// Helper: Upload ke Supabase
async function uploadToSupabase(file, filename) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload ke folder 'po'
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(`po/${filename}`, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error("Gagal upload ke Supabase: " + error.message);

  // Ambil URL Publik
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(`po/${filename}`);

  return data.publicUrl;
}

// Helper: Hapus gambar jika database gagal (Rollback)
async function deleteFromSupabase(filename) {
  await supabase.storage.from(BUCKET_NAME).remove([`po/${filename}`]);
}

// --- GET: Ambil Daftar PO dengan Pagination ---
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const [po, totalData] = await prisma.$transaction([
      prisma.purchaseOrder.findMany({
        skip: skip,
        take: limit,
        include: { 
          supplier: true, 
          items: { include: { sukuCadang: true } },
          dibuatOleh: { select: { nama: true } }
        },
        orderBy: { tanggalPesan: "desc" },
      }),
      prisma.purchaseOrder.count()
    ]);

    const totalPage = Math.ceil(totalData / limit);

    return NextResponse.json({
        data: po,
        pagination: { totalData, totalPage, currentPage: page, limit }
    });
  } catch (error) {
    console.error("Error GET PO:", error);
    return NextResponse.json({ error: "Gagal ambil data PO" }, { status: 500 });
  }
}

// --- POST: Buat PO Baru + Upload Supabase ---
export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uploadedFilename = null;

  try {
    const formData = await request.formData();
    const supplierId = parseInt(formData.get("supplierId"));
    const itemsRaw = formData.get("items");
    const items = JSON.parse(itemsRaw || "[]");
    const file = formData.get("buktiFoto");

    // Validasi
    if (!supplierId || isNaN(supplierId)) return NextResponse.json({ error: "Supplier wajib dipilih!" }, { status: 400 });
    if (!items || items.length === 0) return NextResponse.json({ error: "Barang tidak boleh kosong!" }, { status: 400 });
    if (!file || typeof file === "string" || file.size === 0) return NextResponse.json({ error: "Bukti Faktur WAJIB diupload!" }, { status: 400 });

    // 1. Upload ke Supabase
    const cleanFileName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
    uploadedFilename = `PO_${Date.now()}_${cleanFileName}`;
    
    const imageUrl = await uploadToSupabase(file, uploadedFilename);

    // 2. Simpan ke Database
    const newPO = await prisma.$transaction(async (tx) => {
        const noPO = `PO-${Date.now()}`; 
        
        return await tx.purchaseOrder.create({
          data: {
            noPO: noPO,
            status: "PENDING",
            buktiFoto: imageUrl,
            supplierId: supplierId,
            dibuatOlehId: parseInt(session.user.id),
            items: {
              create: items.map((item) => ({
                jumlah: parseInt(item.qty),
                sukuCadangId: parseInt(item.id)
              })),
            },
          },
        });
    });

    return NextResponse.json(newPO, { status: 201 });

  } catch (error) {
    console.error("Gagal buat PO:", error);
    // Rollback: Hapus gambar jika DB gagal
    if (uploadedFilename) await deleteFromSupabase(uploadedFilename).catch(console.error);
    
    return NextResponse.json({ error: "Error Server: " + error.message }, { status: 500 });
  }
}