# Merror ✨

> Yelp for good vibes — a positivity and gamification social app where you scan QR codes or search usernames to send compliments, helpful act shoutouts, or wholesome memories.

## Tech Stack

| Layer | Tech |
|---|---|
| Monorepo | pnpm workspaces |
| API | NestJS 10 + Prisma 5 + PostgreSQL |
| Web | Next.js 14 App Router + Tailwind CSS |
| Mobile | Expo ~50 + Expo Router ~3.4 |
| Shared | Zod schemas + TypeScript types |
| DB (local) | PostgreSQL 16 (Docker) |

---

## Prerequisites

- [Node.js 20+](https://nodejs.org)
- [pnpm 9+](https://pnpm.io/installation) — `npm i -g pnpm`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Local Setup

### 1. Clone & Install

```bash
git clone <your-repo-url> merror
cd merror
pnpm install
```

### 2. Start the Database

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:
- User: `merror`
- Password: `merror_password`
- Database: `merror_db`

### 3. Configure API Environment

```bash
cp apps/api/.env.example apps/api/.env
```

The `.env.example` default values work with the Docker setup out of the box.

Edit `apps/api/.env` to change JWT secrets (recommended):

```env
DATABASE_URL="postgresql://merror:merror_password@localhost:5432/merror_db"
JWT_SECRET="change-me-to-a-random-secret"
JWT_REFRESH_SECRET="change-me-to-another-random-secret"
PORT=4000
NODE_ENV=development
WEB_ORIGIN=http://localhost:3000
```

### 4. Configure Web Environment

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Default content:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 5. Run Migrations & Seed

```bash
# Push schema to DB (dev shortcut, no migration files)
pnpm db:push

# Seed with 6 sample users + feedback
pnpm db:seed
```

Or create a proper migration:
```bash
pnpm db:migrate
```

### 6. Start Services

In separate terminals:

```bash
# Terminal 1 — API (port 4000)
pnpm dev:api

# Terminal 2 — Web (port 3000)
pnpm dev:web

# Terminal 3 — Mobile (optional)
pnpm dev:mobile
```

Open [http://localhost:3000/en/feed](http://localhost:3000/en/feed) in your browser.

---

## Seeded Test Accounts

| Username | Email | Password |
|---|---|---|
| maya_chen | maya@merror.app | Password123! |
| javi_reyes | javi@merror.app | Password123! |
| priya_s | priya@merror.app | Password123! |
| tom_okafor | tom@merror.app | Password123! |
| lena_bauer | lena@merror.app | Password123! |
| alex_rivera | alex@merror.app | Password123! |

---

## API Endpoints

All routes prefixed with `/api`.

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Create account |
| POST | `/auth/login` | — | Login, get tokens |
| POST | `/auth/refresh` | refresh token | Refresh access token |
| POST | `/auth/logout` | — | Clear cookie |
| GET | `/auth/me` | ✅ | Get current user |

### Users
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/users/search?q=` | — | Search users |
| GET | `/users/:id` | — | Get user + feedback by ID |
| GET | `/users/username/:username` | — | Get user by username |
| GET | `/users/qr/:qrCode` | — | Resolve QR code |
| PATCH | `/users/me` | ✅ | Update own profile |

### Feedback
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/feedback` | ✅ | Create feedback |
| GET | `/feedback?page=&limit=` | — | Paginated public feed |
| GET | `/feedback/received` | ✅ | My received feedback |
| GET | `/feedback/given` | ✅ | My given feedback |

### Friends
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/friends` | ✅ | Send friend request |
| PATCH | `/friends/:id/accept` | ✅ | Accept request |
| DELETE | `/friends/:id` | ✅ | Remove friend/decline |
| GET | `/friends` | ✅ | List accepted friends |
| GET | `/friends/pending` | ✅ | List pending requests |

---

## Environment Variables

### API (`apps/api/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | see .env.example |
| `JWT_SECRET` | Access token signing secret | — |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | — |
| `PORT` | API server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `WEB_ORIGIN` | CORS allowed origin | `http://localhost:3000` |

### Web (`apps/web/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:4000` |

### Mobile (optional `apps/mobile/.env`)

| Variable | Description | Default |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | API base URL | `http://localhost:4000` |

---

## Useful Commands

```bash
# DB management
pnpm db:push       # Push schema changes (dev)
pnpm db:migrate    # Create & run migration
pnpm db:seed       # Seed sample data
pnpm db:studio     # Open Prisma Studio GUI

# Build
pnpm build:api
pnpm build:web
```

---

## Deployment

### API → Render
1. Connect your repo to [render.com](https://render.com)
2. Use `render.yaml` — it creates a Web Service + PostgreSQL database automatically
3. Set `WEB_ORIGIN` env var to your Vercel URL after deploying the web app

### Web → Vercel
1. Import repo in [vercel.com](https://vercel.com)
2. Set **Root Directory** to `apps/web`
3. Set `NEXT_PUBLIC_API_URL` to your Render API URL

---

## Project Structure

```
merror/
├── apps/
│   ├── api/                 # NestJS API
│   │   ├── prisma/          # Schema + seed
│   │   └── src/
│   │       ├── auth/        # JWT auth
│   │       ├── users/       # User CRUD
│   │       ├── feedback/    # Feedback CRUD
│   │       └── friends/     # Friend system
│   ├── web/                 # Next.js 14 web app
│   │   └── src/
│   │       ├── app/[locale] # Locale-prefixed routes
│   │       ├── components/  # Shared UI
│   │       ├── context/     # Auth context
│   │       └── lib/         # API client
│   └── mobile/              # Expo React Native
│       ├── app/             # Expo Router screens
│       └── src/             # Shared logic + components
└── packages/
    └── shared/              # Zod schemas, types, helpers
```
