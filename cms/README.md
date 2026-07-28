# Astauria CMS - Backoffice Complet

CMS sur-mesure pour gérer le contenu du site Astauria.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- PostgreSQL 15+ (ou Docker)
- NPM ou Yarn

### Installation

```bash
# 1. Installer les dépendances locales
cd cms
npm install
cd apps/api && npm install
cd ../admin && npm install
cd ../..

# 2. Configurer l'API locale
cp apps/api/.env.example apps/api/.env
# Renseigner au minimum DATABASE_URL et JWT_SECRET

# 3. Démarrer PostgreSQL (via Docker)
docker compose up -d postgres

# 4. Appliquer les migrations
npm run db:migrate

# 5. Renseigner SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD (12 caractères minimum),
# puis créer le compte administrateur et le contenu initial
npm run db:seed

# 6. Démarrer les serveurs
npm run dev
```

### Démarrage complet avec Docker

```bash
cd cms
cp .env.example .env
# Remplacer impérativement POSTGRES_PASSWORD et JWT_SECRET dans .env
docker compose up -d --build

# À exécuter une seule fois pour créer le premier compte administrateur
docker compose exec \
  -e SEED_ADMIN_EMAIL=admin@example.com \
  -e SEED_ADMIN_PASSWORD='un-mot-de-passe-fort' \
  api npx prisma db seed
```

Le seed est idempotent : il complète les contenus absents sans écraser les
modifications réalisées ensuite dans le CMS. Les leads de démonstration ne sont
créés que si `SEED_DEMO_LEADS=true` est explicitement fourni.

### URLs

| Service | URL |
|---------|-----|
| **Admin** | http://localhost:5173 |
| **API** | http://localhost:3001 |
| **Swagger** | http://localhost:3001/api/docs |

## 📁 Structure

```
cms/
├── apps/
│   ├── api/          # Backend NestJS
│   └── admin/        # Frontend React
├── templates/        # Templates HTML
└── output/           # Site généré
```

## 🛠️ Modules

| Module | Description |
|--------|-------------|
| 🔐 Auth | Login JWT + RBAC |
| 📍 Navigation | Menus header/footer |
| 📰 Blog | Articles + catégories |
| ❓ FAQ | Questions + Schema.org |
| 💬 Témoignages | Avis clients |
| 📊 Cas d'étude | ROI + métriques |
| 🖼️ Médias | Upload + optimisation |
| 🔍 SEO | Meta + sitemap |

## 🎨 Thème Astauria

- **Navy** : `#0a1930`
- **Gold** : `#d4af37`

## 📦 Déploiement Cloud

Compatible avec :
- Railway
- Render
- Vercel (frontend)
- Supabase (DB)
