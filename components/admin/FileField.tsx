"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Upload, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

/**
 * File picker with a local preview. The chosen File rides along in the form's
 * FormData — validation and storage happen server-side in `lib/uploads.ts`.
 */
export function FileField({
  name,
  label,
  accept,
  maxBytes,
  kind,
  hint,
}: {
  name: string;
  label: string;
  accept: string;
  maxBytes: number;
  kind: "IMAGE" | "PDF";
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setLocalError(null);

    if (!picked) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Fail fast in the browser; the server re-checks regardless.
    if (picked.size > maxBytes) {
      setLocalError(`Fichier trop lourd (max ${formatBytes(maxBytes)}).`);
      event.target.value = "";
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(picked);
    setPreviewUrl(kind === "IMAGE" ? URL.createObjectURL(picked) : null);
  }

  function clear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const Icon = kind === "IMAGE" ? ImageIcon : FileText;

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-[--c-text-soft]">
        {label}
      </label>

      <div
        className={cn(
          "rounded-xl border border-dashed p-4 transition",
          localError
            ? "border-red-300 bg-red-50/60 dark:bg-red-950/20"
            : "border-[--c-border] hover:border-[--c-accent]",
        )}
      >
        {file ? (
          <div className="flex items-center gap-3">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-[--c-muted]">
                <Icon className="h-6 w-6 text-[--c-accent]" aria-hidden />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[--c-text]">
                {file.name}
              </p>
              <p className="text-xs text-[--c-text-faint]">
                {formatBytes(file.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={clear}
              className="rounded-lg p-2 text-[--c-text-faint] transition hover:bg-[--c-muted] hover:text-red-600"
              aria-label={`Retirer ${file.name}`}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 py-3 text-sm text-[--c-text-soft] transition hover:text-[--c-accent]"
          >
            <Upload className="h-4 w-4" aria-hidden />
            Choisir un fichier
          </button>
        )}

        <input
          ref={inputRef}
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="sr-only"
        />
      </div>

      <p
        className={cn(
          "mt-1 text-xs",
          localError ? "text-red-700 dark:text-red-400" : "text-[--c-text-faint]",
        )}
      >
        {localError ?? hint}
      </p>
    </div>
  );
}
