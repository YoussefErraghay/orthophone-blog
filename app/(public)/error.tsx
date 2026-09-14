"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Error boundary for the public site.
 *
 * Without this, a failed database query inside a Suspense boundary leaves the
 * visitor staring at a loading skeleton forever while the page still returns
 * HTTP 200. Better to say plainly that something went wrong.
 */
export default function PublicError({
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
    <div className="container-page py-24 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" aria-hidden />
      <h1 className="mt-4 text-2xl font-semibold text-[--c-text]">
        Contenu momentanément indisponible
      </h1>
      <p className="mt-3 text-[--c-text-soft]">
        Les articles n&apos;ont pas pu être chargés. Merci de réessayer dans un
        instant.
      </p>

      {error.digest && (
        <p className="mt-2 text-xs text-[--c-text-faint]">
          Référence : {error.digest}
        </p>
      )}

      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95"
      >
        Réessayer
      </button>
    </div>
  );
}
