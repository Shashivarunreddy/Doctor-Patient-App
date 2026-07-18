# Production Deployment Setup

This document details the production setup, containerization configurations, application servers, and execution controls of the Docco360 application services.

---

## Purpose
This document provides instructions and specifications to reproduce the containerized runtime environment of the Docco360 application backend and load-balancer layers on AWS.

## Scope
The scope covers Docker configurations, Gunicorn WSGI runtime variables, Nginx reverse proxy layouts, and runtime environment setups.

---

## Containerization Strategy

The backend API is containerized using Docker, enabling consistent deployment states from local verification to cloud staging.

### Dockerfile (Backend Service)
The backend container uses a multi-stage build process to compile dependencies and generate a lightweight production image.

```dockerfile
# Stage 1 - Build dependencies
FROM python:3.11-alpine AS builder
WORKDIR /app
COPY requirements.txt .
RUN apk add --no-cache mariadb-dev gcc musl-dev postgresql-dev
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2 - Production runtime
FROM python:3.11-alpine
WORKDIR /app
RUN apk add --no-cache libpq mariadb-connector-c
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 5000
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "app:app"]
```

### WSGI Server Configuration (Gunicorn)
The Flask application is served by **Gunicorn** in production to support concurrency:
- **Workers**: Configured to `4` (calculated dynamically as `2 * CPU cores + 1`).
- **Binding**: Binds to socket `0.0.0.0:5000` inside the container namespace.
- **Process Management**: Handles worker timeouts and logs access/error output to standard stdout/stderr for CloudWatch streaming.

---

## Production Docker Compose (`docker-compose.yaml`)

A single `docker-compose.yaml` coordinates services on the EC2 instances, isolating dynamic containers while ensuring configuration consistency.

```yaml
version: '3.8'

services:
  backend:
    image: sriharshareddy6464/doc-backend:latest
    container_name: docco_backend
    restart: always
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require
      - PORT=5000
    command: gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
    expose:
      - "5000"
    security_opt:
      - no-new-privileges:true

  nginx:
    image: nginx:alpine
    container_name: docco_nginx
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
```

---

## Nginx Reverse Proxy Configuration (`nginx.conf`)

Nginx runs on port `80` to act as an internal routing gateway inside the host, passing requests to the Gunicorn socket and handling static caching headers.

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream backend_servers {
        server backend:5000;
    }

    server {
        listen 80;
        server_name localhost;

        # Gzip Compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript;

        # API Request Routing
        location /api/ {
            proxy_pass http://backend_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 90;
        }

        # Error Handling
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
```

---

## Environment Variables Configuration (`.env`)

Secrets are loaded at container runtime using a `.env` configuration file on the server.

```env
# Database Credentials
DB_HOST=docco-prod-db.crw35abcdef.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=docco360
DB_USER=docco_db_user
DB_PASSWORD=SecureProductionPasswordHash123!

# App Configurations
FLASK_ENV=production
SECRET_KEY=a_very_strong_cryptographic_random_key_here

# Agora Integrations
AGORA_APP_ID=54a123abc456def789...
AGORA_APP_CERTIFICATE=90d123ef456abc...
```

---

## Operational Verification

Verify the deployment status on the EC2 host using command line parameters.

```bash
# Check running containers
docker compose ps
```

> Screenshot:
>
> Docker Containers Status

```bash
# Verify Gunicorn is answering API requests
curl -I http://localhost:5000/health
```
