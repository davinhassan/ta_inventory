-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STAFF', 'ADMIN', 'MANAJER', 'PEMILIK');

-- CreateEnum
CREATE TYPE "StatusPO" AS ENUM ('PENDING', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "TipeTransaksi" AS ENUM ('MASUK', 'KELUAR');

-- CreateTable
CREATE TABLE "Pengguna" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',

    CONSTRAINT "Pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "namaSupplier" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SukuCadang" (
    "id" SERIAL NOT NULL,
    "kodeBarang" TEXT NOT NULL,
    "namaBarang" TEXT NOT NULL,
    "stok" INTEGER NOT NULL,
    "minStok" INTEGER NOT NULL DEFAULT 5,
    "maxStok" INTEGER NOT NULL DEFAULT 50,
    "hargaBeli" DECIMAL(15,2) NOT NULL,
    "hargaJual" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "supplierId" INTEGER,

    CONSTRAINT "SukuCadang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" SERIAL NOT NULL,
    "noPO" TEXT NOT NULL,
    "tanggalPesan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusPO" NOT NULL DEFAULT 'PENDING',
    "buktiFoto" TEXT,
    "supplierId" INTEGER NOT NULL,
    "dibuatOlehId" INTEGER NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailPO" (
    "id" SERIAL NOT NULL,
    "purchaseOrderId" INTEGER NOT NULL,
    "sukuCadangId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,

    CONSTRAINT "DetailPO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" SERIAL NOT NULL,
    "total" DECIMAL(15,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LUNAS',
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buktiFoto" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailTransaksi" (
    "id" SERIAL NOT NULL,
    "transaksiId" INTEGER NOT NULL,
    "sukuCadangId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "hargaSatuan" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "DetailTransaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiStok" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipe" "TipeTransaksi" NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "keterangan" TEXT,
    "sukuCadangId" INTEGER NOT NULL,
    "dilakukanOlehId" INTEGER NOT NULL,

    CONSTRAINT "TransaksiStok_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_email_key" ON "Pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_telepon_key" ON "Supplier"("telepon");

-- CreateIndex
CREATE UNIQUE INDEX "SukuCadang_kodeBarang_key" ON "SukuCadang"("kodeBarang");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_noPO_key" ON "PurchaseOrder"("noPO");

-- AddForeignKey
ALTER TABLE "SukuCadang" ADD CONSTRAINT "SukuCadang_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_dibuatOlehId_fkey" FOREIGN KEY ("dibuatOlehId") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPO" ADD CONSTRAINT "DetailPO_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPO" ADD CONSTRAINT "DetailPO_sukuCadangId_fkey" FOREIGN KEY ("sukuCadangId") REFERENCES "SukuCadang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksi" ADD CONSTRAINT "DetailTransaksi_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksi" ADD CONSTRAINT "DetailTransaksi_sukuCadangId_fkey" FOREIGN KEY ("sukuCadangId") REFERENCES "SukuCadang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiStok" ADD CONSTRAINT "TransaksiStok_sukuCadangId_fkey" FOREIGN KEY ("sukuCadangId") REFERENCES "SukuCadang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiStok" ADD CONSTRAINT "TransaksiStok_dilakukanOlehId_fkey" FOREIGN KEY ("dilakukanOlehId") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
