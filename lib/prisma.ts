import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/app/generated/prisma/client";

/**
 * Prisma 7 connects through a driver adapter rather than a bundled engine, so
 * the MySQL/MariaDB adapter is constructed here from DATABASE_URL.
 *
 * The client is cached on `globalThis` so `next dev`'s hot reload doesn't open a
 * new connection pool on every recompile.
 */

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaMariaDb(connectionString),
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
