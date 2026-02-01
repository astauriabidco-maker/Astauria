# Astauria CMS - Backoffice Complet

CMS sur-mesure pour gérer le contenu du site Astauria.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- PostgreSQL 15+ (ou Docker)
- NPM ou Yarn

### Installation

```bash
# 1. Cloner et installer
cd cms
npm install

# 2. Copier les variables d'environnement
cp apps/api/.env.example apps/api/.env

# 3. Démarrer PostgreSQL (via Docker)
docker-compose up -d postgres

# 4. Appliquer les migrations
npm run db:migrate

# 5. Créer un admin
npm run db:seed

# 6. Démarrer les serveurs
npm run dev
```

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
