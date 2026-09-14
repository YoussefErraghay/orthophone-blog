"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Link2, Printer, Share2 } from "lucide-react";
import { SiFacebook, SiWhatsapp } from "@icons-pack/react-simple-icons";
import { LikeButton } from "./LikeButton";

/**
 * Floating like + share bar.
 *
 * WhatsApp and Facebook use their real brand marks from simple-icons. LinkedIn
 * is not distributed in that pack (their trademark policy forbids it), so it
 * falls back to a generic glyph — the link still points at LinkedIn.
 *
 * The share URL is read at click time rather than held in state, so there's no
 * server/client mismatch during hydration.
 */

const BRAND = {
  whatsapp: "#25D366",
  facebook: "#0866FF",
  linkedin: "#0A66C2",
} as const;

export function ShareBar({
  articleId,
  initialLikes,
  title,
}: {
  articleId: string;
  initialLikes: number;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure context or denied permission).
    }
  }

  function share(template: (url: string, title: string) => string) {
    const url = encodeURIComponent(window.location.href);
    window.open(template(url, encodeURIComponent(title)), "_blank", "noopener");
  }

  const targets = [
    {
      key: "whatsapp",
      label: "Partager sur WhatsApp",
      Icon: SiWhatsapp,
      color: BRAND.whatsapp,
      template: (url: string, t: string) => `https://wa.me/?text=${t}%20${url}`,
    },
    {
      key: "facebook",
      label: "Partager sur Facebook",
      Icon: SiFacebook,
      color: BRAND.facebook,
      template: (url: string) =>
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    },
    {
      key: "linkedin",
      label: "Partager sur LinkedIn",
      Icon: Share2,
      color: BRAND.linkedin,
      template: (url: string) =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    },
  ];

  const buttonClass =
    "group flex h-10 w-10 items-center justify-center rounded-full text-[--c-text-soft] transition hover:bg-[--c-muted]";

  return (
    <motion.aside
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="sticky bottom-6 z-10 mx-auto mt-12 w-fit"
    >
      <div className="glass flex items-center gap-1 rounded-full p-2">
        <LikeButton articleId={articleId} initialLikes={initialLikes} />

        <span className="mx-1 h-6 w-px bg-[--c-border]" aria-hidden />

        {targets.map(({ key, label, Icon, color, template }) => (
          <button
            key={key}
            type="button"
            onClick={() => share(template)}
            aria-label={label}
            title={label}
            className={buttonClass}
          >
            {/* Brand colour appears on hover; resting state stays neutral so the
                bar doesn't turn into a row of competing logos. */}
            <Icon
              className="h-4 w-4 transition-colors group-hover:![color:var(--brand)]"
              style={{ "--brand": color } as React.CSSProperties}
              aria-hidden
            />
          </button>
        ))}

        <button
          type="button"
          onClick={copyLink}
          aria-label={copied ? "Lien copié" : "Copier le lien"}
          title={copied ? "Lien copié" : "Copier le lien"}
          className={buttonClass}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" aria-hidden />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden />
          )}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          aria-label="Imprimer l'article"
          title="Imprimer l'article"
          className={buttonClass}
        >
          <Printer className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </motion.aside>
  );
}
