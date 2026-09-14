# Déploiement

Cette application a besoin de **deux choses qu'un hébergement serverless ne
fournit pas** :

1. un **disque persistant**, parce que les brochures et images téléversées sont
   écrites sur le système de fichiers (`lib/uploads.ts`) ;
2. une **base MySQL/MariaDB** accessible depuis le serveur.

C'est pourquoi Netlify et Vercel ne conviennent pas sans réécriture : leur
système de fichiers est en lecture seule et éphémère, et tout fichier téléversé
disparaît au redéploiement suivant.

Les plateformes qui conviennent telles quelles : **Railway**, **Render**,
**Fly.io**, ou n'importe quel VPS.

---

## Déployer sur Railway

### 1. Créer le projet

Sur [railway.app](https://railway.app) : **New Project → Deploy from GitHub
repo**, puis choisir `orthophone-blog`.

### 2. Ajouter la base de données

Dans le projet : **New → Database → Add MySQL**.

Railway crée une variable `MYSQL_URL`. Copiez-la.

### 3. Ajouter un volume persistant

Sur le service de l'application : **Settings → Volumes → New Volume**, avec
pour point de montage :

```
/data
```

Sans volume, les fichiers téléversés sont perdus à chaque redéploiement.

### 4. Variables d'environnement

Sur le service de l'application, **Variables** :

| Variable | Valeur |
| --- | --- |
| `DATABASE_URL` | la valeur de `MYSQL_URL` de l'étape 2 |
| `UPLOADS_DIR` | `/data` |
| `SESSION_SECRET` | une clé aléatoire (voir ci-dessous) |
| `SEED_ADMIN_EMAIL` | votre email d'administration |
| `SEED_ADMIN_PASSWORD` | un mot de passe d'au moins 10 caractères |
| `NEXT_PUBLIC_SITE_URL` | l'URL publique du service, ex. `https://orthophone.up.railway.app` |

Générer un secret :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Appliquer le schéma et créer l'admin

Une fois le premier déploiement terminé, dans le shell du service Railway :

```bash
npm run db:deploy   # applique les migrations (non interactif)
npm run db:seed     # crée le compte admin + articles d'exemple
```

> `npm run db:migrate` (`prisma migrate dev`) est **interactif** et ne doit
> jamais être lancé en production. Utilisez `db:deploy`.

### 6. Vérifier

- Le site public répond sur l'URL du service.
- `/admin/login` accepte les identifiants du seed.
- Un article créé avec une image et un PDF reste accessible **après un
  redéploiement** — c'est le test qui prouve que le volume est bien monté.

---

## Notes

**Le client Prisma n'est pas versionné.** Il est généré par `postinstall` et par
le script `build` (`prisma generate && next build`), donc rien à faire
manuellement sur le serveur.

**La construction n'a pas besoin de la base.** Le client Prisma est créé
paresseusement (`lib/prisma.ts`), donc `next build` réussit même sans
`DATABASE_URL` — seule l'exécution en a besoin.

**Sauvegardes.** Le dossier monté sur `UPLOADS_DIR` et la base vont ensemble :
sauvegarder l'un sans l'autre laisse des articles dont les fichiers manquent, ou
des fichiers orphelins.

**Migrer les fichiers existants.** Les fichiers déjà présents dans `uploads/` en
local ne sont pas dans Git. Pour les retrouver en ligne, copiez-les dans le
volume, ou téléversez-les à nouveau depuis l'espace praticien.
