import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
  datasource: {
    // URL used by Prisma CLI for migrations / db push (Session/Direct)
    url: process.env.DIRECT_URL! + "?pgbouncer=true",
  },
  migrations: {
    seed: 'node prisma/seed.js',
  },
});
