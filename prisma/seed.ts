import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

function buildAdapter() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (url.startsWith("file:")) return new PrismaBetterSqlite3({ url });
  return new PrismaPg(url);
}

const prisma = new PrismaClient({ adapter: buildAdapter() });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("ADMIN_EMAIL is not set in .env — cannot seed the admin user.");
  }
  const name = process.env.ADMIN_NAME || null;

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", status: "APPROVED" },
    create: {
      email,
      name,
      role: "ADMIN",
      status: "APPROVED",
      approvedAt: new Date(),
    },
  });

  console.log(`Seeded admin user: ${admin.email} (${admin.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
