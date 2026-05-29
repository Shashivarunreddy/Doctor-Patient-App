# CI/CD Setup — GitHub Actions
> Doctor-Patient App (Oshadhi) | Updated: May 2026

---

## Overview
This document describes the automated CI/CD pipeline for the Doctor-Patient App.

The pipeline uses GitHub Actions to:
- Build Docker images (frontend & backend) with SHA and latest tags
- Push images to DockerHub
- Deploy exact SHA-tagged images to AWS EC2 via SSH
- Automatically prune old images on EC2 to save disk space

---

## Architecture

```text
Developer Push to main
        ↓
GitHub Actions CI
        ↓
Build Docker Images
(tagged: latest + git SHA)
        ↓
Push to DockerHub
        ↓
GitHub Actions CD (main only)
        ↓
SSH into EC2
        ↓
docker pull <image>:<git-sha>
docker compose up -d --force-recreate
docker image prune -f
        ↓
Exact SHA version live on EC2 ✅
```

---

## Branch Strategy

| Branch | CI | CD |
|--------|----|----|
| `main` | ✅ Runs | ✅ Deploys to EC2 |
| `staging` | ✅ Runs | ❌ No deploy |

> ⚠️ CD only triggers on `main` branch merges.
> Staging CI runs to validate builds without deploying to production.

---

## Workflow Design

### CI — Continuous Integration

Two independent workflows triggered by path filters:

**1. Backend CI**
- Trigger: push to `main` or `staging` with changes in `backend/**`
- Builds backend Docker image
- Tags with `latest` AND `git SHA`
- Pushes both tags to DockerHub

**2. Frontend CI**
- Trigger: push to `main` or `staging` with changes in `frontend/**`
- Builds frontend Docker image
- Injects `VITE_API_URL=/api` via build args
- Tags with `latest` AND `git SHA`
- Pushes both tags to DockerHub

### CD — Continuous Deployment

Single deploy workflow:
- Trigger: after CI workflows complete on `main` branch
- OR manual trigger via `workflow_dispatch`
- SSHs into EC2
- Pulls **exact SHA-tagged images** from DockerHub
- Updates `docker-compose.yaml` image references via env vars
- Recreates all containers with new images
- Prunes old unused images

---

## Image Tagging Strategy

Every CI build produces two tags:

| Tag | Example | Purpose |
|-----|---------|---------|
| `latest` | `doc-backend:latest` | Always points to most recent build |
| `git SHA` | `doc-backend:ebb340b` | Exact commit reference for rollback |

**Why SHA-based CD deployment:**
```
CI builds → doc-backend:ebb340b + doc-backend:latest
CD pulls  → doc-backend:ebb340b (exact version tested in CI)
EC2 runs  → exact SHA that passed CI — no surprises
Rollback  → set image to old SHA → redeploy → instant recovery
```

---

## Rollback Procedure

If a deployment breaks production:

```bash
# 1. SSH into EC2
ssh -i key.pem ubuntu@<EC2_HOST>

# 2. Set image to last known good SHA
export BACKEND_IMAGE=sriharshareddy6464/doc-backend:<last-good-sha>
export FRONTEND_IMAGE=sriharshareddy6464/doc-frontend:<last-good-sha>

# 3. Restart with old version
cd doctoroncall
docker compose up -d --force-recreate

# 4. Verify
docker compose ps
curl http://localhost/api/health
```

> Find SHA tags in DockerHub → repository → Tags tab

---

## GitHub Secrets Required

Navigate to:
```
Repository → Settings → Secrets and variables → Actions
```

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | DockerHub username |
| `DOCKERHUB_TOKEN` | DockerHub access token (NOT password) |
| `EC2_HOST` | EC2 Elastic IP address |
| `EC2_USER` | SSH user (`ubuntu`) |
| `EC2_SSH_KEY` | Full content of `.pem` private key |

---

## DockerHub Token Setup

1. Go to DockerHub → Account Settings → Personal Access Tokens
2. Click **Generate new token**
3. Name it → `github-actions`
4. Copy token → store as `DOCKERHUB_TOKEN` in GitHub secrets

> ⚠️ Never use DockerHub password — use access token only

---

## EC2 SSH Key Setup

```bash
# Copy full content of your .pem file
cat your-key.pem
```

Copy everything including headers:
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

Paste as `EC2_SSH_KEY` in GitHub secrets.

---

## Workflow Files

### `.github/workflows/backend-ci.yml`

```yaml
name: Backend CI

on:
  push:
    branches: ["main", "staging"]
    paths:
      - 'backend/**'

jobs:
  build-and-push-backend:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to DockerHub
        run: echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin

      - name: Build and push backend image
        run: |
          docker build \
            -t ${{ secrets.DOCKERHUB_USERNAME }}/doc-backend:latest \
            -t ${{ secrets.DOCKERHUB_USERNAME }}/doc-backend:${{ github.sha }} \
            ./backend
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/doc-backend:latest
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/doc-backend:${{ github.sha }}
```

