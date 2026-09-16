import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Storage client, used server-side only.
 *
 * Uses the **service role** key, which bypasses row-level security. That is
 * appropriate here because every call already sits behind our own
 * authorization (admin actions call `requireAdmin`, and reads go through the
 * `/media/[id]` route). This key must never reach the browser — it is read
 * from a non-`NEXT_PUBLIC_` variable so it cannot be bundled by mistake.
 *
 * Created lazily for the same reason as the Prisma client: `next build`
 * imports route modules without deployment env vars present.
 */

export const MEDIA_BUCKET = process.env.SUPABASE_BUCKET ?? "media";

let cached: SupabaseClient | null = null;

export function getStorage() {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set — see .env.example.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
