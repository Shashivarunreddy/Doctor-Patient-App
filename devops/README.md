# DevOps — Doctor-Patient App

> Infrastructure and deployment documentation for the Doctor-Patient platform.
> Maintained by: DevOps Engineer (Contributer)

---

## Overview

This folder contains the complete infrastructure and deployment documentation
for the Oshadhi Doctor-Patient App — a healthcare appointment platform built
with React, Node.js, PostgreSQL, and Agora RTC for video consultations.

---

## Deployment Strategy

The deployment follows a 3-phase approach 
- local verification ,
- containerization via Docker compose, 
- AWS cloud : EC2 , 

This approach ensures the app is fully verified before any cloud costs are incurred,
and allows the client to review a working demo before committing to AWS infrastructure.

---

## Phases

### ✅ Phase 1 — Local Development
**Status: Complete**

Full stack verified running locally on Windows:
- PostgreSQL 18 (local)
- Node.js + Express backend on port 5000
- React + Vite frontend on port 5173
- All 3 roles verified end-to-end (Admin, Doctor, Patient)
- Agora video call token generation confirmed

→ See [local.md](./local.md)

---

### 🔄 Phase 2 — Docker Compose
**Status: In Progress**

All services containerized into a single `docker-compose.yml`:
- `db` → PostgreSQL container
- `backend` → Node.js API container
- `frontend` → React app served via Nginx container
- Single `docker compose up` runs the entire stack

→ See [docker.md](./docker.md)

---

### ⏳ Phase 3 — AWS EC2 Deploy
**Status: Planned**

Docker Compose stack deployed to AWS EC2:
- Single EC2 instance (t3.medium)
- Nginx reverse proxy for routing
- Domain or EC2 public IP for client demo
- After client approval → migrate to client AWS account with RDS

→ See [aws-ec2.md](./aws-ec2.md)

---

## Tech Stack

| Layer            | Technology                               |
|------------------|------------------------------------------|
| Frontend         | React 18, Vite, TypeScript               |
| Backend          | Node.js, Express, TypeScript, Prisma ORM |
| Database         | PostgreSQL 18                            |
| Video            | Agora RTC (token-based)                  |
| Containerization | Docker, Docker Compose                   |
| Cloud            | AWS EC2                                  |
| Reverse Proxy    | Nginx                                    |
| CI/CD            | GitHub (PR-based workflow)               |

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
├── phase1-local.md    ← local development setup guide
├── phase2-docker.md   ← Docker Compose setup (in progress)
└── phase3-ec2.md      ← AWS EC2 deployment (planned)

## 👤 Author

**Adapala Sriharsha Reddy**
Cloud & DevOps Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/sriharshareddy-adapala-781a76299/)
[![Gmail](https://img.shields.io/badge/Gmail-Mail-red)](mailto:adapalasriharshareddy@gmail.com)

---