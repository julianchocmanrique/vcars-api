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

## Split deploy (LAB/PROD)

- LAB: `docker-compose.lab.yml` + `.env.lab`
- PROD: `docker-compose.prod.yml` + `.env.prod`
- Guía rápida: `DEPLOY_SPLIT.md`
- Workflows:
  - `.github/workflows/deploy-lab.yml` (rama `lab`)
  - `.github/workflows/deploy-prod.yml` (rama `main`)
