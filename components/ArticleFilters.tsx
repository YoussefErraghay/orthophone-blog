"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * Category tabs + search, both driven through the URL so results stay
 * shareable and server-rendered.
 */
export function ArticleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCategory = searchParams.get("category");
  const [optimisticCategory, setOptimisticCategory] =
    useOptimistic(activeCategory);

  function navigate(next: URLSearchParams) {
    const query = next.toString();
    router.push(query ? `/?${query}#articles` : "/#articles");
  }

  function handleCategory(category: string | null) {
    startTransition(() => {
      setOptimisticCategory(category);
      const params = new URLSearchParams(searchParams.toString());
      if (category) params.set("category", category);
      else params.delete("category");
      navigate(params);
    });
  }

  function handleSearch(formData: FormData) {
    const term = String(formData.get("q") ?? "").trim();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) params.set("q", term);
      else params.delete("q");
      navigate(params);
    });
  }

  const chips: Array<{ key: string; label: string; value: string | null }> = [
    { key: "all", label: "Tous", value: null },
    ...CATEGORIES.map((c) => ({ key: c, label: c, value: c })),
  ];

  return (
    <div className="space-y-4" data-pending={isPending ? "" : undefined}>
      <form action={handleSearch} className="relative max-w-xl">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[--c-text-faint]"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Rechercher un article…"
          aria-label="Rechercher un article"
          className="w-full rounded-2xl border border-[--c-border] bg-[--c-surface] py-3 pl-11 pr-4 text-sm text-[--c-text] shadow-sm outline-none transition focus:border-[--c-accent] focus:ring-2 focus:ring-[--c-accent]/20"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {chips.map(({ key, label, value }) => {
          const active = value === optimisticCategory;

          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                handleCategory(active && value !== null ? null : value)
              }
              className={cn(
                "relative rounded-full px-4 py-2 text-sm transition",
                active
                  ? "text-white"
                  : "border border-[--c-border] text-[--c-text-soft] hover:border-[--c-accent] hover:text-[--c-accent]",
              )}
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-600 to-cyan-600 shadow-lg shadow-sky-600/25"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
