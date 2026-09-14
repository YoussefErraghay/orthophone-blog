import Link from "next/link";
import { Stethoscope } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[--c-border] bg-[--c-muted]/60">
      <div className="container-page py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <span className="mb-3 flex items-center gap-2 font-semibold text-[--c-text]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-600 to-cyan-500 text-white">
                <Stethoscope className="h-4 w-4" aria-hidden />
              </span>
              Cabinet d&apos;Orthophonie
            </span>
            <p className="text-sm text-[--c-text-faint]">
              Contenus à visée informative, rédigés par une orthophoniste. Ils
              ne remplacent pas un bilan individualisé.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm text-[--c-text-soft]">
            <Link href="/" className="transition hover:text-[--c-accent]">
              Articles
            </Link>
            <Link href="/about" className="transition hover:text-[--c-accent]">
              À propos
            </Link>
            <Link
              href="/admin/login"
              className="transition hover:text-[--c-accent]"
            >
              Espace praticien
            </Link>
          </nav>
        </div>

        <p className="mt-8 border-t border-[--c-border] pt-6 text-xs text-[--c-text-faint]">
          © {new Date().getFullYear()} Cabinet d&apos;Orthophonie. Tous droits
          réservés.
        </p>
      </div>
    </footer>
  );
}
