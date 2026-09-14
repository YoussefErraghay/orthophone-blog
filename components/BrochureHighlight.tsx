import Link from "next/link";
import { ArrowRight, Download, FileText, Sparkles } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { HoverLift, Reveal } from "./motion/Reveal";

type Brochure = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  pdf: { id: string; originalName: string; size: number };
};

/**
 * Highlights articles that carry a downloadable brochure. Rendered only when
 * at least one exists, so the section never shows placeholder content.
 */
export function BrochureHighlight({ brochures }: { brochures: Brochure[] }) {
  if (brochures.length === 0) return null;

  return (
    <section className="mb-16">
      <Reveal>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 inline-flex items-center gap-2 text-sm font-medium text-[--c-accent]">
              <Sparkles className="h-4 w-4" aria-hidden />
              À télécharger
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-[--c-text]">
              Brochures & fiches pratiques
            </h2>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        {brochures.map((brochure, index) => (
          <Reveal key={brochure.slug} delay={index * 0.08}>
            <HoverLift className="h-full">
              <article className="card-3d group relative h-full overflow-hidden rounded-3xl border border-[--c-border] bg-[--c-surface] p-6">
                {/* Decorative corner wash */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-sky-400/20 to-cyan-400/20 blur-2xl"
                />

                <div className="relative flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-600/30 transition-transform duration-300 group-hover:scale-105">
                    <FileText className="h-6 w-6" aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="rounded-full bg-[--c-muted] px-2.5 py-1 text-xs font-medium text-[--c-text-soft]">
                      {brochure.category}
                    </span>

                    <h3 className="mt-2 font-semibold leading-snug text-[--c-text]">
                      {brochure.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-[--c-text-soft]">
                      {brochure.excerpt}
                    </p>

                    <p className="mt-2 truncate text-xs text-[--c-text-faint]">
                      {brochure.pdf.originalName} ·{" "}
                      {formatBytes(brochure.pdf.size)}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        href={`/media/${brochure.pdf.id}?download=1`}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95"
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        Télécharger
                      </a>

                      <Link
                        href={`/articles/${brochure.slug}`}
                        transitionTypes={["nav-forward"]}
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[--c-text-soft] transition hover:text-[--c-accent]"
                      >
                        Lire l&apos;article
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </HoverLift>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
