import { BookOpen, Eye, FileDown, Heart } from "lucide-react";
import { CountUp } from "./motion/CountUp";
import { HoverLift, Reveal } from "./motion/Reveal";

/**
 * Headline figures for the practice. Values come from the database, so the
 * banner never shows invented numbers — an empty site shows zeros.
 */
export function StatsBanner({
  articles,
  views,
  likes,
  guides,
}: {
  articles: number;
  views: number;
  likes: number;
  guides: number;
}) {
  const stats = [
    {
      label: "Articles publiés",
      value: articles,
      icon: BookOpen,
      tint: "from-sky-500/15 to-cyan-500/15 text-sky-600 dark:text-sky-400",
    },
    {
      label: "Lectures",
      value: views,
      icon: Eye,
      tint: "from-cyan-500/15 to-teal-500/15 text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Guides PDF gratuits",
      value: guides,
      icon: FileDown,
      tint: "from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Articles appréciés",
      value: likes,
      icon: Heart,
      tint: "from-indigo-500/15 to-sky-500/15 text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <section className="mb-16">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tint }, index) => (
          <Reveal key={label} delay={index * 0.07} className="h-full">
            <HoverLift className="h-full">
              <div className="h-full rounded-2xl border border-[--c-glass-border] bg-[--c-glass] p-5 shadow-sm backdrop-blur-md transition-shadow duration-300 hover:shadow-lg hover:shadow-sky-500/10 sm:p-6">
                <span
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tint}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>

                <p className="text-2xl font-semibold tracking-tight text-[--c-text] sm:text-3xl">
                  <CountUp value={value} duration={1.2 + index * 0.15} />
                </p>
                <p className="mt-1 text-xs text-[--c-text-faint] sm:text-sm">
                  {label}
                </p>
              </div>
            </HoverLift>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
