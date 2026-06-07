# CI/CD Setup — GitHub Actions

> Doctor-Patient App (Oshadhi)
> Version: v2.2.0

---

# Overview

This document describes the production CI/CD architecture.

The platform uses independent deployment pipelines for frontend and backend workloads.

Frontend and backend deployments are fully decoupled and can be released independently.

---

# Deployment Architecture

## Frontend Deployment

Developer Push
↓
GitHub Actions
↓
npm run build
↓
Generate dist/
↓
Upload to S3
↓
CloudFront Cache Invalidation
↓
Production

---

## Backend Deployment

Developer Push
↓
GitHub Actions
↓
Docker Build
↓
DockerHub

Tags Generated:

* latest
* github SHA

↓

Backend Deploy Workflow

↓

EC2 Backend Container

↓

Production

---

# Branch Strategy

| Branch  | CI | CD |
| ------- | -- | -- |
| main    | ✅  | ✅  |
| staging | ✅  | ❌  |

Production deployments occur only from main.

---

# Frontend CI/CD

## Trigger

frontend/**

## Process

1. Checkout repository
2. Install dependencies
3. Build frontend
4. Upload dist/ to S3
5. Invalidate CloudFront cache

## AWS Services

* S3
* CloudFront
* ACM

---

# Backend CI/CD

## Trigger

backend/**

## Process

1. Build Docker image
2. Tag image as latest
3. Tag image using git SHA
4. Push both images to DockerHub
5. Trigger backend deployment workflow

---

# SHA Deployment Strategy

Backend images are published as:

doc-backend:latest

doc-backend:<git-sha>

Example:

doc-backend:f66d6b7

Benefits:

* Exact deployment traceability
* Easy rollback
* Reproducible production deployments

---

# Deployment Decoupling

Previous architecture required frontend and backend deployments to share a common deployment path.

Result:

* Frontend releases could block backend deployments
* Backend releases could block frontend deployments

Current architecture:

Frontend and backend deploy independently.

---

# GitHub Secrets

## Frontend

AWS_ACCESS_KEY_ID

AWS_SECRET_ACCESS_KEY

AWS_REGION

S3_BUCKET_NAME

CLOUDFRONT_DISTRIBUTION_ID

---

## Backend

DOCKERHUB_USERNAME

DOCKERHUB_TOKEN

EC2_HOST

EC2_USER

EC2_SSH_KEY

---

# Rollback Strategy

## Frontend

Rollback by restoring previous build artifacts in S3.

Invalidate CloudFront cache after restoration.

---

## Backend

Deploy previous SHA image.

Example:

docker pull sriharshareddy6464/doc-backend:<sha>

docker compose up -d backend

---

# Current Production State

Frontend:

S3 + CloudFront

Backend:

Docker Container on EC2

Database:

AWS RDS PostgreSQL

---

# Release

v2.2.0

Major Changes:

* Deployment decoupling
* Independent frontend deployment
* Independent backend deployment
* SHA deployment validation
* CloudFront deployment pipeline
* S3 static hosting
* Automated cache invalidation
