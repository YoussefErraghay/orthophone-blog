"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Baby, Brain, HeartPulse, MessageCircleHeart, Sparkles } from "lucide-react";

const BADGES = [
  { label: "Langage", icon: MessageCircleHeart, className: "left-[2%] top-[12%]" },
  { label: "Néonatologie", icon: Baby, className: "right-[4%] top-[6%]" },
  { label: "Oralité", icon: HeartPulse, className: "right-[10%] bottom-[10%]" },
  { label: "Apprentissage", icon: Brain, className: "left-[8%] bottom-[6%]" },
] as const;

/**
 * Decorative badges drifting around the hero. Hidden from assistive tech and
 * from small screens, where they would crowd the headline.
 */
export function HeroBadges() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {BADGES.map((badge, index) => {
        const Icon = badge.icon;

        return (
          <motion.span
            key={badge.label}
            className={`glass absolute inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-[--c-text-soft] ${badge.className}`}
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={
              reduced
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: [0, -9, 0] }
            }
            transition={
              reduced
                ? { duration: 0.3 }
                : {
                    opacity: { duration: 0.5, delay: 0.15 * index },
                    scale: { duration: 0.5, delay: 0.15 * index },
                    y: {
                      duration: 4.5 + index * 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.4,
                    },
                  }
            }
          >
            <Icon className="h-3.5 w-3.5 text-[--c-accent]" />
            {badge.label}
          </motion.span>
        );
      })}

      <motion.span
        className="absolute left-1/2 top-[4%] text-[--c-accent-bright]"
        initial={reduced ? false : { opacity: 0 }}
        animate={reduced ? { opacity: 0.6 } : { opacity: [0.3, 0.9, 0.3] }}
        transition={reduced ? { duration: 0.3 } : { duration: 3, repeat: Infinity }}
      >
        <Sparkles className="h-5 w-5" />
      </motion.span>
    </div>
  );
}
