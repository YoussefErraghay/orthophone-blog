import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Needed so Open Graph image paths resolve to absolute URLs.
  // Set NEXT_PUBLIC_SITE_URL to the real domain before deploying.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Cabinet d'Orthophonie",
    template: "%s | Cabinet d'Orthophonie",
  },
  description:
    "Articles, guides et brochures en orthophonie : langage, oralité, néonatologie.",
};

/**
 * Applies the saved theme before first paint, so a dark-mode visitor never sees
 * a white flash. Kept inline and tiny for that reason.
 */
const themeScript = `
try {
  var stored = localStorage.getItem('ortho_theme');
  var dark = stored ? stored === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${sourceSans.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Ambient gradient wash behind every page. */}
        <div className="app-backdrop" aria-hidden />
        {children}
      </body>
    </html>
  );
}
