require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── 1. Seed Components (static reference data) ──────────────────────────────
  // Idempotent: clear dependents first, then re-insert
  await prisma.design_Detail.deleteMany();
  await prisma.component.deleteMany();

  const components = await prisma.component.createMany({
    data: [
      { nama_component: "body", tipe: "silhouette" },
      { nama_component: "sleeves", tipe: "silhouette" },
      { nama_component: "necklines", tipe: "silhouette" },
      { nama_component: "pocket", tipe: "silhouette" },
      { nama_component: "primaryColor", tipe: "color" },
      { nama_component: "pattern", tipe: "pattern" },
    ],
  });

  console.log(`✅ Seeded ${components.count} components`);

  // ── 2. Seed Demo User ────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "admin@polatech.id" },
    update: {},
    create: {
      nama: "Admin PolaTech",
      email: "admin@polatech.id",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log(`✅ Demo user ready: ${demoUser.email} / password123`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
