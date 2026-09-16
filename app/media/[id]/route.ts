import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { readUpload } from "@/lib/uploads";

/**
 * Serves uploaded media from object storage.
 *
 * The bucket is private and every read passes through here — that's the hook a
 * future premium paywall needs. Today everything is public.
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/media/[id]">,
) {
  const { id } = await ctx.params;

  const media = await prisma.mediaFile.findUnique({
    where: { id },
    select: {
      storageKey: true,
      originalName: true,
      mimeType: true,
      size: true,
    },
  });

  if (!media) {
    return new Response("Not found", { status: 404 });
  }

  const blob = await readUpload(media.storageKey);
  if (!blob) {
    // Row exists but the object is gone from the bucket.
    return new Response("Not found", { status: 404 });
  }

  // `download=1` forces a save dialog; otherwise PDFs open in the viewer.
  const asAttachment = request.nextUrl.searchParams.get("download") === "1";
  const safeName = media.originalName.replace(/["\r\n]/g, "");

  return new Response(blob.stream(), {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(media.size),
      "Content-Disposition": `${asAttachment ? "attachment" : "inline"}; filename="${safeName}"`,
      // Storage keys are immutable, so the bytes at this id never change.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
