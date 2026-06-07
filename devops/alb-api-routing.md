# ALB API Routing Architecture

## Objective

Introduce a dedicated API layer using an Application Load Balancer (ALB) and custom API subdomain.

This migration removes direct backend access through the EC2 public IP and provides a scalable, production-ready entry point for backend services.

---

# Previous Architecture

Frontend
↓
EC2 Public IP
↓
Backend Container
↓
RDS

Example:

Frontend
↓
http://3.xx.xx.xx/api

Limitations:

- Direct EC2 exposure
- No load balancing layer
- No HTTPS API endpoint
- Difficult future scaling
- Tightly coupled infrastructure

---

# New Architecture

Frontend
↓
https://api.arakutravels.com
↓
Application Load Balancer
↓
Target Group
↓
Backend Container (EC2)
↓
AWS RDS PostgreSQL

Benefits:

- Dedicated API endpoint
- HTTPS support
- Future horizontal scaling support
- Health monitoring
- Security group isolation
- Production-grade routing

---

# Components

## Application Load Balancer

Purpose:

- Public API entry point
- SSL termination
- Request routing
- Health checks

Endpoint:

api.arakutravels.com

---

## Target Group

Purpose:

Route traffic from ALB to backend service.

Target Type:

Instance

Current Target:

Backend EC2 Instance

Health Check:

Path:
/health

Protocol:
HTTP

Expected Response:
200 OK

---

## Backend Service

Hosting:

AWS EC2

Container:

oshadhi_backend

Runtime:

- Node.js
- Express
- Docker

Port:

5000

---

# ACM Certificate

Purpose:

HTTPS support for API endpoint.

Domain:

api.arakutravels.com

Region:

ap-northeast-1

Attached To:

Application Load Balancer

Status:

Issued

---

# DNS Configuration

Provider:

GoDaddy

Record:

api.arakutravels.com
↓
ALB DNS Name

Result:

All API traffic now flows through ALB.

---

# Security Group Design

## ALB Security Group

Inbound:

80
443

Source:

Internet

Purpose:

Accept public requests.

---

## Backend EC2 Security Group

Inbound:

5000

Source:

ALB Security Group

Purpose:

Allow backend access only through ALB.

Direct Public Access:

Restricted

---

# Request Flow

Authentication Request

User
↓
Frontend
↓
api.arakutravels.com
↓
ALB
↓
Target Group
↓
Backend Container
↓
RDS

Response
↓
Backend
↓
ALB
↓
Frontend
↓
User

---

# Frontend Configuration

Previous:

VITE_API_URL=http://<ec2-public-ip>

Current:

VITE_API_URL=https://api.arakutravels.com/api

---

# Migration Challenges

## Direct EC2 Dependency

Issue:

Frontend depended on EC2 public IP.

Impact:

Infrastructure tightly coupled to a single server endpoint.

Resolution:

Introduced dedicated API domain through ALB.

---

## HTTPS Enablement

Issue:

API traffic required secure transport.

Resolution:

Created ACM certificate and attached to ALB.

---

## Backend Access Control

Issue:

Backend was reachable directly.

Resolution:

Restricted backend access to ALB Security Group.

---

# Current Request Flow

User
↓
docco.arakutravels.com
↓
CloudFront
↓
S3

Frontend
↓
api.arakutravels.com
↓
ALB
↓
Backend Container
↓
AWS RDS

---

# Release

Version:

v2.2.0