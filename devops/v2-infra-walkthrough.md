# Docco360 V2 Infrastructure Summary & Validation Walkthrough

This document details the system design, manual bootstrap requirements, chronological verification journey, and failure analysis of the Docco360 V2 cloud environment.

---

## 🏛️ V2 System Architecture Summary

The V2 architecture leverages Infrastructure as Code (IaC) to deploy an isolated, production-grade cloud environment on AWS:

```text
                           [ Client Browser ]
                                    |
                    +---------------+---------------+
                    | (Static SPA)                  | (API Traffic)
                    v                               v
          +------------------+             +-------------------+
          | Amazon CloudFront|             | Application Load  |
          |       CDN        |             |   Balancer (ALB)  |
          +--------+---------+             +--------+----------+
                   |                                |
                   v                                | (Port 5000 Proxy)
          +------------------+                      v
          |    Amazon S3     |             +-------------------+
          | (Static Assets)  |             |    Amazon EC2     |
          +------------------+             | (Private Backend) |
                                           +--------+----------+
                                                    |
                                          +---------+---------+
                                          |                   |
                                          v                   v
                                  +---------------+   +---------------+
                                  |  Amazon RDS   |   |   Amazon EBS  |
                                  | (PostgreSQL)  |   | (Metrics TSDB)|
                                  +---------------+   +---------------+
```

### Key Components:
* **Decoupled Frontend**: Built with React + Vite, hosted securely on **Amazon S3**, and delivered globally via **Amazon CloudFront** CDN.
* **Perimeter Security**: An **Application Load Balancer (ALB)** exposes the API layer over public ports while keeping application servers hidden.
* **Network Isolation**: Compute and persistence resources are located in private subnets inside a custom VPC (`10.1.0.0/16`). Outbound internet access is routed via a **NAT Gateway**.
* **Observability Persistence**: Self-hosted Prometheus, Grafana, Node Exporter, and cAdvisor containers persist data to an attached **32GB gp3 EBS volume** mounted at `/mnt/monitoring`.
* **Database Cluster**: **Amazon RDS PostgreSQL 16** operates in isolated database subnets, accepting connections on port `5432` only from the private EC2 backend.

---

## ⚙️ Essential Manual Bootstrap Requirements

Once Terraform provisions the hardware layer, the following actions must be executed manually to bootstrap the application:
1. **EBS Volume Formatting**: Format the raw block device `/dev/nvme1n1` with an `ext4` filesystem and mount it to `/mnt/monitoring` on the EC2 host.
2. **Environment Variables Config**: Set the RDS endpoint URL inside the EC2 `/opt/docco/.env` file. Add the database TLS bypass parameters (`&sslaccept=accept_invalid_certs` and `NODE_TLS_REJECT_UNAUTHORIZED=0`) and configure the CORS origin whitelist (`FRONTEND_URL`).
3. **Seeding & Migrations**: Ensure database tables are created and seeded with the clinical admin user (`admin@oshadhi.com`).

---

## 🚀 Chronological Walkthrough of the Validation Journey

1. **Syntax Validation**: Checked all 7 Terraform modules using `terraform validate` to ensure dependency loops and HCL variables were clean.
2. **Infrastructure Provisioning**: Deployed the 43 resources onto AWS using `terraform apply`.
3. **EBS Disk Setup**: Tunnelled SSH connections through the Bastion Host to the private EC2 server, formatted the raw EBS storage, and mounted the disk.
4. **Database Initialization**: Started the Gunicorn/Docker stack. The container automatic migration scripts successfully built the database schema in RDS and seeded the admin account.
5. **CORS & CORS Lockout Resolution**: Configured the CORS whitelist variables on the server to allow local development traffic.
6. **End-to-End Authentication Success**: Loaded the local dev server (`http://localhost:5173`) pointing to the ALB DNS name, bypassing the CloudFront HSTS mixed-content block, and successfully logged in to the admin dashboard.

---

## 🛠️ Failure Case Studies & Solved Issues

During validation, the following 6 critical engineering hurdles were solved:

### 1. Free Tier EC2 Sizing Restrictions
* **Error**: `RunInstances: InvalidParameterCombination. The specified instance type is not eligible for Free Tier.`
* **Cause**: The configuration defaulted to `t3.medium`, which is rejected by AWS Free Tier accounts.
* **Resolution**: Queried the AWS CLI to find eligible instance types. Changed default instance sizing to **`t3.micro`** (and subsequently `t2.micro` to match region-specific Free Tier definitions).

### 2. RDS Backup Retention Failures
* **Error**: `CreateDBInstance: FreeTierRestrictionError. Backup retention period exceeds maximum available to free tier.`
* **Cause**: The RDS parameters enforced 7 days of backups, which is restricted on Free Tier databases.
* **Resolution**: Updated the database configuration in `rds/main.tf` to set backup retention to **`1`** day.

### 3. RDS PostgreSQL Version Deprecation
* **Error**: `InvalidParameterCombination: Cannot find version 16.1 for postgres.`
* **Cause**: AWS RDS deprecated the minor `16.1` patch release in certain regions in favor of newer patch sets.
* **Resolution**: Configured `engine_version = "16"` in the RDS module, allowing AWS to auto-select the latest supported minor patch (e.g. `16.3` or `16.5`) dynamically.

### 4. TLS Self-Signed Certificate Chain Rejection
* **Error**: `PrismaClientKnownRequestError: Error opening a TLS connection: self-signed certificate in certificate chain.`
* **Cause**: Node.js/Prisma client connection drivers rejected the AWS RDS root certificate because it was signed by AWS's private CA.
* **Resolution**: Configured **`NODE_TLS_REJECT_UNAUTHORIZED=0`** on the EC2 host environment to bypass strict certificate verification.

### 5. CORS Preflight 403 Forbidden
* **Error**: AJAX login requests from local development servers failed during the preflight `OPTIONS` check.
* **Cause**: The backend whitelisted only the CloudFront URL. Local origins were locked out.
* **Resolution**: Updated the `FRONTEND_URL` variable to a comma-separated string: `"http://localhost:5173,https://d2fwjl1py3ttpe.cloudfront.net"`.

### 6. Mixed Content CloudFront HSTS Blocks
* **Error**: Network requests from CloudFront failed with `Provisional headers are shown`.
* **Cause**: Browser security (Mixed Content) blocks HTTP requests from HTTPS pages. CloudFront is forced to HTTPS via browser HSTS preloads, blocking HTTP ALB calls.
* **Resolution**: Set CloudFront `viewer_protocol_policy` to `"allow-all"` and used the local development server for validation to keep both layers on the matching HTTP protocol.

---

## 🔮 Future Development Roadmap

* **Phase 1: DNS & SSL Validation**: Route custom domain traffic (`docco.arakutravels.com`) through Route 53, generate ACM certificates, and configure HTTPS on the ALB port `443`.
* **Phase 2: Complete CI/CD Pipeline Automation**: Automate frontend builds to S3 and backend Docker pulls to the V2 EC2 instance using GitHub Actions.
* **Phase 3: Observability dash boards**: Tunnel into port `3000` to configure Grafana metrics tracking.
* **Phase 4: High Availability (AWS ECS/Fargate)**: Transition workloads from EC2 Docker Compose to serverless AWS ECS tasks behind Auto Scaling Groups.
