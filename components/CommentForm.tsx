"use client";

import { useActionState, useEffect, useRef } from "react";
import { addComment, type CommentFormState } from "@/actions/comments";

const initialState: CommentFormState = {};

const fieldClass =
  "w-full rounded-lg border border-[--c-border] bg-[--c-surface] px-3 py-2 text-sm text-[--c-text] outline-none transition focus:border-[--c-accent] focus:ring-2 focus:ring-[--c-accent]/20";

export function CommentForm({ articleId }: { articleId: string }) {
  const [state, formAction, pending] = useActionState(addComment, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 space-y-3 rounded-2xl border border-[--c-border] bg-[--c-muted] p-4"
    >
      <input type="hidden" name="articleId" value={articleId} />

      <div>
        <label
          htmlFor="authorName"
          className="mb-1 block text-sm font-medium text-[--c-text-soft]"
        >
          Votre nom
        </label>
        <input
          id="authorName"
          name="authorName"
          required
          maxLength={80}
          className={fieldClass}
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="mb-1 block text-sm font-medium text-[--c-text-soft]"
        >
          Votre commentaire
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={4}
          maxLength={2000}
          className={fieldClass}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {state.error}
        </p>
      )}

      {state.success && (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
          Merci ! Votre commentaire sera publié après validation.
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-[--c-text-faint]">
          Les commentaires sont modérés avant publication.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-600/20 transition hover:brightness-110 active:scale-95 disabled:opacity-60"
        >
          {pending ? "Envoi…" : "Publier"}
        </button>
      </div>
    </form>
  );
}
