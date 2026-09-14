import Link from "next/link";
import Image from "next/image";
import { ViewTransition } from "react";
import { Clock, Eye, FileText, Heart, Lock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { HoverLift, Reveal } from "./motion/Reveal";

type ArticleCardProps = {
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    coverImageId: string | null;
    pdfId: string | null;
    isPremium: boolean;
    viewsCount: number;
    likesCount: number;
    readMinutes: number;
    createdAt: Date;
  };
  index?: number;
};

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  return (
    <Reveal delay={Math.min(index, 8) * 0.06} className="h-full">
      <HoverLift className="h-full">
        <article className="group h-full overflow-hidden rounded-3xl border border-[--c-border] bg-[--c-surface] shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-sky-600/10">
          <Link
            href={`/articles/${article.slug}`}
            transitionTypes={["nav-forward"]}
            className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--c-accent]"
          >
            <div className="relative h-44 w-full overflow-hidden bg-[--c-muted]">
              {article.coverImageId ? (
                <ViewTransition
                  name={`cover-${article.id}`}
                  share="morph"
                  default="none"
                >
                  <Image
                    src={`/media/${article.coverImageId}`}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </ViewTransition>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-[--c-surface] to-sky-100 transition-transform duration-700 group-hover:scale-105 dark:from-slate-900 dark:to-sky-950/40">
                  <span className="text-4xl font-semibold text-[--c-accent]/25">
                    {article.category.charAt(0)}
                  </span>
                </div>
              )}

              {/* Gradient scrim keeps the badges legible over any photo. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                <span className="glass rounded-full px-2.5 py-1 text-xs font-medium text-[--c-text]">
                  {article.category}
                </span>
                {article.isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-1 text-xs font-medium text-amber-950">
                    <Lock className="h-3 w-3" aria-hidden />
                    Premium
                  </span>
                )}
              </div>

              {article.pdfId && (
                <span className="glass absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-[--c-text]">
                  <FileText className="h-3 w-3 text-[--c-accent]" aria-hidden />
                  PDF
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
              <h2 className="font-semibold leading-snug text-[--c-text] transition-colors group-hover:text-[--c-accent]">
                {article.title}
              </h2>
              <p className="line-clamp-2 flex-1 text-sm text-[--c-text-soft]">
                {article.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-3 border-t border-[--c-border] pt-3 text-xs text-[--c-text-faint]">
                <time dateTime={article.createdAt.toISOString()}>
                  {formatDate(article.createdAt)}
                </time>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {article.readMinutes} min
                </span>
                <span className="ml-auto inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" aria-hidden />
                  {article.viewsCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" aria-hidden />
                  {article.likesCount}
                </span>
              </div>
            </div>
          </Link>
        </article>
      </HoverLift>
    </Reveal>
  );
}
