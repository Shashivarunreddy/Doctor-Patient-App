# Cloud Cost Analysis & Optimization Strategy

This document details the estimated running costs of the Docco360 cloud infrastructure on AWS, along with a cost-control strategy for development environments.

---

## Purpose
This document provides financial analysis and action plans to optimize AWS monthly billing, focusing on cost-effective resource allocation for non-production environments.

## Scope
The scope covers AWS cost estimations for EC2 compute, RDS PostgreSQL databases, CloudFront CDN, S3 storage, NAT Gateways, EBS volumes, and automated scheduling controls.

---

## AWS Monthly Cost Estimation

The following tables outline the estimated running costs for a standard deployment of the Docco360 platform in the `us-east-1` region (assuming 24/7 runtimes).

### 1. Compute & Storage Cost Breakdown

| AWS Service | Instance / Volume Type | Monthly Charge (Est.) | Financial Optimization Target |
| :--- | :--- | :--- | :--- |
| **Amazon EC2** | `t3.medium` (2 vCPU, 4GB RAM) | ~$30.00 | Shutdown during non-working hours |
| **Amazon RDS** | `db.t3.micro` (PostgreSQL) | ~$15.00 | Single-AZ deployment for dev environments |
| **Amazon EBS** | General Purpose SSD (`gp3`, 32 GB) | ~$2.56 | Minimize capacity over-provisioning |
| **Amazon S3** | Standard Storage (10 GB) | ~$0.23 | Configure lifecycle policies to delete logs |
| **Amazon CloudFront**| CDN Data Transfer (100 GB egress) | ~$8.50 | Cache configuration tuning to reduce S3 hits |

### 2. Networking Cost Breakdown

| AWS Network Resource | Service Type | Monthly Charge (Est.) | Financial Optimization Target |
| :--- | :--- | :--- | :--- |
| **AWS NAT Gateway** | Egress traffic controller | ~$32.40 (Idle hourly rate) | Replace with NAT Instance or VPC endpoints |
| **NAT Data Processing**| Egress data transfer | Variable ($0.045/GB) | Route internal S3 traffic via Gateway Endpoint |
| **AWS Elastic IP** | Static public address | ~$3.60 (If unattached) | Clean up unused addresses |

---

## Cost Optimization & Cost-Saving Strategy

### 1. Automated Environment Suspension
To reduce non-production costs, compute and database instances are suspended during non-business hours (e.g. overnight and weekends).
* **EC2 Instance Automation**: Configured via **AWS Systems Manager (SSM) Quick Setup** or a **Lambda** function to trigger instance stop at `19:00 UTC` and start at `07:00 UTC` Monday-Friday.
* **RDS Instance Automation**: Enforces database stops. Since RDS automatically restarts after 7 days, a weekly cron job ensures the DB remains stopped when not in use.
* *Financial Impact*: Reduces compute and database costs by **~65%** (from 730 hours to ~240 hours monthly).

### 2. NAT Gateway Mitigation (VPC Endpoints & NAT Instance)
NAT Gateways carry a high hourly charge even when idle. For development or low-traffic setups:
* **NAT Instance Alternative**: Deploy a lightweight, community-supported Linux image on a `t3.nano` instance configured as a NAT route target. This reduces the cost from ~$32/month to ~$3.50/month.
* **VPC Endpoints**: Configure an **AWS VPC Gateway Endpoint** for S3. This ensures all S3 traffic routes directly over the private AWS network, bypassing NAT billing charges.

### 3. Monitoring EBS Data Retention Control
To prevent EBS volume bloating from Prometheus metrics:
- Set metric retention limits to 15 days (`--storage.tsdb.retention.time=15d`).
- Store only aggregated metrics, excluding verbose debug logs.

---

## Operational Verification

Audit monthly costs using the billing dashboard.

> Screenshot:
>
> AWS Cost Explorer Dashboard
