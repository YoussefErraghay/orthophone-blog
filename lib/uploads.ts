import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Disk-backed file storage.
 *
 * Files are written to `uploads/` at the project root — outside `public/`, so
 * nothing is served without going through the media route handler, which is
 * what lets premium gating work later. The DB stores only the storage key.
 */

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

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
 * generated name never derives from user input.
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

  const storageKey = `${randomUUID()}${allowed[detected]}`;

  await mkdir(UPLOAD_ROOT, { recursive: true });
  await writeFile(path.join(UPLOAD_ROOT, storageKey), buffer);

  return {
    storageKey,
    // Keep the original name for the download filename only; never for paths.
    originalName: file.name.slice(0, 200) || storageKey,
    mimeType: detected,
    size: buffer.byteLength,
    kind,
  };
}

/** Resolve a storage key to an absolute path, refusing anything outside the root. */
export function resolveUploadPath(storageKey: string) {
  const resolved = path.resolve(UPLOAD_ROOT, storageKey);
  const root = path.resolve(UPLOAD_ROOT);

  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new UploadError("Chemin de fichier invalide.");
  }
  return resolved;
}

/** Best-effort cleanup; a missing file is not an error worth surfacing. */
export async function deleteUpload(storageKey: string) {
  try {
    await unlink(resolveUploadPath(storageKey));
  } catch {
    // Already gone.
  }
}
