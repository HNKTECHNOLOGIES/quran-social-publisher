# Quran Social Publisher

Application SaaS pour publier automatiquement du contenu islamique authentique (Coran + Tafsir) sur Facebook en **arabe**, **français** et **anglais**.

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | NestJS, TypeScript, Prisma, PostgreSQL, Redis |
| Frontend | Next.js 15, application mobile (PWA) |
| Auth | JWT |
| Déploiement | Docker, Railway |

## Phase 2 (actuelle)

- Intégration API [Quran.com](https://api.quran.com/api/v4)
- Recherche par mot-clé, sourate ou numéro de verset
- Traductions FR (Montada) et EN (Saheeh International)
- Tafsirs autorisés : Ibn Kathir, Al-Sa'di (Al-Jalalayn si disponible via l'API)
- Cache Redis + persistance PostgreSQL

## Phase 1

- Monorepo NestJS + Next.js
- Schéma Prisma (`users`, `verses`, `tafsirs`, `posts`, `facebook_accounts`)
- Authentification JWT admin
- Tableau de bord (statistiques publications)
- Health check + Swagger

## Démarrage local

```bash
docker compose up -d
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

### Compte admin (seed)

- Email : `admin@qsp.local`
- Mot de passe : `Admin123!`

### Application mobile

Le frontend Next.js est l’application mobile : colonne téléphone, barre d’onglets, sourates, verset et recherche. Elle s’installe depuis le navigateur (`manifest`, écran d’accueil).

L’app native Expo (`apps/mobile`) reprend le même parcours sur Android et iOS. Elle appelle la même API.

```bash
cd apps/mobile
npm install
npm run web
```

- Web : http://localhost:8081
- Android / iOS : `npm run android` ou `npm run ios` (Expo Go, SDK 58)
- API : `EXPO_PUBLIC_API_URL` (défaut `http://localhost:3002/api`)

Le serveur de développement web tourne sur le port 8081, déjà autorisé dans `CORS_ORIGIN`.

### URLs

- Application mobile : http://localhost:3000
- Application mobile (web) : http://localhost:8081
- API : http://localhost:3002/api
- Swagger : http://localhost:3002/api/docs

## Roadmap

| Phase | Fonctionnalités |
|-------|-----------------|
| 2 | ✅ API Quran.com, tafsir, recherche versets |
| 3 | Génération GPT trilingue |
| 4 | Facebook Graph API, cron 08h00 |
