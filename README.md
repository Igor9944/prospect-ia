# Prospect IA

Interface publique sur **GitHub Pages**. Moteur IA sur **ta machine**.

- Frontend : https://igor9944.github.io/prospect-ia/
- Backend : `http://127.0.0.1:3001` (Express, Gemini optionnel)

## Architecture

```
Navigateur  →  GitHub Pages (React, statique)
                 │
                 └──►  Backend local :3001  (enrich + outreach)
                          └── GEMINI_API_KEY (optionnel)
```

Le navigateur appelle le backend **sur l’ordinateur qui ouvre le site**. Garde le serveur local allumé pendant que tu travailles.

## Backend local

```bash
cp .env.example .env          # optionnel : coller GEMINI_API_KEY
npm install
npm run backend
```

Santé : `http://127.0.0.1:3001/api/health`

Sans clé Gemini, enrichissement et messages restent disponibles (heuristiques).

## Frontend

Déploiement auto à chaque push sur `main` (GitHub Actions → Pages).

En local, avec le proxy Vite :

```bash
npm run backend     # terminal 1
npm run dev         # terminal 2 → http://localhost:5173
```

Dans l’app (icône réglages), l’URL API par défaut est :

- GitHub Pages → `http://127.0.0.1:3001`
- `npm run dev` → même origine (`/api` proxifié)

Si Chrome bloque l’accès localhost depuis github.io, autorise le réseau local pour ce site, ou utilise `npm run dev`.

## GitHub Pages

Settings → Pages → Source : **GitHub Actions**. Le workflow `.github/workflows/pages.yml` publie le build Vite (`base: /prospect-ia/`).
