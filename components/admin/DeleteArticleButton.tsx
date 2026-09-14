"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteArticle } from "@/actions/articles";

/**
 * Deleting an article cascades to its comments and removes its uploaded files,
 * so confirm before firing.
 */
export function DeleteArticleButton({
  articleId,
  title,
}: {
  articleId: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer « ${title} » ? Les commentaires et fichiers associés seront également supprimés. Cette action est irréversible.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteArticle(articleId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg border border-[--c-border] px-3 py-1.5 text-sm text-[--c-text-soft] transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-60 dark:hover:bg-red-950/30 dark:hover:text-red-400"
    >
      <Trash2 className="h-4 w-4" aria-hidden />
      {pending ? "Suppression…" : "Supprimer"}
    </button>
  );
}
