````markdown id="cicd8md"
# 🚀 CI/CD Setup — GitHub Actions 

## Overview
This document describes the automated CI/CD pipeline for the Doctor-Patient App.

The pipeline uses GitHub Actions to:
- Build Docker images (frontend & backend)
- Push images to DockerHub
- Deploy updated containers to AWS EC2 via SSH

---

## Architecture

```text
Developer Push
      ↓
GitHub Actions (CI)
      ↓
Build Docker Images
      ↓
Push to DockerHub
      ↓
GitHub Actions (CD)
      ↓
SSH into EC2
      ↓
docker compose pull
docker compose up -d
      ↓
Updated Application Live
````

---

## Workflow Design

### CI (Continuous Integration)

Two independent workflows:

1. **Backend CI**

   * Trigger: changes in `/backend`
   * Builds backend Docker image
   * Pushes to DockerHub

2. **Frontend CI**

   * Trigger: changes in `/frontend`
   * Builds frontend Docker image
   * Injects API URL via build args
   * Pushes to DockerHub

---

### CD (Continuous Deployment)

Single deploy workflow:

* Trigger:

  * After CI workflows complete (`workflow_run`)
  * OR manual trigger (`workflow_dispatch`)
* Action:

  * SSH into EC2
  * Pull latest images
  * Recreate containers

---

## GitHub Secrets Required

Navigate to:

```text
Repository → Settings → Secrets → Actions
```

Add the following:

| Secret Name        | Description                |
| ------------------ | -------------------------- |
| DOCKERHUB_USERNAME | DockerHub username         |
| DOCKERHUB_TOKEN    | DockerHub access token     |
| EC2_HOST           | EC2 Elastic IP             |
| EC2_USER           | SSH user (`ubuntu`)        |
| EC2_SSH_KEY        | Private key content (.pem) |

---

## DockerHub Token Setup

1. Go to DockerHub → Account Settings → dropdown Settings left menu bar -> personal access tokens 
2. Create **Access Token**
3. Copy token and store as `DOCKERHUB_TOKEN`

⚠️ Do NOT use Docker password

---

## EC2 SSH Key Setup

```bash
cat your-key.pem
```

Copy full content:

```text
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

Paste into GitHub secret:

```text
EC2_SSH_KEY
```

---

## CI Workflows

### Backend Workflow

* Builds image: `doc-backend:latest`
* Pushes to DockerHub

### Frontend Workflow

* Builds image: `doc-frontend:latest`
* Pushes to DockerHub
* Uses:

```text
VITE_API_URL=http://<EC2_HOST>:5000/api
```

---

## CD Workflow

Executes on EC2:

```bash
cd doctoroncall
docker compose pull
docker compose up -d --force-recreate
```

---

## Deployment Flow

```text
Push Code
   ↓
CI Triggered
   ↓
Images Built
   ↓
Images Pushed
   ↓
Deploy Triggered
   ↓
EC2 Updated
```

---

## Manual Deployment (Fallback)

```bash
ssh key.pem ubuntu@<EC2_HOST>
cd doctoroncall
docker compose pull
docker compose up -d --force-recreate
```

---

## Common Issues

### Docker login fails

* Check DOCKERHUB_TOKEN

### SSH fails

* Verify EC2_SSH_KEY
* Check EC2_USER and EC2_HOST

### Deployment not triggered

* Check workflow names match in `workflow_run`

### Old version still running

```bash
docker compose up -d --force-recreate
```

---

## Security Notes

* Never commit `.env`
* Store secrets only in GitHub Actions
* Rotate DockerHub token periodically
* Restrict SSH access in security group

---

## Summary

This CI/CD pipeline enables:

* Automated build → push → deploy
* Consistent production environment
* Zero manual deployment steps

