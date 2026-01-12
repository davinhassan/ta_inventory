import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. GET: AMBIL DATA DENGAN PAGINATION & SEARCH
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ambil parameter dari URL
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  
  // Hitung offset (berapa data yang harus dilewati)
  const skip = (page - 1) * limit;

  try {
    // Buat kondisi pencarian (Case Insensitive untuk Postgres)
    const whereCondition = search ? {
      OR: [
        { namaBarang: { contains: search, mode: "insensitive" } },
        { kodeBarang: { contains: search, mode: "insensitive" } }
      ]
    } : {};

    // Jalankan Transaction: Ambil Data + Hitung Total secara bersamaan
    const [sukuCadang, totalData] = await prisma.$transaction([
      prisma.sukuCadang.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        include: { 
            supplier: {
                select: { namaSupplier: true } // Optimasi: Ambil namanya saja
            } 
        },
        orderBy: { namaBarang: 'asc' }
      }),
      prisma.sukuCadang.count({ where: whereCondition }),
    ]);

    // Return format JSON standar untuk pagination
    return NextResponse.json({
      data: sukuCadang,
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit
      }
    });

  } catch (error) {
    console.error("Error GET Stok:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 2. POST: TAMBAH BARANG (Tidak berubah, tetap sama)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "STAFF") {
    return NextResponse.json({ error: "Akses Ditolak" }, { status: 403 });
  }

  try {
    const data = await request.json();

    const newSukuCadang = await prisma.sukuCadang.create({
      data: {
        kodeBarang: data.kodeBarang,
        namaBarang: data.namaBarang,
        hargaBeli: parseFloat(data.hargaBeli),
        hargaJual: data.hargaJual ? parseFloat(data.hargaJual) : 0,
        stok: 0,
        maxStok: data.maxStok ? parseInt(data.maxStok) : 50,
        supplier: {
          connect: { id: parseInt(data.supplierId) },
        },
      },
    });

    return NextResponse.json(newSukuCadang, { status: 201 });
  } catch (error) {
    console.error("Gagal tambah:", error);
    // Handle error unik kode barang
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "Kode Barang sudah digunakan!" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menambah data" }, { status: 500 });
  }
}