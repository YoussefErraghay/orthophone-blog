import { createReadStream, statSync } from "node:fs";
import type { ReadStream } from "node:fs";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/uploads";

/**
 * Serves uploaded media from disk.
 *
 * Files deliberately live outside `public/` so every read passes through here —
 * that's the hook a future premium paywall needs. Today everything is public.
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

  let filePath: string;
  try {
    filePath = resolveUploadPath(media.storageKey);
    statSync(filePath);
  } catch {
    // Row exists but the file is gone from disk.
    return new Response("Not found", { status: 404 });
  }

  // `download=1` forces a save dialog; otherwise PDFs open in the viewer.
  const asAttachment = request.nextUrl.searchParams.get("download") === "1";
  const safeName = media.originalName.replace(/["\r\n]/g, "");

  const stream = Readable.toWeb(
    createReadStream(filePath) as ReadStream,
  ) as ReadableStream<Uint8Array>;

  return new Response(stream, {
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
