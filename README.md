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
