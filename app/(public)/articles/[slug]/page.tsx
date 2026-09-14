import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Eye, Lock, Stethoscope } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate, readingTime } from "@/lib/utils";
import { ViewCounter } from "@/components/ViewCounter";
import { PdfViewer } from "@/components/PdfViewer";
import { ShareBar } from "@/components/ShareBar";
import { CommentSection } from "@/components/CommentSection";

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      coverImage: { select: { id: true } },
      pdf: { select: { id: true, originalName: true, size: true } },
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          authorName: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function generateMetadata(
  props: PageProps<"/articles/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, coverImageId: true },
  });

  if (!article) return { title: "Article introuvable" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImageId
        ? [`/media/${article.coverImageId}`]
        : undefined,
    },
  };
}

export default async function ArticlePage(
  props: PageProps<"/articles/[slug]">,
) {
  const { slug } = await props.params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const html = renderMarkdown(article.content);
  const minutes = readingTime(article.content);

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <ViewCounter articleId={article.id} />

      {/* ---------- Hero header ---------- */}
      <header className="relative overflow-hidden border-b border-[--c-border] bg-gradient-to-br from-slate-50 via-sky-50/40 to-white dark:from-slate-950 dark:via-sky-950/20 dark:to-slate-950">
        <div className="container-page pb-14 pt-10">
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="mb-8 inline-flex items-center gap-2 text-sm text-[--c-text-soft] transition hover:text-[--c-accent]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Tous les articles
          </Link>

          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[--c-border] bg-[--c-surface] px-3 py-1 text-xs font-medium text-[--c-accent]">
                {article.category}
              </span>
              {article.isPremium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-medium text-amber-950">
                  <Lock className="h-3 w-3" aria-hidden />
                  Premium
                </span>
              )}
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[--c-text] sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[--c-text-soft]">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-cyan-500 text-white">
                  <Stethoscope className="h-4 w-4" aria-hidden />
                </span>
                Orthophoniste
              </span>
              <span className="inline-flex items-center gap-1.5 text-[--c-text-faint]">
                <CalendarDays className="h-4 w-4" aria-hidden />
                <time dateTime={article.createdAt.toISOString()}>
                  {formatDate(article.createdAt)}
                </time>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[--c-text-faint]">
                <Clock className="h-4 w-4" aria-hidden />
                {minutes} min de lecture
              </span>
              <span className="inline-flex items-center gap-1.5 text-[--c-text-faint]">
                <Eye className="h-4 w-4" aria-hidden />
                {article.viewsCount} vues
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page pb-16">
        <article className="mx-auto max-w-3xl">
          {article.coverImage && (
            <ViewTransition
              name={`cover-${article.id}`}
              share="morph"
              default="none"
            >
              <div className="card-3d relative -mt-8 h-64 w-full overflow-hidden rounded-3xl bg-[--c-muted] sm:h-96">
                <Image
                  src={`/media/${article.coverImage.id}`}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                  priority
                />
              </div>
            </ViewTransition>
          )}

          <p className="mt-10 border-l-4 border-[--c-accent-bright] pl-5 text-lg leading-relaxed text-[--c-text-soft]">
            {article.excerpt}
          </p>

          {/* Sanitized in renderMarkdown before it reaches the DOM. */}
          <div
            className="prose-ortho mt-8"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {article.pdf && (
            <PdfViewer
              mediaId={article.pdf.id}
              fileName={article.pdf.originalName}
              size={article.pdf.size}
              title={article.title}
            />
          )}

          <ShareBar
            articleId={article.id}
            initialLikes={article.likesCount}
            title={article.title}
          />

          <CommentSection articleId={article.id} comments={article.comments} />
        </article>
      </div>
    </ViewTransition>
  );
}
