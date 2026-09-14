import Link from "next/link";
import { FileText, ImageIcon, Lock, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      isPremium: true,
      viewsCount: true,
      createdAt: true,
      coverImageId: true,
      pdfId: true,
      _count: { select: { comments: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[--c-text]">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nouvel article
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[--c-border] bg-[--c-surface]">
        {articles.length === 0 ? (
          <p className="p-6 text-sm text-[--c-text-faint]">
            Aucun article. Créez le premier.
          </p>
        ) : (
          <ul className="divide-y divide-[--c-border]">
            {articles.map((article) => (
              <li
                key={article.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 transition hover:bg-[--c-muted]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="font-medium text-[--c-text] transition-colors hover:text-[--c-accent]"
                    >
                      {article.title}
                    </Link>

                    {article.isPremium && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <Lock className="h-3 w-3" aria-hidden />
                        Premium
                      </span>
                    )}
                    {article.coverImageId && (
                      <ImageIcon
                        className="h-3.5 w-3.5 text-[--c-text-faint]"
                        aria-label="Image de couverture"
                      />
                    )}
                    {article.pdfId && (
                      <FileText
                        className="h-3.5 w-3.5 text-[--c-text-faint]"
                        aria-label="Brochure PDF"
                      />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-[--c-text-faint]">
                    {article.category} · {formatDate(article.createdAt)} ·{" "}
                    {article.viewsCount} vues · {article._count.comments}{" "}
                    commentaire{article._count.comments > 1 ? "s" : ""}
                  </p>
                </div>

                <DeleteArticleButton
                  articleId={article.id}
                  title={article.title}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
