import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(connectionString),
});

const ARTICLES = [
  {
    title: "Le développement du langage de 0 à 3 ans",
    slug: "developpement-langage-0-3-ans",
    category: "Langage",
    excerpt:
      "Les grandes étapes du babillage aux premières phrases, et les signes qui méritent un avis orthophonique.",
    content: `## Les premiers mois

Avant même le premier mot, le bébé communique : regards, sourires, vocalises. Le **babillage** apparaît vers 6 mois et se diversifie progressivement.

## Les premiers mots

Autour de 12 mois, l'enfant produit ses premiers mots reconnaissables. Le vocabulaire s'enrichit lentement, puis connaît une accélération marquée vers 18-24 mois.

## Quand consulter ?

- Absence de babillage à 12 mois
- Moins de 10 mots à 18 mois
- Absence d'association de deux mots à 24 mois

Un bilan orthophonique précoce permet d'intervenir au moment le plus favorable.`,
    isPremium: false,
  },
  {
    title: "Oralité alimentaire : comprendre les refus",
    slug: "oralite-alimentaire-comprendre-les-refus",
    category: "Oralité",
    excerpt:
      "Pourquoi certains enfants refusent des textures entières, et comment accompagner les repas sans forcer.",
    content: `## Qu'est-ce que l'oralité ?

L'oralité regroupe toutes les fonctions de la bouche : alimentation, respiration, langage. Un trouble de l'oralité alimentaire se manifeste souvent par des refus sélectifs.

## Les signes fréquents

- Refus catégorique de certaines textures
- Haut-le-cœur au contact de morceaux
- Repas très longs ou conflictuels

## Accompagner sans forcer

La règle essentielle : **ne jamais forcer**. La contrainte renforce l'aversion. On privilégie l'exploration sensorielle hors contexte de repas.`,
    isPremium: false,
  },
  {
    title: "Prise en charge en néonatologie : le rôle de l'orthophoniste",
    slug: "prise-en-charge-neonatologie-role-orthophoniste",
    category: "Néonatologie",
    excerpt:
      "Succion, déglutition et soutien à l'allaitement chez le nouveau-né prématuré.",
    content: `## Un accompagnement précoce

En service de néonatologie, l'orthophoniste intervient sur la coordination **succion-déglutition-respiration**, souvent immature chez le prématuré.

## Les axes de travail

1. Évaluation des réflexes oraux
2. Stimulations adaptées au terme corrigé
3. Soutien à la mise en place de l'allaitement

Ce travail se fait toujours en équipe pluridisciplinaire, avec les puéricultrices et les néonatologues.`,
    isPremium: true,
  },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";

  if (!email || !password) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env before seeding.",
    );
  }
  if (password.length < 10) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 10 characters.");
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, password: hashed },
  });
  console.log(`Admin ready: ${email}`);

  for (const article of ARTICLES) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }
  console.log(`Seeded ${ARTICLES.length} articles.`);

  // A couple of comments so the moderation queue isn't empty on first run.
  const first = await prisma.article.findUnique({
    where: { slug: ARTICLES[0].slug },
    select: { id: true, comments: { select: { id: true } } },
  });

  if (first && first.comments.length === 0) {
    await prisma.comment.createMany({
      data: [
        {
          articleId: first.id,
          authorName: "Sophie M.",
          content: "Merci pour cet article, très clair !",
          isApproved: true,
        },
        {
          articleId: first.id,
          authorName: "Karim B.",
          content: "Mon fils a 20 mois et ne dit que 5 mots, dois-je m'inquiéter ?",
          isApproved: false,
        },
      ],
    });
    console.log("Seeded 2 comments (1 approved, 1 pending).");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
