import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal stateless session: a signed `id.expiry` payload stored in an httpOnly
 * cookie. Verification is pure Node crypto so it also runs inside `proxy.ts`.
 */

export const SESSION_COOKIE = "ortho_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to .env — see .env.example.",
    );
  }
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(adminId: string) {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${adminId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the admin id when the token is well-formed, unexpired and authentic. */
export function verifySessionToken(token: string | undefined) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [adminId, expiresAt, signature] = parts;
  const expected = sign(`${adminId}.${expiresAt}`);

  // Compare as buffers of equal length to avoid leaking timing information.
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;

  if (!Number.isFinite(Number(expiresAt)) || Number(expiresAt) < Date.now()) {
    return null;
  }

  return adminId;
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
