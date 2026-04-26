# vcars-api

Backend API for VCARS.

## Stack
- Fastify (Node)
- Prisma
- Zod

## Local dev
```bash
npm i
npm run dev
```

## Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

## Env
Copy `.env.example` to `.env` and fill values.

> Note: `.env` is intentionally **not committed**.

## Split deploy (API separado de DB)

- DB only: `docker-compose.db.yml`
- API only: `docker-compose.api.yml`
- Guía rápida: `DEPLOY_SPLIT.md`
