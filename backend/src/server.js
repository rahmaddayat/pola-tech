const app = require("./app");
const { PORT } = require("./config/env");
const prisma = require("./lib/prisma");

async function startServer() {
  // Test database connection before starting
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully.");
  } catch (err) {
    console.error("❌ Failed to connect to database:", err.message);
    console.error("   Make sure your DATABASE_URL in .env is correct.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Pola-Tech API Server`);
    console.log(`   Running on: http://localhost:${PORT}`);
    console.log(`   Health:     http://localhost:${PORT}/api/health`);
    console.log(`   Env:        ${process.env.NODE_ENV || "development"}\n`);
  });
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏹  Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
