"use client";

import { useOptimistic, useState, useSyncExternalStore, useTransition } from "react";
import { Heart } from "lucide-react";
import { likeArticle } from "@/actions/articles";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ortho_liked_articles";

function readLiked(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// `useSyncExternalStore` reads localStorage without a setState-in-effect: the
// server snapshot is always `false`, and the client snapshot is read during
// hydration. Nothing external mutates the key, so subscribe is a no-op.
const subscribe = () => () => {};

/**
 * Like button with an optimistic count.
 *
 * The heart stays red rather than taking the teal brand accent — a red heart is
 * a near-universal "liked" signal, and recolouring it would cost more clarity
 * than palette consistency buys.
 *
 * Duplicate prevention is localStorage-based, so it is per-browser only — it
 * stops accidental double-likes, not a determined visitor.
 */
export function LikeButton({
  articleId,
  initialLikes,
}: {
  articleId: string;
  initialLikes: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(likes);
  const [, startTransition] = useTransition();

  const storedLike = useSyncExternalStore(
    subscribe,
    () => readLiked().includes(articleId),
    () => false,
  );

  // Once clicked we stop consulting storage, so the button stays disabled for
  // the rest of the session even though the snapshot above never re-fires.
  const [justLiked, setJustLiked] = useState(false);
  const hasLiked = storedLike || justLiked;

  function handleLike() {
    if (hasLiked) return;

    setJustLiked(true);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...readLiked(), articleId]),
      );
    } catch {
      // Private browsing or blocked storage: the like still registers server-side.
    }

    startTransition(async () => {
      setOptimisticLikes(optimisticLikes + 1);
      const updated = await likeArticle(articleId);
      setLikes(updated);
    });
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={hasLiked}
      aria-pressed={hasLiked}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-200",
        hasLiked
          ? "cursor-default border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
          : "border-[--c-border] text-[--c-text-soft] hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-95 dark:hover:bg-red-950/30 dark:hover:text-red-400",
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform",
          hasLiked && "scale-110 fill-red-600 text-red-600",
        )}
        aria-hidden
      />
      {optimisticLikes}
      <span className="sr-only">
        {hasLiked ? "Article déjà aimé" : "Aimer cet article"}
      </span>
    </button>
  );
}