---

### `.github/workflows/frontend-ci.yml`

```yaml
name: Frontend CI

on:
  push:
    branches: ["main", "staging"]
    paths:
      - 'frontend/**'

jobs:
  build-and-push-frontend:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to DockerHub
        run: echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin

      - name: Build and push frontend image
        run: |
          docker build \
            --build-arg VITE_API_URL=/api \
            -t ${{ secrets.DOCKERHUB_USERNAME }}/doc-frontend:latest \
            -t ${{ secrets.DOCKERHUB_USERNAME }}/doc-frontend:${{ github.sha }} \
            ./frontend
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/doc-frontend:latest
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/doc-frontend:${{ github.sha }}
```

---

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to EC2

on:
  workflow_run:
    workflows: ["Backend CI", "Frontend CI"]
    branches: ["main"]
    types:
      - completed
  workflow_dispatch:

jobs:
  deploy:
    if: >
      github.event_name == 'workflow_dispatch' ||
      (github.event.workflow_run.conclusion == 'success' &&
       github.event.workflow_run.head_branch == 'main')
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.EC2_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa

      - name: Add EC2 to known hosts
        run: |
          ssh-keyscan -H ${{ secrets.EC2_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy on EC2
        run: |
          ssh ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} << EOF
            cd doctoroncall

            # Pull exact SHA-tagged images
            docker pull ${{ secrets.DOCKERHUB_USERNAME }}/doc-backend:${{ github.event.workflow_run.head_sha || github.sha }}
            docker pull ${{ secrets.DOCKERHUB_USERNAME }}/doc-frontend:${{ github.event.workflow_run.head_sha || github.sha }}

            # Set image versions via env vars
            export BACKEND_IMAGE=${{ secrets.DOCKERHUB_USERNAME }}/doc-backend:${{ github.event.workflow_run.head_sha || github.sha }}
            export FRONTEND_IMAGE=${{ secrets.DOCKERHUB_USERNAME }}/doc-frontend:${{ github.event.workflow_run.head_sha || github.sha }}

            # Restart containers with new images
            docker compose up -d --force-recreate

            # Cleanup old images
            docker image prune -f
          EOF
```

---

## docker-compose.yaml Image References

For SHA-based CD to work, `docker-compose.yaml` uses env vars for image tags:

```yaml
backend:
  image: ${BACKEND_IMAGE:-sriharshareddy6464/doc-backend:latest}

frontend:
  image: ${FRONTEND_IMAGE:-sriharshareddy6464/doc-frontend:latest}
```

- Default (`latest`) used for local dev and manual deploys
- SHA tag injected by CD workflow for production deploys

---

## Deployment Flow

```text
Push to main
      ↓
CI triggered (backend and/or frontend)
      ↓
Images built → tagged latest + SHA
      ↓
Both tags pushed to DockerHub
      ↓
CD triggered (main branch only)
      ↓
SSH into EC2
      ↓
docker pull doc-backend:<sha>
docker pull doc-frontend:<sha>
      ↓
BACKEND_IMAGE=doc-backend:<sha>
FRONTEND_IMAGE=doc-frontend:<sha>
      ↓
docker compose up -d --force-recreate
      ↓
docker image prune -f
      ↓
Exact SHA version live on EC2 ✅
```

---

## Manual Deployment (Fallback)

```bash
# SSH into EC2
ssh -i key.pem ubuntu@<EC2_HOST>

cd doctoroncall

# Deploy latest
docker compose pull
docker compose up -d --force-recreate
docker image prune -f

# Deploy specific SHA
export BACKEND_IMAGE=sriharshareddy6464/doc-backend:<sha>
export FRONTEND_IMAGE=sriharshareddy6464/doc-frontend:<sha>
docker compose up -d --force-recreate
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Docker login fails | Wrong token | Regenerate DockerHub access token |
| SSH connection fails | Wrong key or host | Verify `EC2_SSH_KEY`, `EC2_HOST`, `EC2_USER` |
| CD not triggering | Branch not main | CD only runs on main — check branch |
| Old version still running | Cache issue | Run `docker compose up -d --force-recreate` |
| Backend CI fails | Dockerfile issue | Check build logs, fix locally first |
| Disk full on EC2 | Old images piling up | `docker system prune -f` on EC2 |
| SHA image not found | CI didn't run for that service | Check if CI was triggered for that path |

---

## Security Notes

- Never commit `.env` files to repo
- Store all secrets in GitHub Actions secrets only
- Rotate DockerHub token periodically
- EC2 security group — port 22 restricted to known IPs only
- Backend port 5000 not exposed publicly — accessible via Nginx only

---

## Next Scope
- [ ] HTTPS via SSL certificate
- [ ] Domain name integration
- [ ] Auto rollback on failed healthcheck
- [ ] Slack/email notifications on deploy failure
- [ ] Multi-environment setup (staging EC2 + production EC2)