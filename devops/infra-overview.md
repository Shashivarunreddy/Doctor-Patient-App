# Infrastructure Overview

## Project

Doctor Patient Application

Current production infrastructure has been migrated from a fully EC2-hosted architecture to a hybrid cloud architecture utilizing CloudFront, S3, ALB, EC2, and RDS.

---

# Production Architecture

User
↓
GoDaddy DNS
↓
CloudFront CDN
↓
S3 Frontend Hosting

Frontend Application
↓
api.arakutravels.com
↓
Application Load Balancer (ALB)
↓
Backend Container (EC2)
↓
AWS RDS PostgreSQL

---

# Infrastructure Components

## Frontend Layer

### S3 Bucket

Purpose:
- Stores static frontend build files
- Acts as CloudFront origin

Bucket:
- docco-frontend-prod

Contents:
- index.html
- assets/*
- static frontend resources

---

### CloudFront Distribution

Purpose:
- Global CDN
- HTTPS termination
- Edge caching
- Static asset delivery

Configuration:

Frontend Domain:
- docco.arakutravels.com

Origin:
- S3 Bucket

Certificate:
- AWS ACM

Distribution Type:
- Public

---

## Backend Layer

### Application Load Balancer

Purpose:
- Public API entry point
- HTTPS termination
- Request routing
- Health checks

Endpoint:
- api.arakutravels.com

Routes:
- /api/*

---

### Backend Service

Runtime:
- Node.js
- Express
- Docker

Hosting:
- AWS EC2

Container:
- oshadhi_backend

Responsibilities:
- Authentication
- Authorization
- Doctor Management
- Patient Management
- Admin Operations
- Agora Token Generation
- API Processing

---

## Database Layer

Engine:
- PostgreSQL

Service:
- AWS RDS

Purpose:
- Persistent application storage

Access:
- Backend Service Only

Public Access:
- Disabled

---

# DNS Architecture

Provider:
- GoDaddy

Records:

docco.arakutravels.com
→ CloudFront Distribution

api.arakutravels.com
→ Application Load Balancer

---

# Security Architecture

## CloudFront

Protected By:
- AWS ACM Certificate

Protocol:
- HTTPS

---

## Application Load Balancer

Protected By:
- AWS ACM Certificate

Protocol:
- HTTPS

---

## Security Groups

Backend EC2:

Inbound:
- ALB Security Group

Direct Internet Access:
- Restricted

---

## Database Security

RDS Access:
- Backend Only

Public Database Access:
- Disabled

---

# Deployment Architecture

## Frontend

GitHub Actions
↓
Build Frontend
↓
Upload dist/ to S3
↓
CloudFront Cache Invalidation
↓
Production

---

## Backend

GitHub Actions
↓
Docker Build
↓
DockerHub
↓
SHA Tagged Image
↓
EC2 Deployment
↓
Production

---

# Current Version

Release:
v2.2.0

Major Changes:
- Frontend migrated to S3
- CloudFront CDN introduced
- HTTPS enabled
- ALB introduced
- API subdomain introduced
- Independent deployment pipelines
- SHA-based backend deployment