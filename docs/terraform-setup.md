# Terraform Infrastructure Setup Guide

> Complete deployment runbook for provisioning, bootstrapping, validating, troubleshooting, and destroying the Docco360 V2 AWS infrastructure.

---

## Objective

The objective of the Docco360 V2 environment is to transition the application's infrastructure from manually configured resources into a fully automated, reproducible, and version-controlled Infrastructure as Code (IaC) setup using Terraform.

### What Terraform Provisions:
* **Networking Topology**: VPC, public/private subnets across multiple AZs, NAT Gateway, Route Tables, and VPC S3 Gateway endpoints.
* **Perimeter Firewalls**: Four tailored Security Groups (ALB, Bastion, Backend EC2, RDS) with strict ingress/egress boundaries.
* **Compute Instances**: Public Bastion Host (`t3.micro`) and Private Backend EC2 (`t3.micro`) loaded with Docker engine.
* **Database Layer**: Encrypted Amazon RDS PostgreSQL (`16`) database in isolated DB subnets.
* **Storage Systems**: 32GB `gp3` EBS volume (for monitoring) and S3 bucket with CloudFront CDN integration.
* **Credentials & IAM**: Deployment SSH key-pairs (saved locally to `docco-v2-key.pem`) and the GitHub Actions deployment programmatic IAM user.

### What Terraform Intentionally Does NOT Configure:
* **Host Storage Mounts**: Formatting and mounting raw EBS block volumes onto the EC2 host.
* **Application Configuration**: Injecting database endpoints and API secrets into the container's `.env` files.
* **DNS Registrar Delegation**: Verifying domain names and mapping ACM certificates over GoDaddy/Cloudflare nameservers.
* **Container Lifecycle Management**: Running compose files and pulling application images from Docker Hub.

---

## Architecture Overview

```text
                           [ Browser / Client ]
                                    |
                    +---------------+---------------+
                    | (HTTPS)                       | (API Requests)
                    v                               v
          +------------------+             +------------------+
          |  Amazon Route 53 |             |  Amazon Route 53 |
          +--------+---------+             +--------+---------+
                   |                                |
                   v                                v
         +--------------------+           +-------------------+
         | Amazon CloudFront  |           | Application Load  |
         |        CDN         |           |   Balancer (ALB)  |
         +--------+-----------+           +--------+----------+
                  |                                |
                  v                                | (Reverse Proxy)
         +--------------------+                    v
         |     Amazon S3      |           +-------------------+
         | (Static Frontend)  |           |   Amazon EC2      |
         +--------------------+           | (Private Backend) |
                                          +--------+----------+
                                                   |
                                                   +-------+
                                                   |       | (SQL Port 5432)
                                                   v       v
                                           +-----------+ +-----------+
                                           |  Amazon   | |   AWS     |
                                           |    RDS    | |   EBS     |
                                           | (Postgres)| | (Metrics) |
                                           +-----------+ +-----------+
```

### Network Configurations:
* **VPC CIDR**: `10.1.0.0/16`
* **Public Subnets**: `10.1.1.0/24` (AZ-1a), `10.1.2.0/24` (AZ-1b)
* **Private Subnets**: `10.1.3.0/24` (AZ-1a), `10.1.4.0/24` (AZ-1b)
* **Database Subnets**: `10.1.5.0/24` (AZ-1a), `10.1.6.0/24` (AZ-1b)

---

## Prerequisites

Ensure the following tools are installed and configured locally:
* **AWS CLI**: Authenticated with your AWS target account (`aws configure`).
* **Terraform**: CLI binary version `>= 1.5.0` installed.
* **Docker & Docker Hub**: Account with programmatic access tokens.
* **SSH Client**: OpenSSH enabled on your command terminal.
* **V2 Directory Structure**:
  ```text
  terraform/
  ├── main.tf
  ├── variables.tf
  ├── outputs.tf
  ├── terraform.tfvars (Git-ignored)
  └── modules/ (vpc, security_groups, ec2, rds, alb_acm, s3_cloudfront, iam)
  ```

---

## Phase 1 — Provision Infrastructure

1. **Initialize the Backend & Providers**:
   ```bash
   cd terraform
   terraform init
   ```
2. **Perform Syntax & Module Verification**:
   ```bash
   terraform validate
   ```
3. **Execute a Dry-Run Plan**:
   ```bash
   terraform plan
   ```
4. **Deploy Resources to AWS**:
   ```bash
   terraform apply -auto-approve
   ```

### Expected Outputs:
* `alb_dns_name`: Public load balancer endpoint.
* `bastion_public_ip`: Public Elastic IP of the Bastion jump host.
* `rds_endpoint`: Private endpoint of the RDS database.
* `cloudfront_domain_name`: Public URL of the frontend CDN.

