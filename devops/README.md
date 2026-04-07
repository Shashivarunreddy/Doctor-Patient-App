# DevOps — Doctor-Patient App (Oshadhi)

🚀 Production-ready deployment pipeline established
> Infrastructure and deployment documentation for the Doctor-Patient platform.
> Maintained by: DevOps Engineer (Contributor)

---

## Overview

This folder contains the complete infrastructure and deployment documentation
for the Doctor-Patient App — a healthcare appointment platform built
with React, Node.js, PostgreSQL, and Agora RTC for video consultations.

---

## Deployment Strategy

The deployment follows a **4-phase approach**:

* Local verification — full stack runs on localhost
* Containerization — Docker Compose orchestrates all services
* AWS Cloud — image-based deployment on EC2 using DockerHub
* CI/CD Pipelines — automated deployment using GitHub Actions

This ensures:

* Full validation before cloud deployment
* Clean separation between development and production
* Scalable and automated deployment workflow

---

## Final Status

```text
Phase 1 — Local            ✅ Complete
Phase 2 — Docker           ✅ Complete
Phase 3 — EC2              ✅ Complete
Phase 4 — CI/CD            ✅ Complete
```

---

## Phases

### ✅ Phase 1 — Local Development

**Status: Complete**

Full stack verified running locally on Windows:

* PostgreSQL 18 (local) on port 5432
* Node.js + Express backend on port 5000
* React + Vite frontend on port 5173
* All roles verified end-to-end (Admin, Doctor, Patient)
* Appointment lifecycle validated (register → approve → book → call → end)
* Agora token generation confirmed

→ See [local-setup.md](./local-setup.md)

---

### ✅ Phase 2 — Docker Compose

**Status: Complete**

Containerized full stack using build-based setup:

* `oshadhi_db` → PostgreSQL container
* `oshadhi_backend` → Node.js API container
* `oshadhi_frontend` → React app via Nginx
* Single command deployment (`docker compose up -d`)
* Prisma migrations executed on backend startup

→ See [docker-setup.md](./docker-setup.md)

---

### ✅ Phase 3 — AWS EC2 Deployment

**Status: Complete**

Production deployment using **image-based containerization**:

* EC2 instance (t3.medium) with Docker installed
* Elastic IP assigned for stable public access
* No source code on EC2 (runtime-only setup)
* Images pulled from DockerHub:

  * backend image
  * frontend image
* Deployment via:

  ```bash
  docker compose pull
  docker compose up -d
  ```
* Services exposed:

  * Frontend → port 80
  * Backend → port 5000
  * Database → internal container network

→ See [ec2-setup.md](./ec2-setup.md)

---

### ✅ Phase 4 — CI/CD Automation

**Status: Complete**

Automated build and deployment using GitHub Actions:

* Backend CI → builds & pushes backend image
* Frontend CI → builds & pushes frontend image
* Deploy workflow → SSH into EC2 and updates containers
* Fully automated flow:

  ```text
  push → build → push → deploy → live
  ```
* Manual trigger support for debugging (`workflow_dispatch`)

→ See [cicd-setup.md](./cicd-setup.md)

---

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Frontend         | React 18, Vite, TypeScript                     |
| Backend          | Node.js, Express, TypeScript, Prisma ORM       |
| Database         | PostgreSQL 18 (local) / PostgreSQL 16 (Docker) |
| Video            | Agora RTC                                      |
| Containerization | Docker, Docker Compose                         |
| Cloud            | AWS EC2                                        |
| Reverse Proxy    | Nginx                                          |
| CI/CD            | GitHub Actions                                 |

---

## Branch Strategy

| Branch    | Purpose                             |
| --------- | ----------------------------------- |
| `main`    | Production-ready code (client repo) |
| `staging` | DevOps changes before PR            |

**Git Workflow:**

local → staging → PR → client review → merge to main

Never push directly to `main`.

---

## Environment Files

| File         | Location         | Committed |
| ------------ | ---------------- | --------- |
| Backend env  | `backend/.env`   | ❌ Never   |
| Frontend env | `frontend/.env`  | ❌ Never   |
| EC2 env      | `ec2-setup/.env` | ❌ Never   |
| Env template | `.env.example`   | ✅ Yes     |

---

## Folder Structure

```text
devops/
├── README.md
├── local-setup.md
├── docker-setup.md
├── cloud-setup.md
├── cicd-setup.md
```

---

## 👤 Author

**Adapala Sriharsha Reddy**
Cloud & DevOps Engineer

[LinkedIn](https://www.linkedin.com/in/sriharshareddy-adapala-781a76299/)
[Gmail](mailto:adapalasriharshareddy@gmail.com)

---

## Final Status

```text
Phase 1 — Local            ✅ Complete
Phase 2 — Docker           ✅ Complete
Phase 3 — EC2              ✅ Complete
Phase 4 — CI/CD            ✅ Complete
```


