# Cloud Infrastructure Setup

> Doctor-Patient App (Oshadhi)
> Version: v2.2.0

---

# Infrastructure Overview

User
↓
GoDaddy DNS
↓
CloudFront
↓
S3 Frontend

Frontend
↓
api.arakutravels.com
↓
Application Load Balancer
↓
Backend Container (EC2)
↓
AWS RDS PostgreSQL

---

# AWS Services

## Route Layer

Provider:

GoDaddy

Records:

docco.arakutravels.com

↓

CloudFront Distribution

---

api.arakutravels.com

↓

Application Load Balancer

---

# Frontend Layer

## Amazon S3

Purpose:

Static website hosting.

Bucket:

docco-frontend-prod

Stores:

* index.html
* assets/
* build artifacts

---

## Amazon CloudFront

Purpose:

Global CDN

Responsibilities:

* Edge caching
* HTTPS delivery
* Static asset distribution

Distribution:

E2J509C88AVEHE

---

# HTTPS

## AWS Certificate Manager

Frontend Certificate:

docco.arakutravels.com

Region:

us-east-1

Status:

Issued

Reason:

CloudFront requires ACM certificates in N. Virginia (us-east-1).

---

## API Certificate

Domain:

api.arakutravels.com

Attached To:

Application Load Balancer

Status:

Issued

---

# Backend Layer

## Application Load Balancer

Purpose:

Public API endpoint.

Responsibilities:

* HTTPS termination
* Routing
* Health checks

---

## Target Group

Health Check:

/health

Protocol:

HTTP

Target:

Backend EC2 Instance

---

## EC2

Purpose:

Run backend application container.

Container:

oshadhi_backend

Runtime:

Node.js
Express
Docker

---

# Database Layer

## Amazon RDS

Engine:

PostgreSQL

Purpose:

Persistent application storage.

Access:

Backend service only.

Public Access:

Disabled

---

# Security Architecture

## ALB Security Group

Inbound:

80

443

Source:

Internet

---

## Backend Security Group

Inbound:

5000

Source:

ALB Security Group

Direct Public Access:

Disabled

---

## RDS Security Group

Inbound:

5432

Source:

Backend Security Group

Public Access:

Disabled

---

# DNS Architecture

docco.arakutravels.com

↓

CloudFront

↓

S3

---

api.arakutravels.com

↓

ALB

↓

Backend

↓

RDS

---

# Migration History

Initial Architecture:

EC2
├── Frontend Container
├── Backend Container
└── PostgreSQL Container

---

Intermediate Architecture:

EC2
├── Frontend Container
├── Backend Container

RDS
└── PostgreSQL

---

Current Architecture:

CloudFront
↓
S3 Frontend

ALB
↓
Backend Container

RDS
↓
PostgreSQL

---

# Release

v2.2.0

Major Infrastructure Changes:

* Frontend migration to S3
* CloudFront CDN integration
* HTTPS enablement
* ACM integration
* ALB introduction
* API subdomain introduction
* Security group hardening
* DNS modernization
