import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

// Local dev uses a SQLite file (DATABASE_URL="file:./dev.db") — zero setup.
// Production points DATABASE_URL at Postgres (Neon) and picks up the pg
// adapter automatically. No code change needed to switch.
function buildAdapter() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (url.startsWith("file:")) {
    return new PrismaBetterSqlite3({ url });
  }
  return new PrismaPg(url);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: buildAdapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
