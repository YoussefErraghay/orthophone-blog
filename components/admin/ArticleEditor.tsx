"use client";

import { useActionState, useState } from "react";
import { Eye, PenLine } from "lucide-react";
import { createArticle, type ArticleFormState } from "@/actions/articles";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { FileField } from "./FileField";

const initialState: ArticleFormState = {};

// Must match lib/uploads.ts. Inlined rather than imported because that module
// pulls in the server-only storage client, which cannot cross into the bundle.
const CEILING_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 4);
const MAX_IMAGE_BYTES = Math.min(4, CEILING_MB) * 1024 * 1024;
const MAX_PDF_BYTES = CEILING_MB * 1024 * 1024;

const fieldClass =
  "w-full rounded-lg border border-[--c-border] bg-[--c-surface] px-3 py-2 text-sm text-[--c-text] outline-none transition focus:border-[--c-accent] focus:ring-2 focus:ring-[--c-accent]/20";

/**
 * Markdown editor with a live preview pane and file uploads.
 *
 * The preview shows raw Markdown as a writing aid — the authoritative render
 * happens server-side in `renderMarkdown`, which also sanitizes.
 */
export function ArticleEditor() {
  const [state, formAction, pending] = useActionState(
    createArticle,
    initialState,
  );
  const [content, setContent] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [sizeError, setSizeError] = useState<string | null>(null);

  /**
   * The platform caps the whole request body, not each file, and rejects it
   * with a 413 before the Server Action runs — so `useActionState` never sees
   * an error and the user would just get a blank failure. Check the combined
   * size here and explain it instead.
   */
  function handleSubmit(formData: FormData) {
    const total = ["coverImage", "pdf"].reduce((sum, name) => {
      const f = formData.get(name);
      return sum + (f instanceof File ? f.size : 0);
    }, 0);

    if (total > CEILING_MB * 1024 * 1024) {
      setSizeError(
        `Les fichiers totalisent ${(total / 1024 / 1024).toFixed(1)} Mo, ` +
          `au-dessus de la limite de ${CEILING_MB} Mo de l'hébergement. ` +
          `Réduisez le PDF ou l'image, ou téléversez-les séparément.`,
      );
      return;
    }

    setSizeError(null);
    formAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-[--c-text-soft]">
            Titre
          </label>
          <input id="title" name="title" required className={fieldClass} />
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-[--c-text-soft]">
            Catégorie
          </label>
          <select id="category" name="category" required className={fieldClass}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-[--c-text-soft]">
            <input
              type="checkbox"
              name="isPremium"
              className="h-4 w-4 rounded border-[--c-border] text-[--c-accent] focus:ring-[--c-accent]"
            />
            Article premium
          </label>
        </div>

        <FileField
          name="coverImage"
          label="Image de couverture"
          accept="image/jpeg,image/png,image/webp,image/avif"
          maxBytes={MAX_IMAGE_BYTES}
          kind="IMAGE"
          hint={`JPEG, PNG, WebP ou AVIF · ${Math.min(4, CEILING_MB)} Mo maximum`}
        />

        <FileField
          name="pdf"
          label="Brochure PDF"
          accept="application/pdf"
          maxBytes={MAX_PDF_BYTES}
          kind="PDF"
          hint={`PDF · ${CEILING_MB} Mo maximum`}
        />

        <div className="sm:col-span-2">
          <label htmlFor="excerpt" className="mb-1 block text-sm font-medium text-[--c-text-soft]">
            Résumé
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            rows={2}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition",
              tab === "write"
                ? "bg-[--c-muted] text-[--c-text]"
                : "text-[--c-text-soft] hover:bg-[--c-muted]",
            )}
          >
            <PenLine className="h-4 w-4" aria-hidden />
            Rédaction
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition",
              tab === "preview"
                ? "bg-[--c-muted] text-[--c-text]"
                : "text-[--c-text-soft] hover:bg-[--c-muted]",
            )}
          >
            <Eye className="h-4 w-4" aria-hidden />
            Aperçu
          </button>
        </div>

        {/* Keep the textarea mounted so its value stays in the form payload. */}
        <div className={tab === "write" ? "block" : "hidden"}>
          <textarea
            id="content"
            name="content"
            required
            rows={18}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={"## Sous-titre\n\nRédigez en Markdown : **gras**, *italique*, listes…"}
            className={cn(fieldClass, "font-mono")}
          />
          <p className="mt-1 text-xs text-[--c-text-faint]">
            Markdown accepté. Le rendu final est nettoyé côté serveur.
          </p>
        </div>

        {tab === "preview" && (
          <div className="min-h-[20rem] whitespace-pre-wrap rounded-lg border border-[--c-border] bg-[--c-surface] p-4 text-sm text-[--c-text-soft]">
            {content || "Rien à prévisualiser pour le moment."}
          </div>
        )}
      </div>

      {(sizeError ?? state.error) && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {sizeError ?? state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95 disabled:opacity-60"
      >
        {pending ? "Publication…" : "Publier l'article"}
      </button>
    </form>
  );
}