### ❌ Failure Cases & Solutions:
* **Failure Case 1 (EC2 Sizing)**: `InvalidParameterCombination: The specified instance type is not eligible for Free Tier.`
  - *Solution*: Set `instance_type = "t3.micro"` (or `"t2.micro"`) in `terraform.tfvars`.
* **Failure Case 2 (RDS Backup Retention)**: `FreeTierRestrictionError: The backup retention period exceeds the maximum.`
  - *Solution*: Modify `backup_retention_period` to `1` (or `0`) in the database configuration.
* **Failure Case 3 (RDS Engine Version Deprecation)**: `Cannot find version 16.1 for postgres.`
  - *Solution*: Set `engine_version = "16"` (without pinning minor patches) to allow AWS to auto-select the latest supported release.

---

## Phase 2 — SSH Bootstrap

Since the application host runs in a private subnet, you must establish an SSH tunnel using the Bastion host as a jump server.

1. **Set Local Permissions on Key File**:
   - *Linux/macOS*: `chmod 400 docco-v2-key.pem`
   - *Windows (PowerShell)*:
     ```powershell
     icacls.exe .\docco-v2-key.pem /inheritance:r /grant:r "$($env:username):(R)"
     ```
2. **Access the Private Backend Instance via Proxy**:
   ```bash
   ssh -i docco-v2-key.pem ubuntu@<backend_private_ip> -o ProxyCommand="ssh -i docco-v2-key.pem -W %h:%p ubuntu@<bastion_public_ip>"
   ```

### ❌ Failure Cases & Solutions:
* **Failure Case 1 (Unsecured PEM Permissions)**: `Permissions for 'key.pem' are too open.`
  - *Solution*: Remove inheritance and restrict file access to your user only using `icacls` (Windows) or `chmod 400` (Unix).
* **Failure Case 2 (Connection Timeout)**: SSH hangs indefinitely.
  - *Solution*: Verify `admin_ip` in `terraform.tfvars` matches your current public IP address (CIDR `/32` suffix required).

---

## Phase 3 — Storage Bootstrap

You must format and mount the attached raw EBS volume on the backend EC2 instance before starting the containers.

1. **Locate the Raw Disk Device**:
   ```bash
   lsblk
   # Identify the 32GB disk (usually /dev/nvme1n1 or /dev/xvdf)
   ```
2. **Create the File System**:
   ```bash
   sudo mkfs -t ext4 /dev/nvme1n1
   ```
3. **Mount the Storage**:
   ```bash
   sudo mkdir -p /mnt/monitoring
   sudo mount /dev/nvme1n1 /mnt/monitoring
   sudo chown -R ubuntu:ubuntu /mnt/monitoring
   ```
4. **Configure Persistent Mounts (`/etc/fstab`)**:
   Add the mount rule to `/etc/fstab` to ensure the disk survives EC2 reboots:
   ```text
   /dev/nvme1n1 /mnt/monitoring ext4 defaults,nofail 0 2
   ```

### ❌ Failure Cases & Solutions:
* **Failure Case 1 (Device Not Found)**: Trying to mount `/dev/xvdf` when it displays as `/dev/nvme1n1`.
  - *Solution*: Run `lsblk` and use the exact device name printed under the `disk` type.
* **Failure Case 2 (Permission Denied)**: Prometheus cannot write metric segments to `/mnt/monitoring`.
  - *Solution*: Ensure ownership is transferred using `sudo chown -R ubuntu:ubuntu /mnt/monitoring` (or matches your container UID/GID).

---

## Phase 4 — Deployment Setup

Prepare directories on the backend EC2 host and transfer files from your local workspace:

1. **Create Target Folder on EC2**:
   ```bash
   sudo mkdir -p /opt/docco
   sudo chown -R ubuntu:ubuntu /opt/docco
   ```
2. **Transfer Configuration Files via SCP Proxy**:
   ```bash
   # From your local terminal:
   scp -i docco-v2-key.pem -o ProxyCommand="ssh -i docco-v2-key.pem -W %h:%p ubuntu@<bastion_public_ip>" docker-compose.yaml .env ubuntu@<backend_private_ip>:/opt/docco/
   scp -r -i docco-v2-key.pem -o ProxyCommand="ssh -i docco-v2-key.pem -W %h:%p ubuntu@<bastion_public_ip>" monitoring/ ubuntu@<backend_private_ip>:/opt/docco/
   ```

---

## Phase 5 — Docker & Container Management

1. **Docker Pre-installation check**:
   The EC2 user-data script installs Docker. Verify the daemon is active:
   ```bash
   docker --version
   docker compose version
   ```
