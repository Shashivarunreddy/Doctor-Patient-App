# Docco360: Cloud-Hosted Doctor-Patient Consultation Platform

Docco360 is a secure, real-time doctor-patient consultation platform built as a production-grade cloud case study. The project demonstrates the evolution of a local full-stack application into a decoupled, secure, and highly available AWS environment.

The focus of this project is infrastructure maturity, security hardening, automated deployments, and comprehensive system observability.

---

## 🏗️ Production System Architecture

The Docco360 production architecture is fully decoupled, separating static asset delivery from containerized dynamic API compute and isolating persistence systems behind private security groups inside an AWS Virtual Private Cloud (VPC).

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

## 🛠️ Tech Stack & Infrastructure

### Application Components
* **Frontend**: React SPA, TypeScript, Vite.
* **Backend**: Python, Flask, Gunicorn WSGI.
* **Database**: PostgreSQL (Amazon RDS).
* **Consultations**: WebRTC via Agora RTC SDK.

### Infrastructure & Operations
* **Compute**: Amazon EC2, Docker, Docker Compose.
* **Storage**: Amazon S3 (static assets), Amazon EBS (observability databases).
* **Delivery**: Amazon CloudFront CDN, Amazon Route 53 DNS, AWS ACM.
* **Pipelines**: GitHub Actions, Docker Hub.
* **Monitoring**: Prometheus, Grafana, Node Exporter, cAdvisor.

---

## 📂 Documentation Directory Layout

The project documentation is structured into specialized engineering guides. Navigate through the files below to review the implementation details:

### 1. [System Architecture & Request Flow](docs/architecture.md)
*High-level architecture layout, design justifications, WebRTC token exchanges, and client-server request flows.*

### 2. [Cloud Infrastructure & Networking (AWS)](docs/infrastructure.md)
*VPC configurations, private/public subnet allocations, NAT Gateway routing policies, Bastion Host setups, and least-privilege security group rules.*

### 3. [Production Deployment Setup](docs/deployment.md)
*Docker configurations, Gunicorn workers configuration, Nginx upstream reverse-proxy routes, and server environment parameters.*

### 4. [CI/CD Pipelines & Independent Deployments](docs/cicd.md)
*Continuous integration and continuous deployment pipelines using GitHub Actions, Docker Hub triggers, and configuration synchronization.*

### 5. [Observability Stack (Prometheus & Grafana)](docs/monitoring.md)
*Host metrics scrapes, container resource audits, custom Prometheus alerts, and AWS EBS persistent disk volume configuration.*

### 6. [Troubleshooting & Operational Resolutions](docs/troubleshooting.md)
*Historical engineering challenges solved, including CORS errors, container health check migration dependencies, and network routing configurations.*

### 7. [Cloud Cost Analysis & Optimization](docs/cost-analysis.md)
*AWS monthly billing estimates and automated suspension schedules to minimize dev environment costs.*

### 8. [Future Improvements & Scaling Roadmap](docs/future-improvements.md)
*Infrastructure as Code (Terraform), AWS ECS/Fargate container orchestration, and Blue-Green zero-downtime deployment pipelines.*

---

## 💡 Key Solved Engineering Problems

* **Zero-Downtime Deployment Separation**: Built independent CI/CD pipelines so that static UI pushes target Amazon S3 directly without triggering container restarts on the EC2 instances.
* **Race Condition Prevention in Scheduling**: Employed database transactions with atomic checks to ensure doctor time-slots cannot be double-booked by concurrent requests.
* **Strict Network Isolation**: Secured the PostgreSQL data cluster inside subnets with no route to the internet, allowing socket access exclusively from backend container nodes.
