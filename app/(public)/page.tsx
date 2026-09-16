import { Suspense, ViewTransition } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleFilters } from "@/components/ArticleFilters";
import { BrochureHighlight } from "@/components/BrochureHighlight";
import { HeroPreviewCard } from "@/components/HeroPreviewCard";
import { StatsBanner } from "@/components/StatsBanner";
import { Reveal } from "@/components/motion/Reveal";
import { isCategory } from "@/lib/categories";
import { readingTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Articles & ressources",
  description:
    "Articles, guides et brochures téléchargeables sur le langage, l'oralité et la néonatologie, pour les parents et les praticiens.",
};

async function ArticleList({
  category,
  query,
}: {
  category?: string;
  query?: string;
}) {
  const articles = await prisma.article.findMany({
    where: {
      ...(category && isCategory(category) ? { category } : {}),
      ...(query
        ? {
            OR: [
              // Postgres `contains` is case-sensitive, unlike MySQL's default
              // collation — without this, "oralité" would miss "Oralité".
              { title: { contains: query, mode: "insensitive" } },
              { excerpt: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      category: true,
      coverImageId: true,
      pdfId: true,
      isPremium: true,
      viewsCount: true,
      likesCount: true,
      createdAt: true,
    },
  });

  if (articles.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[--c-border] p-12 text-center">
        <BookOpen
          className="mx-auto mb-3 h-8 w-8 text-[--c-text-faint]"
          aria-hidden
        />
        <p className="text-[--c-text-faint]">
          Aucun article ne correspond à cette recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {articles.map((article, index) => {
        // `content` is only needed to estimate reading time; don't ship it.
        const { content, ...rest } = article;
        return (
          <ArticleCard
            key={article.id}
            index={index}
            article={{ ...rest, readMinutes: readingTime(content) }}
          />
        );
      })}
    </div>
  );
}

function ArticleListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-80 animate-pulse rounded-3xl border border-[--c-border] bg-[--c-muted]"
        />
      ))}
    </div>
  );
}

/** Newest article carrying a PDF, for the hero preview card. */
async function FeaturedGuide() {
  const featured =
    (await prisma.article.findFirst({
      where: { pdf: { isNot: null } },
      orderBy: { createdAt: "desc" },
      select: {
        slug: true,
        title: true,
        category: true,
        coverImageId: true,
        pdf: { select: { id: true, originalName: true, size: true } },
      },
    })) ??
    (await prisma.article.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        slug: true,
        title: true,
        category: true,
        coverImageId: true,
        pdf: { select: { id: true, originalName: true, size: true } },
      },
    }));

  return <HeroPreviewCard featured={featured} />;
}

async function Highlights() {
  const [totals, articleCount, guideCount, brochures] = await Promise.all([
    prisma.article.aggregate({ _sum: { viewsCount: true, likesCount: true } }),
    prisma.article.count(),
    prisma.article.count({ where: { pdfId: { not: null } } }),
    prisma.article.findMany({
      where: { pdf: { isNot: null } },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        pdf: { select: { id: true, originalName: true, size: true } },
      },
    }),
  ]);

  return (
    <>
      <StatsBanner
        articles={articleCount}
        views={totals._sum.viewsCount ?? 0}
        likes={totals._sum.likesCount ?? 0}
        guides={guideCount}
      />

      <BrochureHighlight
        brochures={brochures.flatMap((b) =>
          b.pdf ? [{ ...b, pdf: b.pdf }] : [],
        )}
      />
    </>
  );
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { category, q } = await searchParams;

  const categoryParam = typeof category === "string" ? category : undefined;
  const queryParam = typeof q === "string" ? q : undefined;

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <div className="container-page py-10 sm:py-14">
        {/* ---------- Hero: two columns ---------- */}
        <section className="mb-16 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[--c-border] bg-[--c-surface] px-4 py-1.5 text-sm font-medium text-[--c-accent]">
              <Sparkles className="h-4 w-4" aria-hidden />
              Ressources en orthophonie
            </p>

            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[--c-text] sm:text-5xl lg:text-6xl">
              Comprendre le{" "}
              <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
                langage
              </span>{" "}
              et la communication de l&apos;enfant
            </h1>

            <p className="mt-6 max-w-xl text-lg text-[--c-text-soft]">
              Des articles et des brochures téléchargeables, rédigés par une
              orthophoniste, pour accompagner les familles et outiller les
              praticiens.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#articles"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95"
              >
                Parcourir les articles
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                href="/about"
                transitionTypes={["nav-forward"]}
                className="rounded-2xl border border-[--c-border] bg-[--c-surface] px-6 py-3.5 text-sm font-medium text-[--c-text-soft] transition hover:border-[--c-accent] hover:text-[--c-accent]"
              >
                Découvrir le cabinet
              </Link>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 text-sm text-[--c-text-faint]">
              <ShieldCheck
                className="h-4 w-4 text-[--c-accent-mint]"
                aria-hidden
              />
              Contenus informatifs, sans valeur de diagnostic
            </p>
          </div>

          {/* Right column streams in so the headline paints immediately. */}
          <div className="lg:pl-4">
            <Suspense
              fallback={
                <div className="h-[26rem] animate-pulse rounded-3xl border border-[--c-border] bg-[--c-muted]" />
              }
            >
              <FeaturedGuide />
            </Suspense>
          </div>
        </section>

        {/* Stats + brochures stream in independently of the hero. */}
        <Suspense fallback={null}>
          <Highlights />
        </Suspense>

        {/* ---------- Articles ---------- */}
        <section id="articles" className="scroll-mt-24">
          <Reveal className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-[--c-text]">
              Tous les articles
            </h2>
          </Reveal>

          <div className="group mb-8">
            <ArticleFilters />
          </div>

          <div className="transition-opacity group-has-data-pending:opacity-60">
            <Suspense
              key={`${categoryParam ?? "all"}-${queryParam ?? ""}`}
              fallback={<ArticleListSkeleton />}
            >
              <ArticleList category={categoryParam} query={queryParam} />
            </Suspense>
          </div>
        </section>
      </div>
    </ViewTransition>
  );
}
