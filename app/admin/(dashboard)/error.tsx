"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900 dark:bg-amber-950/30">
      <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" aria-hidden />
      <h1 className="mt-4 text-lg font-semibold text-[--c-text]">
        Une erreur est survenue
      </h1>
      <p className="mt-2 text-sm text-[--c-text-soft]">
        Vérifiez que la base de données est accessible, puis réessayez.
      </p>

      {error.digest && (
        <p className="mt-2 text-xs text-[--c-text-faint]">
          Référence : {error.digest}
        </p>
      )}

      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95"
      >
        Réessayer
      </button>
    </div>
  );
}
