# Cabinet d'Orthophonie — site & blog

Blog et plateforme de ressources pour un cabinet d'orthophonie : articles,
brochures PDF téléversées depuis l'admin, likes et commentaires modérés.

Lecture publique sans compte. Seul l'espace praticien demande une connexion.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **TypeScript**, **Tailwind CSS v4** (configuration CSS-first, pas de `tailwind.config.js`)
- **Prisma 7** + **PostgreSQL**, via le driver adapter `@prisma/adapter-pg`
- `lucide-react`, `clsx`, `tailwind-merge`
- Markdown (`marked`) assaini par `isomorphic-dompurify`

## Démarrage

```bash
npm install
cp .env.example .env     # puis remplir les valeurs
npm run db:migrate
npm run db:seed
npm run dev
```

- Site public : http://localhost:3000
- Espace praticien : http://localhost:3000/admin/login

### Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/postgres` |
| `SESSION_SECRET` | Clé de signature du cookie d'admin |
| `SEED_ADMIN_EMAIL` | Email du compte admin initial |
| `SEED_ADMIN_PASSWORD` | Mot de passe initial (10 caractères minimum) |

En local, une base Postgres suffit :

```sql
CREATE DATABASE orthophonie;
```

## Fichiers (images & PDF)

Les fichiers sont **téléversés depuis l'admin** vers un bucket privé
(Supabase Storage) et servis par la route `/media/[id]`. La base ne contient que
les métadonnées (modèle `MediaFile` : nom d'origine, type MIME, taille, clé de
stockage).

Pourquoi pas le disque : sur un hôte serverless il est en lecture seule et
éphémère, donc tout fichier écrit disparaît au redéploiement suivant.

Limites et contrôles :

| | Taille max | Formats acceptés |
| --- | --- | --- |
| Image de couverture | 4 Mo | JPEG, PNG, WebP, AVIF |
| Brochure | 10 Mo | PDF |

Chaque fichier est vérifié par ses **octets d'en-tête** (magic numbers), pas
seulement par son extension : un exécutable renommé en `.png` est refusé. La clé
de stockage est un UUID généré par le serveur, jamais le nom fourni par
l'utilisateur. Supprimer un article supprime aussi ses fichiers.

Le bucket est privé : tout passe par `/media/[id]`, ce qui laisse la porte
ouverte à un contrôle d'accès premium plus tard.

## Interface

- Thème clair/sombre avec bascule, mémorisé en `localStorage`, appliqué avant
  le premier rendu (pas de flash blanc)
- Animations d'entrée décalées sur les cartes
- Transitions entre pages via `<ViewTransition>` : l'image de couverture se
  transforme en visuel d'article, et la navigation glisse selon le sens
- Tout est désactivé si le visiteur demande `prefers-reduced-motion`

## Scripts

| Script | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et exécution en production |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Crée et applique une migration |
| `npm run db:generate` | Régénère le client Prisma |
| `npm run db:seed` | Alimente la base |
| `npm run db:studio` | Interface Prisma Studio |

## Structure

```
app/
  (public)/          Site public : accueil, article, à propos
  admin/
    login/           Connexion (hors du shell authentifié)
    (dashboard)/     Zone protégée : stats, articles, modération
  media/[id]/        Sert les fichiers depuis le bucket
  generated/prisma/  Client Prisma généré (non versionné)
actions/             Server Actions (articles, commentaires, auth)
components/          Composants partagés + composants admin
lib/                 Prisma, storage, session, auth, markdown, utilitaires
prisma/              Schéma, migrations, script de seed
proxy.ts             Protection des routes /admin
```

## Notes d'implémentation

**Authentification.** Session sans état : cookie `httpOnly` contenant
`adminId.expiration.signature` (HMAC-SHA256). `proxy.ts` filtre la navigation
vers `/admin/*`, mais chaque Server Action d'administration revérifie la session
via `requireAdmin()` — les Server Actions sont joignables en POST direct et ne
passent pas par le proxy.

**Commentaires.** Toujours enregistrés avec `isApproved: false`. Seuls les
commentaires approuvés sont lus par la page publique.

**Likes.** Compteur optimiste (`useOptimistic`) ; l'anti-doublon repose sur
`localStorage` : cela évite les double-clics, mais ne résiste pas à un visiteur
déterminé. Pour un décompte fiable, ajouter une table de likes ou une
limitation de débit.

**Premium.** Le champ `isPremium` est affiché mais **non appliqué** : le contenu
premium reste lisible. Le branchement d'un paiement reste à faire.

## Avant la mise en production

- [ ] Changer le mot de passe admin initial
- [ ] Définir `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` si plusieurs instances
- [ ] Sauvegarder le bucket Supabase avec la base (les deux vont ensemble)
- [ ] Ajouter une limitation de débit sur les commentaires, les likes et les uploads
- [ ] Compléter les coordonnées du cabinet dans `app/(public)/about/page.tsx`
