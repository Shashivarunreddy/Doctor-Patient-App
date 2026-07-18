# Docco360 System Architecture

This document describes the high-level system architecture, request routing, and core design decisions of the Docco360 doctor-patient consultation platform.

---

## Purpose
This document serves as the architectural blueprint for the Docco360 platform, outlining the structural relations between compute, storage, and networking layers to ensure security, high availability, and operational resilience.

## Scope
The scope of this architecture covers the user-facing web interface, the backend API services, persistent database storage, real-time video sessions, and the self-hosted monitoring ecosystem.

---

## System Architecture

The Docco360 production architecture is deployed on AWS in a custom Virtual Private Cloud (VPC). Static assets are separated from dynamic services and served via a global Content Delivery Network (CDN). The application compute and database layers are hosted in isolated private subnets.

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

---

## Component Layout

### 1. Static Frontend Hosting
The user-facing Single Page Application (SPA) is built using React and Vite, compiled into static assets, and hosted in an **Amazon S3** bucket. 
- **Amazon CloudFront** acts as the Content Delivery Network (CDN) to serve these assets globally with low latency.
- SSL/TLS encryption is terminated at CloudFront using certificates managed by **Amazon ACM**.

### 2. Private Application Compute
The backend API is written in Python (Flask) and run as a containerized Gunicorn application under Docker Compose on an **Amazon EC2** instance.
- The EC2 instance is located within a **Private Subnet**, shielding the compute instances from direct internet access.
- Incoming API requests (`/api/*`) are received by an **Application Load Balancer (ALB)** in the public subnet and forwarded over HTTP to the EC2 instances.

### 3. Managed Database Layer
The data persistence layer is handled by **Amazon RDS PostgreSQL**.
- The database is deployed inside private database subnets and restricted to only accept incoming connections on port `5432` from the EC2 backend instances.
- Connections between the backend container and RDS are encrypted using SSL.

### 4. Real-Time Video consultations
Video communication is established peer-to-peer using **WebRTC** and managed via **Agora RTC** SDK. The backend generates secure dynamic room tokens, allowing authenticated clients to join encrypted video channels.

---

## Design Decisions

### Decoupled Compute and Storage
* **Decision**: Separate static web hosting (S3/CloudFront) from dynamic API compute (EC2).
* **Reasoning**: Serves static pages with near-zero latency, minimizes resource consumption on EC2 instances, and removes web-server configurations from the backend stack.

### Network Isolation (VPC Subnets)
* **Decision**: Place EC2 instances and Amazon RDS in private subnets, using an ALB for public API routing.
* **Reasoning**: Limits the attack surface. Backend servers and databases are protected from direct internet probing and SQL injection attacks at the perimeter level.

### Containerized Deployments
* **Decision**: Package backend API, Prometheus, Grafana, cAdvisor, and Node Exporter in Docker containers.
* **Reasoning**: Eliminates configuration drift between staging and production environments, ensuring identical runtime execution regardless of host kernel updates.

---

## Request Flow

1. **DNS Resolution**: The browser resolves `docco.arakutravels.com` via Amazon Route 53.
2. **Frontend Load**: CloudFront intercepts the request, serves the compiled React SPA from the S3 bucket, and caches the resources on edge locations.
3. **API Requests**: The React app makes API calls to `https://docco.arakutravels.com/api/...`.
4. **Load Balancing**: The ALB receives API requests on port `443` (terminating HTTPS), validates certificates via ACM, and forwards traffic to the EC2 instance inside the private subnet on the backend container port `5000`.
5. **Database Transaction**: The Flask backend processes business logic, communicating with the Amazon RDS instance on port `5432` over SSL.
6. **Agora Video Join**: If the patient schedules a live consult, the backend generates an Agora RTC token. The patient and doctor connect via Agora's CDN.

---

## Operational Notes
- High availability is achieved by distributing database read-replicas across multiple Availability Zones (Multi-AZ RDS).
- Security groups act as stateful firewalls to restrict inbound connections to only required paths.
- Deployment processes are isolated so that frontend builds do not trigger backend restarts.
