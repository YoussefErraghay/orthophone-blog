import Link from "next/link";
import { FileText, LayoutDashboard, LogOut, MessageSquare } from "lucide-react";
import { logout } from "@/actions/auth";
import { requireAdmin } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/comments", label: "Commentaires", icon: MessageSquare },
] as const;

/**
 * Shell for the authenticated admin area. `proxy.ts` already redirects
 * unauthenticated visitors; `requireAdmin` is the defence-in-depth check.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-[--c-bg]">
      <header className="border-b border-[--c-border] bg-[--c-surface]">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-3">
          <nav className="flex items-center gap-1 text-sm">
            {LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[--c-text-soft] transition hover:bg-[--c-muted] hover:text-[--c-accent]"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-sm text-[--c-text-faint]">
            <span className="hidden sm:inline">{admin.email}</span>
            <ThemeToggle />
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-[--c-border] px-3 py-1.5 transition hover:bg-[--c-muted] active:scale-95"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container-page flex-1 py-8">{children}</main>
    </div>
  );
}
