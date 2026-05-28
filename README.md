# Docco360

Docco360 is a real-time doctor–patient consultation platform built as an engineering-first cloud project that demonstrates how a local application evolves into a production-style AWS deployment.

Rather than stopping at a working application, the focus of this project is infrastructure evolution, deployment maturity, architecture refactoring, and cloud engineering practices.

The project progressively evolved through multiple deployment stages:

Local Development → Docker → EC2 Deployment → SSL + RDS → S3 + CloudFront + ALB Architecture → CI/CD → Infrastructure Roadmap

---

## Why Docco360?

Most portfolio projects stop after "it works on localhost."

Docco360 focuses on what happens after that:

- Packaging applications for reproducible deployment
- Moving from monolithic hosting to decoupled architecture
- Introducing managed cloud services
- Improving deployment workflows
- Applying DevOps principles progressively

The objective was not building another consultation app.

The objective was learning how systems mature.

---

# Features

### Application Layer
- Real-time doctor-patient consultation workflow
- WebRTC-based communication
- Full-stack application architecture
- Secure session handling

### DevOps & Cloud Layer
- Dockerized deployment workflow
- EC2-hosted backend infrastructure
- Amazon RDS integration
- S3 static hosting
- CloudFront CDN delivery
- Application Load Balancer routing
- VPC network isolation
- GitHub Actions CI/CD

---

# Architecture

Current deployment follows a decoupled cloud architecture:

- Frontend hosted through S3 + CloudFront
- Backend containerized and deployed on EC2
- Backend isolated in private subnet
- Traffic routed through Application Load Balancer
- Persistent data handled through Amazon RDS

```text
                         Internet
                             |
                         HTTPS
                             |
                     +---------------+
                     | CloudFront    |
                     +-------+-------+
                             |
                             |
                     +---------------+
                     | S3 Frontend   |
                     +---------------+

Browser -------------------------> API Requests
                                   |
                                   v

+-----------------------------------------------------------+
|                         AWS VPC                           |
|                                                           |
| Public Subnet                                             |
|                                                           |
|   +---------------------------------------------+         |
|   | Application Load Balancer                   |         |
|   +----------------+----------------------------+         |
|                    |                                      |
|                    |                                      |
|                    v                                      |
|                                                           |
| Private Subnet                                            |
|                                                           |
|   +---------------------------------------------+         |
|   | EC2 Containerized Backend                   |         |
|   +----------------+----------------------------+         |
|                    |                                      |
|                    v                                      |
|                                                           |
|   +---------------------------------------------+         |
|   | Amazon RDS                                  |         |
|   +---------------------------------------------+         |
|                                                           |
+-----------------------------------------------------------+
```

---

# Tech Stack

## Frontend
- React

## Backend
- Node.js

## Real-time Communication
- WebRTC

## Containerization
- Docker

## Cloud Infrastructure
- Amazon EC2
- Amazon RDS
- Amazon S3
- Amazon CloudFront
- VPC
- Application Load Balancer
- Security Groups

## CI/CD
- GitHub Actions

## Supporting Services
- NGINX
- Docker Hub
- CloudWatch
- Prometheus
- Grafana

---

# Deployment Evolution

## V1 — First Internet Deployment

Initial application deployment:

- Local development
- Docker containerization
- Docker Hub image publishing
- EC2 deployment

Goal:

Take application from localhost to live internet access.

---

## V2 — Security + Data Separation

Improvements:

- SSL/TLS integration
- Database moved to Amazon RDS
- Reduced coupling

Goal:

Move from "works online" to "structured deployment"

---

## V3 — Cloud Architecture Refactor

Major changes:

- Frontend migrated to S3
- CloudFront CDN introduced
- Backend isolated inside VPC
- ALB routing introduced

Goal:

Move toward production-style separation.

---

## V4 — Planned Infrastructure Roadmap

Upcoming improvements:

- Terraform
- AWS CLI workflows
- Auto Scaling Groups
- Infrastructure as Code
- Deployment automation
- Stronger observability

---

# Deployment Workflow

```text
Local Development

      ↓

Docker Build

      ↓

Push Image → Docker Hub

      ↓

Deploy → EC2

      ↓

Database → Amazon RDS

      ↓

Frontend → S3

      ↓

CDN → CloudFront

      ↓

Traffic Routing → ALB

      ↓

CI/CD → GitHub Actions
```

---

# Engineering Problems Solved

## Runtime Drift

Applications behaving differently inside Docker compared to localhost.

Solved through:

- environment standardization
- container debugging
- deployment isolation

---

## Container Reachability

Container availability does not automatically mean public accessibility.

Required debugging:

- security groups
- exposed ports
- inbound rules
- networking layers

---

## Architecture Refactoring

Migrating infrastructure without rebuilding application logic.

Required:

- frontend/backend separation
- routing redesign
- cloud service integration

---

# Project Scope

This project demonstrates:

✓ AWS deployment experience

✓ Docker workflows

✓ VPC networking understanding

✓ CI/CD implementation

✓ architecture evolution

✓ cloud engineering practices

✓ production-oriented thinking

---

# Not Yet Implemented

Current project does not claim:

- enterprise-grade resilience
- autoscaling
- full test coverage
- incident management
- complete infrastructure automation

---

# Future Roadmap

- Terraform provisioning
- Auto Scaling Group integration
- AWS CLI operational workflows
- deployment validation
- health monitoring
- improved observability
- deployment runbooks

---

# Lessons Learned

Building software is only step one.

Making software deployable, scalable, observable, and maintainable is a completely different engineering challenge.

Docco360 was built to understand that transition.

---

## Author

Sri Harsha

Cloud | DevOps | AI Systems Engineering

Building systems from idea → deployment → infrastructure.