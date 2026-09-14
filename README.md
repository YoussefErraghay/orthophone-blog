# Cabinet d'Orthophonie — site & blog

Blog et plateforme de ressources pour un cabinet d'orthophonie : articles,
brochures PDF téléversées depuis l'admin, likes et commentaires modérés.

Lecture publique sans compte. Seul l'espace praticien demande une connexion.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **TypeScript**, **Tailwind CSS v4** (configuration CSS-first, pas de `tailwind.config.js`)
- **Prisma 7** + **MySQL/MariaDB**, via le driver adapter `@prisma/adapter-mariadb`
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
| `DATABASE_URL` | `mysql://user:pass@localhost:3306/orthophonie` |
| `SESSION_SECRET` | Clé de signature du cookie d'admin |
| `SEED_ADMIN_EMAIL` | Email du compte admin initial |
| `SEED_ADMIN_PASSWORD` | Mot de passe initial (10 caractères minimum) |

La base doit exister avant la migration, en **utf8mb4** pour les accents :

```sql
CREATE DATABASE orthophonie CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Fichiers (images & PDF)

Les fichiers sont **téléversés depuis l'admin**, stockés sur le disque dans
`uploads/` (ignoré par git), et servis par la route `/media/[id]`. La base ne
contient que les métadonnées (modèle `MediaFile` : nom d'origine, type MIME,
taille, clé de stockage).

Pourquoi pas des BLOB en base : `max_allowed_packet` vaut 1 Mo par défaut sur
MariaDB, ce qui rend le stockage d'une brochure impraticable sans reconfigurer
MySQL, et alourdirait chaque sauvegarde.

Limites et contrôles :

| | Taille max | Formats acceptés |
| --- | --- | --- |
| Image de couverture | 4 Mo | JPEG, PNG, WebP, AVIF |
| Brochure | 10 Mo | PDF |

Chaque fichier est vérifié par ses **octets d'en-tête** (magic numbers), pas
seulement par son extension : un exécutable renommé en `.png` est refusé. Le nom
sur le disque est un UUID généré par le serveur, jamais le nom fourni par
l'utilisateur. Supprimer un article supprime aussi ses fichiers.

Les fichiers vivent hors de `public/` : tout passe par `/media/[id]`, ce qui
laisse la porte ouverte à un contrôle d'accès premium plus tard.

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
  media/[id]/        Service des fichiers téléversés
  generated/prisma/  Client Prisma généré (non versionné)
actions/             Server Actions (articles, commentaires, auth)
components/          Composants partagés + composants admin
lib/                 Prisma, session, auth, markdown, uploads, utilitaires
prisma/              Schéma, migrations, script de seed
uploads/             Fichiers téléversés (non versionné)
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
- [ ] Sauvegarder le dossier `uploads/` avec la base (les deux vont ensemble)
- [ ] Ajouter une limitation de débit sur les commentaires, les likes et les uploads
- [ ] Compléter les coordonnées du cabinet dans `app/(public)/about/page.tsx`
