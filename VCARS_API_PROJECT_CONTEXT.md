# VCARS API Project Context (Handoff)

Updated: 2026-03-16  
Repo root: `/Users/macbook/Documents/VCARS-API`  
Remote: `https://github.com/julianchocmanrique/vcars-api`

## 1) What this project is

`vcars-api` is the backend API for VCARS workshop flow.

Tech stack:
- Fastify (Node)
- Prisma + PostgreSQL
- Zod validation
- JWT auth (`@fastify/jwt`)
- Swagger docs (`/docs`)

Main runtime entry:
- [src/index.ts](/Users/macbook/Documents/VCARS-API/src/index.ts)

## 2) Branch model

Current branch:
- `main` (tracking `origin/main`)

## 3) Environment contract

From `.env.example`:

```env
PORT=4000
DATABASE_URL=postgresql://vcars:vcars@db:5432/vcars?schema=public
CORS_ORIGIN=*

JWT_SECRET=change-me
SEED_DEMO_USERS=true

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM="V-CARS <no-reply@vcars.local>"
```

## 4) Local runbook

Install:

```bash
cd /Users/macbook/Documents/VCARS-API
npm install
```

Run dev:

```bash
npm run dev
```

Database migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Production migration deploy:

```bash
npm run prisma:deploy
```

## 5) Exposed endpoints (current)

Base:
- `GET /` -> basic service info
- `GET /healthz` -> health check
- `GET /docs` -> Swagger UI

Auth:
- `POST /auth/login`
  - body: `{ username, password }`
  - returns: `{ ok, token, user }`
- `GET /auth/me` (JWT required)

Customers:
- `POST /customers` (ADMIN, TECH)
- `GET /customers` (ADMIN, TECH)

Vehicles:
- `POST /vehicles` (ADMIN, TECH)
  - supports nested `customer` (id or name)
- `GET /vehicles` (ADMIN, TECH)
  - query supports `plate`, `take`
- `GET /vehicles/:plate` (JWT required)
  - includes customer and recent entries

Entries:
- `POST /vehicles/:vehicleId/entries` (ADMIN, TECH)
  - fields: `receivedBy`, `notes`, `mileageKm`, `fuelLevel`

Note:
- Quotes/notifications are still TODO in code comments.

## 6) Auth and roles

Roles are enum-based:
- `ADMIN`
- `TECH`
- `CLIENT`

Role guard pattern:
- `requireRoles(...roles)` middleware in [src/index.ts](/Users/macbook/Documents/VCARS-API/src/index.ts)

JWT token payload:
- `sub`
- `username`
- `role`

Token TTL:
- 7 days

Demo users seeding:
- controlled by `SEED_DEMO_USERS=true`
- creates users:
  - `admin` / `1234`
  - `tecnico` / `1234`
  - `cliente` / `1234`

## 7) Prisma data model (current)

Main models:
- `User`
- `Customer`
- `Vehicle`
- `Entry`
- `InternalQuote`
- `FormalQuote`
- `QuoteItem`
- `Notification`

Key enums:
- `UserRole`
- `VehicleStatus`

Schema source:
- [prisma/schema.prisma](/Users/macbook/Documents/VCARS-API/prisma/schema.prisma)

Recent migration for auth:
- [prisma/migrations/20260313150452_add_user_auth/migration.sql](/Users/macbook/Documents/VCARS-API/prisma/migrations/20260313150452_add_user_auth/migration.sql)

## 8) Important integration notes for VCARS app

The mobile app (`VCARS`) currently points to:
- `http://187.124.65.93:4000`

So backend should:
- be reachable publicly from simulator/device
- return CORS-allowed responses for app origin

If app login fails with network errors:
- verify API host/port reachability
- verify JWT/CORS env vars
- verify server is running and logs requests

## 9) Known gaps / pending work

- Formal quote workflow endpoints are not fully exposed yet.
- Notification sending workflow exists at model level but not fully implemented at route level.
- No dedicated refresh token flow; auth is JWT-only current model.

## 10) Quick verification checklist

1. `GET /healthz` returns `{ ok: true }`
2. `POST /auth/login` returns token for demo users
3. `GET /vehicles` works with ADMIN/TECH token
4. `GET /vehicles/:plate` returns vehicle with entries
5. `POST /vehicles/:vehicleId/entries` creates entry successfully

