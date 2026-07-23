# Terraform Infrastructure as Code (Docco360 V2)

This directory contains the modular Terraform (IaC) configuration to provision the isolated V2 cloud architecture on AWS.

---

## 🏗️ Architecture Overview

* **VPC & Subnets**: Custom VPC (`10.1.0.0/16`) with 6 subnets across 2 Availability Zones (Public, Private App, Private DB), Internet Gateway, NAT Gateway with Elastic IP, and an S3 Gateway Endpoint.
* **Security Groups**: Stateful least-privilege firewalls for ALB (`80/443`), Bastion Host (`22`), Backend EC2 (`5000`), and RDS (`5432`).
* **Compute & Storage**: Public Bastion Host (`t3.micro`), Private Backend EC2 (`t3.micro`), 32GB persistent `gp3` EBS volume mounted at `/mnt/monitoring`.
* **Automated SSH Keys**: Auto-generates a 4096-bit RSA SSH key pair on execution and saves `docco-v2-key.pem` locally.
* **Database**: Amazon RDS PostgreSQL (`16.1`) with SSL enforcement parameter group (`rds.force_ssl = 1`).
* **Delivery & CDN**: Application Load Balancer, S3 bucket with Origin Access Control (OAC), and CloudFront distribution with SPA client-side routing fallback.

---

## ⚡ Execution Workflow Commands

Execute these commands inside the `terraform/` directory:

```bash
# 1. Initialize provider plugins and modules
terraform init

# 2. Validate syntax integrity
terraform validate

# 3. Create local variables override file
cp terraform.tfvars.example terraform.tfvars

# 4. Preview the execution plan
terraform plan

# 5. Provision the cloud infrastructure
terraform apply -auto-approve

# 6. Tear down all provisioned resources
terraform destroy -auto-approve
```

---

## ⚙️ Free Tier Adjustments

To ensure compliance with AWS Free Tier accounts:
* **EC2 Instance Type**: Configured to `t3.micro` (instead of `t3.medium`).
* **RDS Backup Retention**: Configured to `1` day retention (instead of 7 days).

---

## 📊 Infrastructure Outputs

After `terraform apply` completes, the following outputs are printed:
* `alb_dns_name`: Public DNS endpoint of the Application Load Balancer.
* `cloudfront_domain_name`: Public CDN domain name.
* `rds_endpoint`: Private hostname for PostgreSQL RDS.
* `bastion_public_ip`: Public Elastic IP of the SSH Bastion Host.
* `backend_private_ip`: Internal IP of the backend EC2 container host.
