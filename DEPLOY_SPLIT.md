# vcars-api - despliegue LAB y PROD separados

## Convención
- LAB:
  - API: `4000`
  - DB: `5432` (solo localhost)
  - Compose: `docker-compose.lab.yml`
  - Env: `.env.lab`
- PROD:
  - API: `4010`
  - DB: `5433` (solo localhost)
  - Compose: `docker-compose.prod.yml`
  - Env: `.env.prod`

## 1) Levantar LAB
```bash
cp .env.lab.example .env.lab
docker compose -f docker-compose.lab.yml up -d --build
curl -I http://127.0.0.1:4000/healthz
```

## 2) Levantar PROD (base limpia)
```bash
cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml up -d --build
curl -I http://127.0.0.1:4010/healthz
```

`prisma migrate deploy` corre en el arranque del contenedor API, por lo tanto la DB de producción se crea limpia con las migrations actuales.

## 3) Workflows por rama
- `lab` -> `.github/workflows/deploy-lab.yml`
- `main` -> `.github/workflows/deploy-prod.yml`
