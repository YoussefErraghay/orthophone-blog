import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-30 border-b border-[--c-glass-border] bg-[--c-glass] backdrop-blur-xl"
      style={{ viewTransitionName: "site-header" }}
    >
      <nav className="container-page flex items-center justify-between py-3.5">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="group flex items-center gap-2.5 font-semibold text-[--c-text]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-600/25 transition-transform duration-300 group-hover:scale-105">
            <Stethoscope className="h-4.5 w-4.5" aria-hidden />
          </span>
          <span className="hidden sm:inline">Cabinet d&apos;Orthophonie</span>
          <span className="sm:hidden">Orthophonie</span>
        </Link>

        <div className="flex items-center gap-1 text-sm text-[--c-text-soft]">
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="rounded-xl px-3 py-2 transition hover:bg-[--c-muted] hover:text-[--c-accent]"
          >
            Articles
          </Link>
          <Link
            href="/about"
            transitionTypes={["nav-forward"]}
            className="rounded-xl px-3 py-2 transition hover:bg-[--c-muted] hover:text-[--c-accent]"
          >
            À propos
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
