import { randomUUID } from "node:crypto";
import { MEDIA_BUCKET, getStorage } from "@/lib/storage";

/**
 * Object-storage backed file handling (Supabase Storage).
 *
 * Bytes never touch the local filesystem: serverless hosts give each request a
 * read-only, throwaway disk, so anything written there disappears on the next
 * deploy. The bucket is private — downloads are proxied by `/media/[id]`,
 * which is also where a future premium gate would sit.
 */

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB
export const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

const PDF_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
};

export type UploadKind = "IMAGE" | "PDF";

export type StoredFile = {
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  kind: UploadKind;
};

export class UploadError extends Error {}

/** Magic-number check, so a renamed .exe can't pose as an image or PDF. */
function sniff(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;

  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return "image/png";
  }
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) {
    return "application/pdf";
  }

  const ascii = (i: number, s: string) =>
    s.split("").every((c, k) => b[i + k] === c.charCodeAt(0));

  // RIFF....WEBP
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  // ....ftypavif
  if (ascii(4, "ftyp") && ascii(8, "avif")) return "image/avif";

  return null;
}

/**
 * Validate and persist one uploaded file.
 *
 * Both the declared MIME type and the actual leading bytes must agree, and the
 * generated object key never derives from user input.
 */
export async function storeUpload(
  file: File,
  kind: UploadKind,
): Promise<StoredFile> {
  const allowed = kind === "IMAGE" ? IMAGE_TYPES : PDF_TYPES;
  const maxBytes = kind === "IMAGE" ? MAX_IMAGE_BYTES : MAX_PDF_BYTES;
  const label = kind === "IMAGE" ? "L'image" : "Le PDF";

  if (file.size === 0) {
    throw new UploadError(`${label} est vide.`);
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    throw new UploadError(`${label} dépasse ${mb} Mo.`);
  }
  if (!allowed[file.type]) {
    throw new UploadError(
      kind === "IMAGE"
        ? "Format d'image non supporté (JPEG, PNG, WebP ou AVIF)."
        : "Le fichier doit être un PDF.",
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = sniff(buffer);

  if (!detected || !allowed[detected]) {
    throw new UploadError(
      `${label} ne correspond pas à son extension annoncée.`,
    );
  }

  // Prefix by kind so the bucket stays browsable; the name itself is a UUID.
  const storageKey = `${kind.toLowerCase()}/${randomUUID()}${allowed[detected]}`;

  const { error } = await getStorage()
    .storage.from(MEDIA_BUCKET)
    .upload(storageKey, buffer, {
      contentType: detected,
      upsert: false,
    });

  if (error) {
    throw new UploadError(`Le téléversement a échoué : ${error.message}`);
  }

  return {
    storageKey,
    // Keep the original name for the download filename only; never for keys.
    originalName: file.name.slice(0, 200) || storageKey,
    mimeType: detected,
    size: buffer.byteLength,
    kind,
  };
}

/** Fetch an object's bytes for the media route to stream back. */
export async function readUpload(storageKey: string) {
  const { data, error } = await getStorage()
    .storage.from(MEDIA_BUCKET)
    .download(storageKey);

  if (error || !data) return null;
  return data;
}

/** Best-effort cleanup; a missing object is not an error worth surfacing. */
export async function deleteUpload(storageKey: string) {
  try {
    await getStorage().storage.from(MEDIA_BUCKET).remove([storageKey]);
  } catch {
    // Already gone, or storage unreachable — the DB row is what matters.
  }
}
