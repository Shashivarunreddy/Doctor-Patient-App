# Cloud Infrastructure & Networking (AWS)

This document describes the design, subnet topology, security groups configuration, and routing rules of the Docco360 cloud infrastructure on AWS.

---

## Purpose
This document provides networking specifications and configuration details to construct a secure AWS Virtual Private Cloud (VPC) that hosts the Docco360 application environment.

## Scope
The scope covers VPC configurations, public/private subnets, Internet Gateways, NAT Gateways, Bastion Hosts, Application Load Balancers, and Security Groups.

---

## VPC Architecture & Subnet Topology

The Docco360 cloud resources are deployed inside a custom VPC with a CIDR block of `10.0.0.0/16`. Subnets are separated by Availability Zones (AZ) and security layers.

```text
+-----------------------------------------------------------------------------------+
|                                  AWS VPC (10.0.0.0/16)                            |
|                                                                                   |
|  Public Subnets (10.0.1.0/24, 10.0.2.0/24)                                        |
|  - Route to Internet Gateway (IGW)                                               |
|                                                                                   |
|     +-------------------------+      +-------------------+      +--------------+  |
|     | Application Load Balancer| ---> |   Bastion Host    | ---> | NAT Gateway  |  |
|     | (ALB on Ports 80/443)   |      | (SSH on Port 22)  |      |  (Egress)    |  |
|     +-------------------------+      +-------------------+      +--------------+  |
|                  |                                                     |          |
|  Private Subnets (10.0.3.0/24, 10.0.4.0/24)                            |          |
|  - Route to NAT Gateway                                                |          |
|                                                                        v          |
|     +------------------------------------------------------------------+          |
|     |  Amazon EC2 Instance                                                        |  |
|     |  (Runs Backend & Monitoring Containers on Ports 5000/9090)                 |  |
|     +------------------------------------------------------------------+          |
|                  |                                                                |
|  Database Subnets (10.0.5.0/24, 10.0.6.0/24)                                      |
|  - No Internet Route                                                              |
|                                                                                   |
|     +------------------------------------------------------------------+          |
|     |  Amazon RDS PostgreSQL                                                      |  |
|     |  (Primary + Multi-AZ Standby DB on Port 5432)                                |  |
|     +------------------------------------------------------------------+          |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## Subnet Allocation Table

| Subnet Name | CIDR Block | Availability Zone | Route Table Association | Target Resources |
| :--- | :--- | :--- | :--- | :--- |
| `docco-public-1a` | `10.0.1.0/24` | `us-east-1a` | Public Route Table (IGW) | ALB, Bastion Host, NAT Gateway |
| `docco-public-1b` | `10.0.2.0/24` | `us-east-1b` | Public Route Table (IGW) | ALB |
| `docco-private-1a` | `10.0.3.0/24` | `us-east-1a` | Private Route Table (NAT) | EC2 Backend & Monitoring |
| `docco-private-1b` | `10.0.4.0/24` | `us-east-1b` | Private Route Table (NAT) | EC2 Backup Instance |
| `docco-db-1a` | `10.0.5.0/24` | `us-east-1a` | Database Route Table (None) | Amazon RDS PostgreSQL (Primary) |
| `docco-db-1b` | `10.0.6.0/24` | `us-east-1b` | Database Route Table (None) | Amazon RDS PostgreSQL (Standby) |

---

## Gateways and Routing Configurations

### 1. Internet Gateway (IGW)
An IGW is attached to the VPC. The public route tables map default route `0.0.0.0/0` to this gateway, allowing public resources (ALB, Bastion) to communicate with clients over the internet.

### 2. NAT Gateway
A NAT Gateway is deployed inside the public subnet `docco-public-1a` and assigned an Elastic IP (EIP). The private route tables map default route `0.0.0.0/0` to the NAT Gateway. This allows the backend EC2 instances in the private subnets to fetch package updates or pull Docker images from Docker Hub without exposing themselves to incoming internet traffic.

---

## Security Group Firewalls (Least Privilege)

Stateful security groups are configured to limit access paths between VPC resources.

### 1. ALB Security Group (`docco-alb-sg`)
* **Inbound Rules**:
  - `HTTP` (Port `80`) from `0.0.0.0/0` (Redirects to HTTPS).
  - `HTTPS` (Port `443`) from `0.0.0.0/0` (Public client access).
* **Outbound Rules**:
  - Traffic to `docco-backend-sg` on port `5000`.

### 2. EC2 Backend Security Group (`docco-backend-sg`)
* **Inbound Rules**:
  - `HTTP` (Port `5000`) from `docco-alb-sg` (Only accepts traffic routed via the ALB).
  - `SSH` (Port `22`) from `docco-bastion-sg` (Administrative tunnels).
  - `HTTP` (Port `9090`, `3000`) from `docco-bastion-sg` (Secure access to Prometheus and Grafana dashboards).
* **Outbound Rules**:
  - Traffic to `docco-db-sg` on port `5432`.
  - HTTP/HTTPS to `0.0.0.0/0` via NAT Gateway for external package resolution.

### 3. Database Security Group (`docco-db-sg`)
* **Inbound Rules**:
  - `PostgreSQL` (Port `5432`) from `docco-backend-sg` (Restricts database access exclusively to backend servers).
* **Outbound Rules**:
  - None (Database cannot initiate external requests).

---

## Operational Verification

Verify the AWS network infrastructure components.

> Screenshot:
>
> AWS VPC Subnets Console

Verify the route table targets and gateways configuration.

> Screenshot:
>
> AWS Route Tables Console

Verify the stateful firewall rules matching the architecture.

> Screenshot:
>
> AWS Security Groups Inbound Rules
