# CI/CD Pipeline & Independent Deployments

This document describes the automated CI/CD pipeline, repository structure, environment variables, and deployment isolation rules of the Docco360 application platform.

---

## Purpose
This document provides specifications on the continuous integration and continuous deployment pipelines managed via GitHub Actions to deploy frontend assets to S3/CloudFront and update backend and monitoring containers on AWS EC2.

## Scope
The scope covers GitHub Actions workflow configurations, build environments, deployment steps, container update strategies, and secrets management.

---

## Deployment Architecture

The deployment architecture enforces an **Independent Deployment Strategy**. Frontend builds, backend updates, and monitoring changes are isolated from one another to prevent service interruption.

```text
  [ Code Push to GitHub ]
             |
             +--- (frontend/**) ---> [ Frontend CI/CD Pipeline ]
             |                                |
             |                                +---> S3 Bucket & CloudFront Invalidation
             |
             +--- (backend/**)  ---> [ Backend CI/CD Pipeline ]
             |                                |
             |                                +---> Docker Build -> DockerHub -> EC2 Container Up
             |
             +--- (monitoring/**)--> [ Monitoring CI/CD Pipeline ]
                                              |
                                              +---> SCP Configs -> EC2 -> Recreate Observability
```

---

## Deployment Pipeline Workflows

### 1. Frontend CI/CD (`.github/workflows/frontend-cloudfront.yml`)
* **Trigger**: Push to branch `main` modifying files under `frontend/**`.
* **Execution Steps**:
  1. **Checkout**: Checks out the git repository.
  2. **Install**: Installs Node dependencies (`npm install`).
  3. **Build**: Compiles the React SPA using Vite (`npm run build`).
  4. **Credentials**: Configures AWS credential environments via IAM user keys.
  5. **Sync**: Copies the compiled build directory to the Amazon S3 bucket (`aws s3 sync dist/ s3://docco-web-bucket/`).
  6. **CDN Invalidation**: Invalidates cached assets in CloudFront to push updates immediately (`aws cloudfront create-invalidation --distribution-id CF_DIST_ID --paths "/*"`).

---

### 2. Backend CI/CD
The backend pipeline is split into build and deployment workflows.

#### Build Workflow (`.github/workflows/backend-ci.yml`)
* **Trigger**: Push to branch `main` modifying files under `backend/**`.
* **Execution Steps**:
  1. **Checkout**: Checks out the git repository.
  2. **Docker Build**: Compiles the Python/Flask image, tagging it with the target Git Commit SHA and the `latest` marker.
  3. **Login**: Logs into the Docker Hub registry using token secrets.
  4. **Push**: Publishes the compiled image to the Docker Hub registry (`sriharshareddy6464/doc-backend`).

#### Deployment Workflow (`.github/workflows/backend-deploy.yml`)
* **Trigger**: Dispatches automatically after the successful completion of the `Backend CI` run.
* **Execution Steps**:
  1. **SSH Connection**: Establishes an SSH tunnel through the Bastion Host to the private EC2 instance.
  2. **Docker Pull**: Pulls the Docker image matching the target Git SHA from Docker Hub.
  3. **Service Re-creation**: Executes Docker Compose to pull the image and recreate only the backend API container:
     ```bash
     docker compose pull backend
     docker compose up -d --force-recreate --no-deps backend
     ```
  *Note: Only the backend service is restarted. The database and monitoring containers remain online.*

---

### 3. Monitoring CI/CD (`.github/workflows/monitoring.yml`)
* **Trigger**: Push to branch `main` modifying files under `monitoring/**` or `docker-compose.yaml`.
* **Execution Steps**:
  1. **Checkout**: Checks out the git repository.
  2. **Config Copy (SCP)**: Securely copies files under the `monitoring/` directory to the server:
     ```bash
     scp -r monitoring/* user@ec2:~/doctoroncall/
     ```
  3. **Validate Config**: Connects via SSH to run `docker compose config --quiet` to validate syntax structure.
  4. **Update Stack**: Pulls and recreates the monitoring container stack without interrupting the backend container:
     ```bash
     docker compose pull prometheus grafana node-exporter cadvisor
     docker compose up -d --force-recreate --no-deps prometheus grafana node-exporter cadvisor
     ```

---

## Deployment Isolation Matrix

| Component | Trigger Directory | Deployment Target | Container Restart |
| :--- | :--- | :--- | :--- |
| **Frontend** | `frontend/**` | Amazon S3 + CloudFront | None (Static files only) |
| **Backend** | `backend/**` | AWS EC2 Private Subnet | Recreates `docco_backend` |
| **Monitoring** | `monitoring/**` | AWS EC2 Private Subnet | Recreates `docco_prometheus`, `docco_grafana` |

---

## Secrets Management Configuration

The pipeline requires the following secrets to be declared within **GitHub Repository Settings → Secrets and Variables → Actions**:

| Secret Name | Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | IAM User access key for S3 bucket writes. |
| `AWS_SECRET_ACCESS_KEY` | IAM User secret key for S3 bucket writes. |
| `AWS_REGION` | Target AWS region (e.g. `us-east-1`). |
| `DOCKERHUB_USERNAME` | Docker Hub registry credentials. |
| `DOCKERHUB_TOKEN` | Personal Access Token (PAT) for Docker Hub. |
| `EC2_HOST` | Public Elastic IP address of the EC2 instance. |
| `EC2_USER` | Target deployment user (e.g. `ubuntu`). |
| `EC2_SSH_KEY` | Private SSH key (PEM) for EC2 host access. |

---

## Operational Verification

Verify the success status of running workflows.

> Screenshot:
>
> GitHub Actions Successful Pipelines

Verify that the target images are correctly published to the registry.

> Screenshot:
>
> Docker Hub Repository Registry
