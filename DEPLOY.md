# Déploiement — Vercel + Supabase

L'application a besoin de deux services :

| Besoin | Service | Pourquoi |
| --- | --- | --- |
| Hébergement Next.js | **Vercel** | Next.js 16 y tourne sans configuration |
| Base Postgres | **Supabase** | `DATABASE_URL` |
| Stockage fichiers | **Supabase Storage** | Le disque d'un hôte serverless est éphémère |

Les fichiers téléversés ne touchent jamais le disque local : ils vont dans un
bucket privé, et `/media/[id]` les ressert. C'est ce qui permet aux brochures de
survivre à un redéploiement.

---

## 1. Créer le projet Supabase

Sur [supabase.com](https://supabase.com) : **New project**. Notez le mot de
passe de la base, il n'est affiché qu'une fois.

### Récupérer l'URL de connexion

**Project Settings → Database → Connection string → URI**.

Sur un hôte serverless, prenez la variante **Transaction pooler** (port `6543`) :
chaque requête ouvre une connexion, et le pooler évite de saturer la base.

```
postgresql://postgres.xxxx:MOT_DE_PASSE@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
```

### Créer le bucket

**Storage → New bucket** :

- Nom : `media`
- **Public bucket : décoché** — les fichiers passent par `/media/[id]`, ce qui
  laisse la porte ouverte à un contrôle d'accès premium plus tard.

### Récupérer les clés

**Project Settings → API** :

- `Project URL` → `SUPABASE_URL`
- `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

> La clé `service_role` contourne la sécurité au niveau des lignes. Elle doit
> rester côté serveur : ne la préfixez jamais par `NEXT_PUBLIC_`.

## 2. Appliquer le schéma

Depuis votre machine, avec l'URL Supabase dans `.env` :

```bash
npm run db:deploy   # crée les tables
npm run db:seed     # compte admin + articles d'exemple
```

Pour les migrations, utilisez l'URL **directe** (port `5432`) plutôt que le
pooler — les migrations ouvrent une session longue.

## 3. Déployer sur Vercel

Sur [vercel.com](https://vercel.com) : **Add New → Project**, importez
`orthophone-blog` depuis GitHub. Vercel détecte Next.js tout seul.

Avant de déployer, **Environment Variables** :

| Variable | Valeur |
| --- | --- |
| `DATABASE_URL` | URI du pooler Supabase (port 6543) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | la clé `service_role` |
| `SUPABASE_BUCKET` | `media` |
| `SESSION_SECRET` | clé aléatoire (voir ci-dessous) |
| `NEXT_PUBLIC_SITE_URL` | l'URL du déploiement |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` ne servent qu'au seed : inutile de
les mettre sur Vercel.

## 4. Vérifier

- La page d'accueil liste les articles du seed.
- `/admin/login` accepte les identifiants du seed.
- Publier un article avec une image et un PDF, puis **redéployer** : les
  fichiers doivent toujours s'afficher. C'est le test qui prouve que le stockage
  objet fonctionne.

---

## Notes

**Le client Prisma n'est pas versionné.** Il est généré par `postinstall` et par
le script `build`, donc rien à faire manuellement.

**La construction n'a pas besoin des services.** Le client Prisma et le client
Supabase sont créés paresseusement, donc `next build` réussit sans aucune
variable d'environnement — seule l'exécution en a besoin.

**Limite de taille.** Les Server Actions acceptent 16 Mo
(`next.config.ts`), au-dessus des limites applicatives (image 4 Mo, PDF 10 Mo).
Le plan gratuit de Vercel plafonne le corps d'une requête à 4,5 Mo : un PDF de
10 Mo échouera tant que le plan n'est pas relevé. Pour contourner cela sans
changer de plan, il faudrait téléverser directement vers Supabase depuis le
navigateur avec une URL signée.

**Sauvegardes.** La base et le bucket vont ensemble : sauvegarder l'un sans
l'autre laisse des articles dont les fichiers manquent, ou des fichiers
orphelins.

**Fichiers existants.** Les fichiers de `uploads/` (développement local) ne
sont pas migrés automatiquement. Reversez-les depuis l'espace praticien.
