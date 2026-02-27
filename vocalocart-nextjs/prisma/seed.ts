import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, OrderStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Categories ─────────────────────────────────────────────────────────────
  const figures = await prisma.category.upsert({
    where: { name: 'Figures' },
    update: {},
    create: { name: 'Figures', description: 'Vocaloid character figures and statues' },
  })

  const music = await prisma.category.upsert({
    where: { name: 'Music' },
    update: {},
    create: { name: 'Music', description: 'CDs, vinyl, and digital albums' },
  })

  const apparel = await prisma.category.upsert({
    where: { name: 'Apparel' },
    update: {},
    create: { name: 'Apparel', description: 'T-shirts, hoodies, and accessories' },
  })

  console.log('✅ Categories created')

  // ─── Products ────────────────────────────────────────────────────────────────
  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Hatsune Miku 1/7 Scale Figure',
        description: 'High-quality 1/7 scale figure of Hatsune Miku in her classic outfit. Approximately 24cm tall.',
        price: 12800,
        stock: 15,
        imageUrl: null,
        categoryId: figures.id,
      },
      {
        name: 'Kagamine Rin & Len Twin Figure Set',
        description: 'Collector\'s set featuring both Kagamine Rin and Len. Limited edition.',
        price: 18500,
        stock: 8,
        imageUrl: null,
        categoryId: figures.id,
      },
      {
        name: 'Megurine Luka Nendoroid',
        description: 'Fully poseable Nendoroid figure of Megurine Luka with multiple face plates and accessories.',
        price: 6800,
        stock: 22,
        imageUrl: null,
        categoryId: figures.id,
      },
      {
        name: 'Hatsune Miku — World is Mine (CD)',
        description: 'Original soundtrack featuring World is Mine and other iconic Miku songs.',
        price: 2500,
        stock: 50,
        imageUrl: null,
        categoryId: music.id,
      },
      {
        name: 'Vocaloid Best Collection Vol.3 (Vinyl)',
        description: '180g vinyl pressing of the best Vocaloid tracks from 2020–2023.',
        price: 4800,
        stock: 12,
        imageUrl: null,
        categoryId: music.id,
      },
      {
        name: 'Hatsune Miku Hoodie — Teal',
        description: 'Premium cotton-blend hoodie with embroidered Miku logo. Available in S–XXL.',
        price: 5900,
        stock: 30,
        imageUrl: null,
        categoryId: apparel.id,
      },
    ],
  })

  console.log('✅ Products created')

  // ─── Users ───────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12)
  const userPassword = await bcrypt.hash('user123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vocalocart.com' },
    update: {},
    create: {
      email: 'admin@vocalocart.com',
      password: adminPassword,
      name: 'Admin',
      isAdmin: true,
    },
  })

  const testUser = await prisma.user.upsert({
    where: { email: 'test@vocalocart.com' },
    update: {},
    create: {
      email: 'test@vocalocart.com',
      password: userPassword,
      name: 'Test User',
      phone: '090-1234-5678',
      isAdmin: false,
    },
  })

  console.log('✅ Users created')
  console.log(`   admin@vocalocart.com / admin123`)
  console.log(`   test@vocalocart.com  / user123`)

  // ─── Address for test user ───────────────────────────────────────────────────
  await prisma.address.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: testUser.id,
      recipientName: 'Test User',
      line1: '1-2-3 Shibuya',
      line2: 'Apt 456',
      city: 'Tokyo',
      state: 'Tokyo',
      postalCode: '150-0002',
      country: 'Japan',
      phone: '090-1234-5678',
      isDefault: true,
    },
  })

  console.log('✅ Address created')

  // ─── Sample completed order ──────────────────────────────────────────────────
  const products = await prisma.product.findMany({ take: 2 })

  await prisma.order.create({
    data: {
      userId: testUser.id,
      status: OrderStatus.DELIVERED,
      totalAmount: products[0].price + products[1].price,
      shipRecipientName: 'Test User',
      shipLine1: '1-2-3 Shibuya',
      shipLine2: 'Apt 456',
      shipCity: 'Tokyo',
      shipState: 'Tokyo',
      shipPostalCode: '150-0002',
      shipCountry: 'Japan',
      shipPhone: '090-1234-5678',
      orderItems: {
        create: [
          { productId: products[0].id, quantity: 1, price: products[0].price },
          { productId: products[1].id, quantity: 1, price: products[1].price },
        ],
      },
    },
  })

  console.log('✅ Sample order created')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
