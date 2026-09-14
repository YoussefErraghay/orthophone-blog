import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/app/generated/prisma/client";

/**
 * Prisma 7 connects through a driver adapter rather than a bundled engine, so
 * the MySQL/MariaDB adapter is constructed here from DATABASE_URL.
 *
 * The client is created **lazily**. Next.js imports every route module during
 * its build-time page-data collection pass, so constructing the client at
 * module scope made the build fail wherever DATABASE_URL isn't set — which is
 * the normal case on a CI/deploy builder. Deferring construction to the first
 * query keeps the build working without a database, while runtime behaviour is
 * unchanged for every caller.
 *
 * The instance is cached on `globalThis` so `next dev`'s hot reload reuses one
 * connection pool instead of opening a new one on every recompile.
 */

type Client = PrismaClient;

function createClient(): Client {
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

const globalForPrisma = globalThis as unknown as { prisma?: Client };

function getClient(): Client {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;

  const client = createClient();
  globalForPrisma.prisma = client;
  return client;
}

/**
 * Proxy that forwards to the real client on first use, so `prisma.article.…`
 * reads exactly as before at all call sites.
 */
export const prisma = new Proxy({} as Client, {
  get(_target, property, receiver) {
    const value = Reflect.get(getClient(), property, receiver);
    // Bind methods so `this` stays the real client rather than the proxy.
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
  has(_target, property) {
    return Reflect.has(getClient(), property);
  },
});
