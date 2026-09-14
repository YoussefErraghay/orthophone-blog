"use client";

import { useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { approveComment, deleteComment } from "@/actions/comments";

export function CommentModerationActions({
  commentId,
  showApprove = false,
}: {
  commentId: string;
  showApprove?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      await approveComment(commentId);
    });
  }

  function handleDelete() {
    if (!window.confirm("Supprimer définitivement ce commentaire ?")) return;

    startTransition(async () => {
      await deleteComment(commentId);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {showApprove && (
        <button
          type="button"
          onClick={handleApprove}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95 disabled:opacity-60"
        >
          <Check className="h-4 w-4" aria-hidden />
          Approuver
        </button>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg border border-[--c-border] px-3 py-1.5 text-sm text-[--c-text-soft] transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-60 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        Supprimer
      </button>
    </div>
  );
}
