# vcars-api - despliegue separado API + DB

## 1) Levantar DB
```bash
docker compose -f docker-compose.db.yml up -d
```

## 2) Levantar API
```bash
cp .env.example .env
# verificar DATABASE_URL, CORS_ORIGIN, JWT_SECRET
docker compose -f docker-compose.api.yml up -d --build
```

## 3) Verificación
```bash
curl -I http://127.0.0.1:4000/healthz
```
