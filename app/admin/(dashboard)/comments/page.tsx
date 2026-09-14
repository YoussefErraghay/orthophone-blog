import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { CommentModerationActions } from "@/components/admin/CommentModerationActions";

export default async function AdminCommentsPage() {
  const [pending, approved] = await Promise.all([
    prisma.comment.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "desc" },
      include: { article: { select: { title: true, slug: true } } },
    }),
    prisma.comment.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { article: { select: { title: true, slug: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-[--c-text]">
          En attente ({pending.length})
        </h1>

        <div className="overflow-hidden rounded-2xl border border-[--c-border] bg-[--c-surface]">
          {pending.length === 0 ? (
            <p className="p-6 text-sm text-[--c-text-faint]">
              Aucun commentaire en attente.
            </p>
          ) : (
            <ul className="divide-y divide-[--c-border]">
              {pending.map((comment, index) => (
                <li
                  key={comment.id}
                  className="card-enter space-y-3 p-4"
                  style={{ "--enter-delay": `${Math.min(index, 6) * 50}ms` } as React.CSSProperties}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-[--c-text]">
                      {comment.authorName}
                    </span>
                    <time
                      dateTime={comment.createdAt.toISOString()}
                      className="text-xs text-[--c-text-faint]"
                    >
                      {formatDate(comment.createdAt)}
                    </time>
                  </div>

                  <p className="whitespace-pre-line text-sm text-[--c-text-soft]">
                    {comment.content}
                  </p>

                  <p className="text-xs text-[--c-text-faint]">
                    sur{" "}
                    <Link
                      href={`/articles/${comment.article.slug}`}
                      className="transition-colors hover:text-[--c-accent]"
                    >
                      {comment.article.title}
                    </Link>
                  </p>

                  <CommentModerationActions commentId={comment.id} showApprove />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-[--c-text]">
          Publiés récemment ({approved.length})
        </h2>

        <div className="overflow-hidden rounded-2xl border border-[--c-border] bg-[--c-surface]">
          {approved.length === 0 ? (
            <p className="p-6 text-sm text-[--c-text-faint]">
              Aucun commentaire publié.
            </p>
          ) : (
            <ul className="divide-y divide-[--c-border]">
              {approved.map((comment) => (
                <li
                  key={comment.id}
                  className="flex flex-wrap items-start justify-between gap-4 p-4 transition hover:bg-[--c-muted]"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-[--c-text]">
                      {comment.authorName}
                    </span>
                    <p className="mt-1 line-clamp-2 text-sm text-[--c-text-soft]">
                      {comment.content}
                    </p>
                    <p className="mt-1 text-xs text-[--c-text-faint]">
                      sur {comment.article.title}
                    </p>
                  </div>

                  <CommentModerationActions commentId={comment.id} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
