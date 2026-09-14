"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Maximize2, Minimize2, Printer } from "lucide-react";
import { formatBytes } from "@/lib/utils";

/**
 * Brochure reader. Uses the browser's built-in PDF viewer in an <iframe> rather
 * than a JS PDF library — no extra bundle, and it prints and scrolls natively.
 */
export function PdfViewer({
  mediaId,
  fileName,
  size,
  title,
}: {
  mediaId: string;
  fileName: string;
  size: number;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  async function toggleFullscreen() {
    // Track the real fullscreen state rather than assuming the call succeeded.
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      setFullscreen(false);
      return;
    }
    try {
      await containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } catch {
      // Fullscreen denied; the inline viewer still works.
    }
  }

  const iconButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-[--c-text-soft] transition hover:bg-[--c-muted] hover:text-[--c-accent]";

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="mt-12"
    >
      <div
        ref={containerRef}
        className="glass card-3d overflow-hidden rounded-3xl bg-[--c-surface]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[--c-border] p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-cyan-500 text-white">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-[--c-text]">
                {fileName}
              </h2>
              <p className="text-xs text-[--c-text-faint]">
                PDF · {formatBytes(size)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"}
              className={iconButton}
            >
              {fullscreen ? (
                <Minimize2 className="h-4 w-4" aria-hidden />
              ) : (
                <Maximize2 className="h-4 w-4" aria-hidden />
              )}
            </button>

            <a
              href={`/media/${mediaId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ouvrir dans un onglet pour imprimer"
              className={iconButton}
            >
              <Printer className="h-4 w-4" aria-hidden />
            </a>

            <a
              href={`/media/${mediaId}?download=1`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95"
            >
              <Download className="h-4 w-4" aria-hidden />
              Télécharger
            </a>
          </div>
        </div>

        <iframe
          src={`/media/${mediaId}`}
          title={`Brochure : ${title}`}
          className="h-[70vh] max-h-[820px] w-full bg-white"
        />
      </div>
    </motion.section>
  );
}
