import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, FileText, Sparkles } from "lucide-react";
import { formatBytes } from "@/lib/utils";

type Featured = {
  slug: string;
  title: string;
  category: string;
  coverImageId: string | null;
  pdf: { id: string; originalName: string; size: number } | null;
};

/**
 * Hero-right visual: a tilted preview of the newest guide.
 *
 * Falls back to a generic panel when nothing is published yet, so the hero
 * never renders a broken or empty slot on a fresh install.
 */
export function HeroPreviewCard({ featured }: { featured: Featured | null }) {
  if (!featured) {
    return (
      <div className="tilt-card card-3d rounded-3xl border border-[--c-border] bg-[--c-surface] p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
          <FileText className="h-6 w-6" aria-hidden />
        </span>
        <p className="font-semibold text-[--c-text]">
          Vos guides apparaîtront ici
        </p>
        <p className="mt-1 text-sm text-[--c-text-faint]">
          Publiez un article avec une brochure PDF depuis l&apos;espace
          praticien.
        </p>
      </div>
    );
  }

  return (
    <div className="tilt-card card-3d overflow-hidden rounded-3xl border border-[--c-border] bg-[--c-surface]">
      <div className="relative h-44 w-full overflow-hidden bg-[--c-muted]">
        {featured.coverImageId ? (
          <Image
            src={`/media/${featured.coverImageId}`}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 480px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 via-white to-cyan-100 dark:from-sky-950/40 dark:to-cyan-950/40">
            <FileText className="h-10 w-10 text-[--c-accent]/40" aria-hidden />
          </div>
        )}

        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-[--c-glass-border] bg-[--c-glass] px-3 py-1 text-xs font-medium text-[--c-text] backdrop-blur-md">
          <Sparkles className="h-3 w-3 text-[--c-accent]" aria-hidden />
          Dernier guide
        </span>
      </div>

      <div className="p-6">
        <span className="rounded-full bg-[--c-muted] px-2.5 py-1 text-xs font-medium text-[--c-text-soft]">
          {featured.category}
        </span>

        <h2 className="mt-3 font-semibold leading-snug text-[--c-text]">
          {featured.title}
        </h2>

        {featured.pdf && (
          <p className="mt-2 truncate text-xs text-[--c-text-faint]">
            {featured.pdf.originalName} · {formatBytes(featured.pdf.size)}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {featured.pdf && (
            <a
              href={`/media/${featured.pdf.id}?download=1`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95"
            >
              <Download className="h-4 w-4" aria-hidden />
              Télécharger
            </a>
          )}

          <Link
            href={`/articles/${featured.slug}`}
            transitionTypes={["nav-forward"]}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[--c-text-soft] transition hover:text-[--c-accent]"
          >
            Lire l&apos;article
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
