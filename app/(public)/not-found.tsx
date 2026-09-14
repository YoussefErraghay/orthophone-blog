import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-[--c-accent]">
        Erreur 404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[--c-text]">
        Cette page n&apos;existe pas
      </h1>
      <p className="mt-3 text-[--c-text-soft]">
        L&apos;article a peut-être été déplacé ou supprimé.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95"
      >
        Retour aux articles
      </Link>
    </div>
  );
}
