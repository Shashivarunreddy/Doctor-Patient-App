# Phase 2 — Docker Compose Setup
> Doctor-Patient App (Oshadhi) | Verified: April 2026 | OS: Windows 11

---

## Overview

All three services are containerized and orchestrated with Docker Compose.
A single `docker compose up -d` spins up the entire stack.

**Containers:**

| Container | Image | Host Port | Container Port |
|-----------|-------|-----------|----------------|
| `oshadhi_db` | postgres:16-alpine | 5433 | 5432 |
| `oshadhi_backend` | custom Node.js build | 5000 | 5000 |
| `oshadhi_frontend` | custom Nginx build | 80 | 80 |

> ⚠️ DB container uses host port `5433` to avoid conflict with local PostgreSQL on `5432`

---

## Prerequisites

| Tool | Version Verified | Install |
|------|-----------------|---------|
| Docker | 28.4.0 | https://www.docker.com/products/docker-desktop |
| Docker Compose | v2.39.2 | Comes with Docker Desktop |

---

## Folder Structure

Doctor-Patient-App/
├── docker-compose.yaml         ← orchestrates all 3 containers
├── backend/
│   ├── Dockerfile              ← builds backend image (Node.js + Prisma)
│   ├── .dockerignore           ← excludes node_modules, dist, .env
│   └── .env                    ← secrets (never committed)
└── frontend/
├── Dockerfile              ← builds frontend image (React + Nginx)
├── nginx.conf              ← Nginx routing and proxy config
└── .dockerignore           ← excludes node_modules, dist, .env

---

## Architecture Inside Docker

Browser
↓
http://localhost (port 80)
↓
Nginx (oshadhi_frontend container)
├── /        → serves React SPA from /usr/share/nginx/html
└── /api/*   → proxies to http://backend:5000
↓
Express API (oshadhi_backend container)
↓
PostgreSQL (oshadhi_db container) port 5432

All containers communicate on Docker's internal network.
Only ports 80, 5000, and 5433 are exposed to the host machine.

---

## Step 1 — Environment Setup

Docker Compose reads secrets from `backend/.env`.
Make sure `backend/.env` exists with all required keys:
```env
# Database (local dev only — Docker overrides this)
DATABASE_URL="postgresql://oshadhi_user:<password>@localhost:5432/doctor_patient_app"

# Agora
APP_ID=<agora_app_id>
APP_CERTIFICATE=<agora_app_certificate>

# Server
PORT=5000

# JWT
JWT_ACCESS_SECRET=<strong_random_string>
JWT_REFRESH_SECRET=<strong_random_string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# CORS
FRONTEND_URL=http://localhost

# Admin
ADMIN_EMAIL=admin@oshadhi.com
ADMIN_PASSWORD=<your_admin_password>
```

> ⚠️ `DATABASE_URL` in `backend/.env` is used for local dev only.
> Docker Compose overrides it to `postgresql://oshadhi_user:xxx@db:5432/doctor_patient_app`
> so the backend container talks to the `db` container — not localhost.

---

## Step 2 — Build All Images
```bash
# From root of the project
docker compose build
```

Builds:
- `oshadhi_backend` → compiles TypeScript, generates Prisma client
- `oshadhi_frontend` → builds React app, copies to Nginx html folder
- `oshadhi_db` → pulled directly from Docker Hub (no build needed)

---

## Step 3 — Start All Containers
```bash
docker compose up -d
```

Startup sequence:
→ oshadhi_db starts
→ PostgreSQL ready and healthy on port 5433
→ oshadhi_backend starts (waits for db healthcheck)
→ npx prisma migrate deploy (creates all 5 tables)
→ node dist/server.js
→ Server running on port 5000
→ Admin seeded on first run
→ oshadhi_frontend starts
→ Nginx serves React app on port 80

---

## Step 4 — Verify Everything is Running
```bash
# Check container status
docker compose ps

# Expected:
# oshadhi_db        running (healthy)
# oshadhi_backend   running
# oshadhi_frontend  running
```
```bash
# Backend health check
curl http://localhost:5000/health
# Expected: { "success": true }

# Frontend
curl http://localhost
# Expected: 200 OK

# Nginx proxy to backend
curl http://localhost/api/auth/login
# Expected: validation error (not 404 — proxy is working)
```

---

## Step 5 — Verify Database
```bash
# Connect to running DB container
docker exec -it oshadhi_db psql -U oshadhi_user -d doctor_patient_app

# List all tables
\dt

# Expected:
# User, DoctorProfile, PatientProfile, TimeSlot, Appointment, _prisma_migrations

\q
```

---

## Useful Commands
```bash
# Start all containers
docker compose up -d

# Stop all containers
docker compose down

# Stop and wipe DB volume (full reset)
docker compose down -v

# View live logs (all containers)
docker compose logs -f

# View logs for specific container
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Rebuild a single service
docker compose build backend
docker compose build frontend

# Restart a single container
docker compose restart backend
docker compose restart frontend

# Access container shell
docker exec -it oshadhi_backend sh
docker exec -it oshadhi_frontend sh
docker exec -it oshadhi_db sh
```

---

## Issues Fixed During Phase 2

| Issue | Cause | Fix |
|-------|-------|-----|
| Backend image build failed | COPY path for Prisma folder was wrong | Fixed COPY paths in `backend/Dockerfile` |
| `prisma migrate deploy` crashed | `prisma.config.ts` not copied into image | Added `prisma.config.ts` to COPY in `backend/Dockerfile` |
| Blank env vars in compose | Compose wasn't reading `backend/.env` correctly | Fixed `env_file` path in `docker-compose.yaml` |
| Port 5432 conflict | Local PostgreSQL already on 5432 | Mapped DB container to host port `5433` |

---

## Verified Flows in Docker

- ✅ All 3 containers start cleanly with `docker compose up -d`
- ✅ All 5 Prisma migrations applied automatically on backend startup
- ✅ Admin seeded on first run, skipped on restart
- ✅ `http://localhost:5000/health` returns success
- ✅ `http://localhost` returns 200
- ✅ `http://localhost/api/auth/login` proxied correctly through Nginx
- ✅ Backend logs show clean startup with no errors

---

## Next Step → Phase 3: AWS EC2 Deploy
See [aws-ec2-setup.md](./aws-ec2-setup.md)