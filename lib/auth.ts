import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Resolve the signed-in admin from the session cookie.
 *
 * Every admin Server Action must call this. `proxy.ts` gates navigation, but
 * Server Actions are reachable by direct POST and bypass it entirely.
 */
export async function getCurrentAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const adminId = verifySessionToken(token);
  if (!adminId) return null;

  return prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true },
  });
}

/** Throws unless a valid admin session is present. */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Non autorisé.");
  return admin;
}
