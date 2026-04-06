# DevOps — Doctor-Patient App (Oshadhi)

> Infrastructure and deployment documentation for the Doctor-Patient platform.
> Maintained by: DevOps Engineer (Contributor)

---

## Overview

This folder contains the complete infrastructure and deployment documentation
for the Doctor-Patient App — a healthcare appointment platform built
with React, Node.js, PostgreSQL, and Agora RTC for video consultations.

---

## Deployment Strategy

The deployment follows a 3-phase approach:
- Local verification — full stack runs on localhost, no Docker
- Containerization — Docker Compose orchestrates all services
- AWS Cloud — Docker Compose deployed to EC2 for production

This approach ensures the app is fully verified before any cloud costs are incurred,
and allows the client to review a working demo before committing to AWS infrastructure.

---

## Phases

### ✅ Phase 1 — Local Development
**Status: Complete**

Full stack verified running locally on Windows:
- PostgreSQL 18 (local) on port 5432
- Node.js + Express backend on port 5000
- React + Vite frontend on port 5173
- All 3 roles verified end-to-end (Admin, Doctor, Patient)
- Full appointment lifecycle verified (register → approve → book → call → end)
- Agora video call token generation confirmed

→ See [local-setup.md](./local-setup.md)

---

### ✅ Phase 2 — Docker Compose
**Status: Complete**

All services containerized into a single `docker-compose.yaml`:
- `oshadhi_db` → PostgreSQL 16 container (host port 5433)
- `oshadhi_backend` → Node.js API container (port 5000)
- `oshadhi_frontend` → React app served via Nginx (port 80)
- Single `docker compose up -d` runs the entire stack
- Prisma migrations run automatically on backend startup
- Nginx proxies `/api/*` requests to backend container

→ See [docker-setup.md](./docker-setup.md)

---

### ⏳ Phase 3 — AWS EC2 Deploy
**Status: Planned**

Docker Compose stack deployed to AWS EC2:
- Single EC2 instance (t3.medium)
- Docker + Docker Compose installed on EC2
- Repo cloned on EC2, `.env` configured, `docker compose up -d`
- Nginx reverse proxy for routing
- EC2 public IP for client demo
- After client approval → migrate to client AWS account

→ See [aws-ec2-setup.md](./aws-ec2-setup.md)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL 18 (local) / PostgreSQL 16 (Docker) |
| Video | Agora RTC (token-based) |
| Containerization | Docker 28, Docker Compose v2 |
| Cloud | AWS EC2 |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions (Phase 3) |

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code — client's repo |
| `staging` | DevOps changes and fixes before PR |

**Workflow:**

local changes → staging branch → push to fork → PR → client merges → main

Never push directly to `main` on the client repo.

---

## Environment Files

| File | Location | Committed |
|------|----------|-----------|
| Backend env | `backend/.env` | ❌ Never |
| Frontend env | `frontend/.env` | ❌ Never |
| Env template | `backend/.env.example` | ✅ Yes (no secrets) |

---

## Folder Structure

devops/
├── README.md          ← this file — overview of all phases
├── local-setup.md     ← Phase 1: local development setup guide
├── docker-setup.md    ← Phase 2: Docker Compose setup guide
└── aws-ec2-setup.md   ← Phase 3: AWS EC2 deployment guide

---

## 👤 Author

**Adapala Sriharsha Reddy**
Cloud & DevOps Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/sriharshareddy-adapala-781a76299/)
[![Gmail](https://img.shields.io/badge/Gmail-Mail-red)](mailto:adapalasriharshareddy@gmail.com)