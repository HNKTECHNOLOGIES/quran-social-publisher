# Quran Social Publisher

Application SaaS pour publier automatiquement du contenu islamique authentique (Coran + Tafsir) sur Facebook en **arabe**, **français** et **anglais**.

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | NestJS, TypeScript, Prisma, PostgreSQL, Redis |
| Frontend | Next.js 15, TailwindCSS |
| Auth | JWT |
| Déploiement | Docker, Railway |

## Phase 1 (actuelle)

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

### URLs

- Frontend : http://localhost:3000
- API : http://localhost:3002/api
- Swagger : http://localhost:3002/api/docs

## Roadmap

| Phase | Fonctionnalités |
|-------|-----------------|
| 2 | API Quran.com, tafsir, recherche versets |
| 3 | Génération GPT trilingue |
| 4 | Facebook Graph API, cron 08h00 |
