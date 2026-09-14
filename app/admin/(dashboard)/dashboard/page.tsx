import Link from "next/link";
import { Eye, FileText, Heart, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [totals, articleCount, pendingComments, recent] = await Promise.all([
    prisma.article.aggregate({
      _sum: { viewsCount: true, likesCount: true },
    }),
    prisma.article.count(),
    prisma.comment.count({ where: { isApproved: false } }),
    prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        viewsCount: true,
        likesCount: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    { label: "Articles publiés", value: articleCount, icon: FileText },
    { label: "Vues totales", value: totals._sum.viewsCount ?? 0, icon: Eye },
    { label: "Likes totaux", value: totals._sum.likesCount ?? 0, icon: Heart },
    {
      label: "Commentaires en attente",
      value: pendingComments,
      icon: MessageSquare,
      href: "/admin/comments",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[--c-text]">
        Tableau de bord
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }, index) => {
          const card = (
            <div
              className="card-enter h-full rounded-2xl border border-[--c-border] bg-[--c-surface] p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-400/60 hover:shadow-lg hover:shadow-sky-600/10"
              style={{ "--enter-delay": `${index * 60}ms` } as React.CSSProperties}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-cyan-500/15">
                <Icon className="h-5 w-5 text-[--c-accent]" aria-hidden />
              </span>
              <p className="mt-3 text-2xl font-semibold text-[--c-text]">
                {value}
              </p>
              <p className="text-sm text-[--c-text-faint]">{label}</p>
            </div>
          );

          return href ? (
            <Link key={label} href={href} className="block">
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-[--c-text]">Derniers articles</h2>
        <div className="overflow-hidden rounded-2xl border border-[--c-border] bg-[--c-surface]">
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-[--c-text-faint]">
              Aucun article pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-[--c-border]">
              {recent.map((article) => (
                <li
                  key={article.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-[--c-muted]"
                >
                  <div>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="font-medium text-[--c-text] transition-colors hover:text-[--c-accent]"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-[--c-text-faint]">
                      {formatDate(article.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[--c-text-faint]">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-4 w-4" aria-hidden />
                      {article.viewsCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-4 w-4" aria-hidden />
                      {article.likesCount}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
