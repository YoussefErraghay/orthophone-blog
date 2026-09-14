"use client";

import { useEffect, useRef, useTransition } from "react";
import { incrementViews } from "@/actions/articles";

/**
 * Records one view per mount. Renders nothing.
 *
 * The ref guard keeps React Strict Mode's double-invoked effects in development
 * from counting the same visit twice.
 */
export function ViewCounter({ articleId }: { articleId: string }) {
  const counted = useRef(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;

    startTransition(async () => {
      await incrementViews(articleId);
    });
  }, [articleId]);

  return null;
}
