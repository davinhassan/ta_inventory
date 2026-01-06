import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Pastikan path import ini benar sesuai projectmu
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET: Ambil Daftar PO
export async function GET() {
  try {
    const po = await prisma.purchaseOrder.findMany({
      include: { 
        supplier: true, 
        items: { include: { sukuCadang: true } },
        dibuatOleh: { select: { nama: true } }
      },
      orderBy: { tanggalPesan: "desc" },
    });
    return NextResponse.json(po);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data PO" }, { status: 500 });
  }
}

// POST: Buat PO Baru (WAJIB FOTO)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  // 1. Cek Session
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized: Silakan Login Ulang." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    
    // Ambil Data Form
    const supplierId = parseInt(formData.get("supplierId"));
    const itemsRaw = formData.get("items");
    const items = JSON.parse(itemsRaw || "[]");
    const file = formData.get("buktiFoto");

    // 2. Validasi Input Data
    if (!supplierId || isNaN(supplierId)) {
        return NextResponse.json({ error: "Supplier wajib dipilih!" }, { status: 400 });
    }
    if (!items || items.length === 0) {
        return NextResponse.json({ error: "Barang tidak boleh kosong!" }, { status: 400 });
    }

    // --- 3. VALIDASI WAJIB FILE FAKTUR/INVOICE ---
    if (!file || typeof file === "string" || file.size === 0) {
        return NextResponse.json({ error: "Bukti Faktur/Invoice WAJIB diupload!" }, { status: 400 });
    }
    // ----------------------------------------------

    // 4. Proses Upload File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Buat nama file unik: PO_Timestamp_NamaFileAsli
    const filename = `PO_${Date.now()}_` + file.name.replaceAll(" ", "_");
    
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true }); 
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // 5. Simpan ke Database
    const noPO = `PO-${Date.now()}`; 
    
    const newPO = await prisma.purchaseOrder.create({
      data: {
        noPO: noPO,
        status: "PENDING",
        buktiFoto: `/uploads/${filename}`, // Path file yang baru diupload
        
        supplier: {
            connect: { id: supplierId } 
        },
        dibuatOleh: {
            connect: { id: parseInt(session.user.id) }
        },
        items: {
          create: items.map((item) => ({
            jumlah: parseInt(item.qty),
            sukuCadang: {
                connect: { id: parseInt(item.id) }
            }
          })),
        },
      },
    });

    return NextResponse.json(newPO, { status: 201 });

  } catch (error) {
    console.error("Gagal buat PO:", error);
    return NextResponse.json({ error: "Error Server: " + error.message }, { status: 500 });
  }
}