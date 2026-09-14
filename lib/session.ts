import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal stateless session: a signed `id.expiry` payload stored in an httpOnly
 * cookie. Verification is pure Node crypto so it also runs inside `proxy.ts`.
 */

export const SESSION_COOKIE = "ortho_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/**
 * Throws only where a session is being *created* — signing in without a secret
 * is a misconfiguration the operator must fix, and failing loudly is right.
 */
function requireSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to the environment — see .env.example.",
    );
  }
  return value;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createSessionToken(adminId: string) {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${adminId}.${expiresAt}`;
  return `${payload}.${sign(payload, requireSecret())}`;
}

/** Returns the admin id when the token is well-formed, unexpired and authentic. */
export function verifySessionToken(token: string | undefined) {
  if (!token) return null;

  // Verification runs in `proxy.ts` on every /admin/* request. A missing secret
  // must fail *closed* (deny access) rather than throw — otherwise a
  // misconfigured deployment returns 500 on the login page instead of simply
  // refusing the session.
  const key = process.env.SESSION_SECRET;
  if (!key) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [adminId, expiresAt, signature] = parts;
  const expected = sign(`${adminId}.${expiresAt}`, key);

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
