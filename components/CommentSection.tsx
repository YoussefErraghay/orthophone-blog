import { MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CommentForm } from "./CommentForm";
import { Reveal } from "./motion/Reveal";

type Comment = {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
};

/** Deterministic accent per author, so the same name keeps the same colour. */
const AVATAR_GRADIENTS = [
  "from-sky-500 to-cyan-500",
  "from-indigo-500 to-sky-500",
  "from-emerald-500 to-teal-500",
  "from-teal-500 to-cyan-500",
  "from-slate-500 to-slate-700",
];

function avatarFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/**
 * Shows approved comments only. Submissions land unapproved and appear here
 * once the practitioner validates them in the admin queue.
 */
export function CommentSection({
  articleId,
  comments,
}: {
  articleId: string;
  comments: Comment[];
}) {
  return (
    <section className="mt-14 border-t border-[--c-border] pt-10">
      <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-[--c-text]">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-cyan-500/15">
          <MessageCircle className="h-4.5 w-4.5 text-[--c-accent]" aria-hidden />
        </span>
        Commentaires ({comments.length})
      </h2>

      <CommentForm articleId={articleId} />

      <ul className="mt-8 space-y-4">
        {comments.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[--c-border] p-8 text-center text-sm text-[--c-text-faint]">
            Aucun commentaire pour le moment. Soyez le premier à réagir.
          </li>
        )}

        {comments.map((comment, index) => (
          <Reveal key={comment.id} delay={Math.min(index, 6) * 0.05}>
            <li className="flex gap-3 rounded-2xl border border-[--c-border] bg-[--c-surface] p-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${avatarFor(
                  comment.authorName,
                )}`}
                aria-hidden
              >
                {initials(comment.authorName)}
              </span>

              <div className="min-w-0 flex-1">
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
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[--c-text-soft]">
                  {comment.content}
                </p>
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
