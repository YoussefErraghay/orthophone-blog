/**
 * Editorial categories for the practice. Kept as a plain list rather than a
 * Prisma enum so new themes can be added without a migration.
 */
export const CATEGORIES = [
  "Néonatologie",
  "Langage",
  "Oralité",
  "Parentalité",
  "Troubles d'apprentissage",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
