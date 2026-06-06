# CloudFront + S3 Frontend Migration

## Objective

Migrate frontend hosting from an EC2 containerized deployment model to a scalable, CDN-backed architecture using Amazon S3 and Amazon CloudFront.

---

# Previous Architecture

User
↓
DNS
↓
EC2 Public IP
↓
Frontend Container (Nginx)
↓
Backend Container
↓
RDS

Limitations:

- Frontend tied to EC2 lifecycle
- Frontend deployments coupled to backend infrastructure
- Additional compute cost for serving static files
- No CDN layer
- No edge caching
- HTTPS depended on server-side certificate management

---

# New Architecture

User
↓
docco.arakutravels.com
↓
CloudFront
↓
S3 Bucket

Frontend
↓
api.arakutravels.com
↓
ALB
↓
Backend Container
↓
AWS RDS

Benefits:

- Global CDN delivery
- Reduced EC2 workload
- Lower frontend hosting cost
- Edge caching
- Native HTTPS support
- Independent frontend deployments

---

# Migration Steps

## Step 1

Created S3 bucket:

docco-frontend-prod

Purpose:

- Host frontend build artifacts
- Act as CloudFront origin

---

## Step 2

Created CloudFront Distribution

Purpose:

- Global content delivery
- HTTPS termination
- Edge caching

Origin:

docco-frontend-prod

---

## Step 3

Requested ACM Certificate

Domain:

docco.arakutravels.com

Region:

us-east-1

Reason:

CloudFront only supports ACM certificates provisioned in N. Virginia (us-east-1).

---

## Step 4

DNS Validation

Provider:

GoDaddy

Validation Type:

CNAME

Status:

Approved

---

## Step 5

Attached ACM Certificate to CloudFront

Result:

HTTPS enabled for frontend domain.

---

## Step 6

Configured Alternate Domain Name

Domain:

docco.arakutravels.com

Attached to:

CloudFront Distribution

---

## Step 7

Configured GoDaddy DNS

Record:

docco.arakutravels.com
→ CloudFront Distribution

Result:

Traffic routed through CloudFront.

---

## Step 8

Frontend API Endpoint Migration

Previous:

http://<ec2-public-ip>

Updated:

https://api.arakutravels.com

Result:

Frontend now communicates through dedicated API endpoint.

---

# CI/CD Changes

Previous:

GitHub Actions
↓
Docker Build
↓
DockerHub
↓
Frontend Container
↓
EC2

Current:

GitHub Actions
↓
Build Frontend
↓
Upload dist/
↓
S3 Bucket
↓
CloudFront Cache Invalidation

---

# Challenges Encountered

## ACM Validation Delays

Issue:

Certificate remained in Pending Validation state.

Cause:

DNS validation records were not fully configured during initial setup.

Impact:

HTTPS activation delayed.

Resolution:

Added ACM-provided CNAME validation records to GoDaddy DNS.

---

## Deployment Coupling

Issue:

Frontend deployment was previously tied to EC2 deployment workflow.

Impact:

Frontend changes depended on backend deployment path.

Resolution:

Frontend deployment moved to S3 + CloudFront.

---

# Result

Frontend hosting is now fully separated from EC2 runtime infrastructure.

Current frontend delivery path:

User
↓
CloudFront
↓
S3

No frontend application container is required for production traffic delivery.

---

# Release

Version:

v2.2.0