2. **Start the Application Stack**:
   ```bash
   cd /opt/docco
   docker compose up -d
   ```

### ❌ Failure Cases & Solutions:
* **Failure Case 1 (Daemon Permission Denied)**: `docker: permission denied while trying to connect to the Docker daemon.`
  - *Solution*: Run `sudo usermod -aG docker ubuntu` and restart your SSH session to apply group permissions.

---

## Phase 6 — Monitoring (Prometheus & Grafana)

The observability containers run alongside the application server.

* **Prometheus Configuration**: Polling `/metrics` on port 5000 and exporting system loads.
* **Grafana Configuration**: Mounting host `/mnt/monitoring/grafana-data` to persist dashboards.

### ❌ Failure Cases & Solutions:
* **Failure Case 1 (Permission Denied on mount)**: Grafana container exits with permission errors.
  - *Solution*: Adjust write access on the host mount: `sudo chmod -R 777 /mnt/monitoring/`.

---

## Phase 7 — Database Integration (Prisma & RDS)

1. **Construct the Connection String**:
   Build the connection string using your V2 RDS endpoint output and append SSL bypass parameters:
   ```env
   DATABASE_URL="postgresql://<db_user>:<db_password>@<rds_endpoint>:5432/<db_name>?sslmode=require&sslaccept=accept_invalid_certs"
   ```
2. **Inject SSL Trust Bypass**:
   Add this parameter in `.env` to allow Node to accept the RDS Root CA:
   ```env
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

### ❌ Failure Cases & Solutions:
* **Failure Case 1 (TLS Handshake Failures)**: `self-signed certificate in certificate chain (code: P1011)`.
  - *Solution*: Add `NODE_TLS_REJECT_UNAUTHORIZED=0` to the `.env` file to trust the AWS CA.

---

## Phase 8 — Backend Validation

Confirm backend health check responses:

```bash
# Call health check from local shell
curl http://<alb_dns_name>/health
```
> Expected Response: `{"success":true,"message":"Server is running"}`

---

## Phase 9 — Frontend Deployment

1. **Build Frontend for V2 Target**:
   ```bash
   cd frontend
   $env:VITE_API_URL="http://<alb_dns_name>/api/"
   npm run build
   ```
2. **Deploy Build to S3**:
   ```bash
   aws s3 sync dist/ s3://<s3_frontend_bucket>/
   ```
3. **Invalidate Cache**:
   ```bash
   aws cloudfront create-invalidation --distribution-id <cloudfront_distribution_id> --paths "/*"
   ```

---

## Phase 10 — Login Validation

To test your login without DNS delegation, avoid HTTPS mixed-content blocks:

1. **Whitelist Localhost in EC2 CORS settings**:
   ```env
   FRONTEND_URL="http://localhost:5173,https://<cloudfront_domain_name>"
   ```
2. **Run Local Dev Server**:
   ```bash
   $env:VITE_API_URL="http://<alb_dns_name>/api/"
   npm run dev
   ```
3. **Open browser to**: `http://localhost:5173`. Log in using `admin@oshadhi.com` / `Admin@1234`.

---

## Known Limitations & Future Work

* **HTTPS Certificate Warning**: The Application Load Balancer currently uses port `80` HTTP because domain nameserver changes were skipped.
* **Resolution**: Map a custom domain (e.g. `docco.arakutravels.com`) to Route 53, issue public ACM certificates, and configure ALB HTTPS Listeners (port `443`).

---

## Validation Checklist
- [x] S3 Static hosting reachable.
- [x] CloudFront CDN serves assets correctly.
- [x] ALB returns health checks on `/health`.
- [x] DB migrations populated in RDS PostgreSQL.
- [x] Observability stack runs successfully.
- [x] Admin login succeeds.

---

## Destroy Infrastructure

```bash
cd terraform
terraform destroy -auto-approve
```
*Tears down all 43 resources safely, preventing unexpected NAT Gateway and database charges.*

---

## Lessons Learned
1. **Separation of Concerns**: Terraform manages the hardware infrastructure; host bootstrap scripts handle mounting and formatting.
2. **TLS Connection Handling**: Node's native `pg` client requires environment-level overrides to connect successfully to RDS database nodes over SSL.
3. **Mixed Content Restrictions**: Browsers block insecure HTTP API calls from HTTPS origins (such as `cloudfront.net` domains).

---

## Future Improvements
* **Infrastructure as Code**: Terraform configuration templates for ECS/Fargate container hosting.
* **Auto-Scaling Compute**: ASG triggers based on load demands.
* **Blue-Green Deployments**: Zero-downtime container releases.
