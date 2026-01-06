const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs') 
const prisma = new PrismaClient()

async function main() {
  const email = 'admin@gmail.com'
  const passwordRaw = '123'
  
  // 1. Enkripsi Password (Salt rounds 10)
  const hashedPassword = await bcrypt.hash(passwordRaw, 10)

  // 2. Buat atau Update User MANAJER
  const user = await prisma.pengguna.upsert({
    where: { email: email },
    update: {}, 
    create: {
      nama: 'Super Manajer',
      email: email,
      password: hashedPassword, 
      role: 'MANAJER', // Sesuai enum di schema.prisma kamu
    },
  })

  console.log(`✅ User Manajer Siap!`)
  console.log(`📧 Email: ${email}`)
  console.log(`🔑 Password: ${passwordRaw}`)

  // 3. Buat Supplier Dummy
  const supplierCheck = await prisma.supplier.findFirst({
    where: { telepon: "08123456789" }
  })

  if (!supplierCheck) {
      await prisma.supplier.create({
        data: {
            namaSupplier: "PT. Gudang Sparepart",
            alamat: "Jl. Industri No 1",
            telepon: "08123456789"
        }
      })
      console.log('✅ Supplier Dummy dibuat!')
  }
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })