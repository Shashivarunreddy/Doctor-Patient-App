# Troubleshooting Log & Operational Resolutions

This document records the engineering challenges, runtime issues, network configurations, and deployment conflicts encountered during the development and cloud migration of the Docco360 platform, along with their solutions.

---

## Purpose
This document provides reference notes and debug strategies for engineers investigating infrastructure errors, database connectivity issues, and container runtime crashes.

## Scope
The scope covers troubleshooting logs for Docker container connectivity, CORS headers validation, database migration startup delays, database drivers conflicts, and AWS network routing blocks.

---

## Resolved Engineering Problems

### 1. Database Migration Startup Crashes
* **Symptom**: The backend container failed and restarted repeatedly on initial deploy. Docker logs displayed connection timeouts: `Connection refused on database port 5432`.
* **Root Cause**: The backend application server began booting and executing database migrations (`npx prisma migrate deploy` / Python DB migrations) before the PostgreSQL database container had finished initializing its cluster and socket listeners.
* **Resolution**: Replaced the basic list-based dependency check in `docker-compose.yaml` with a stateful docker health check:
  ```yaml
  services:
    db:
      image: postgres:16-alpine
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
        interval: 10s
        timeout: 5s
        retries: 5

    backend:
      depends_on:
        db:
          condition: service_healthy
  ```

---

### 2. Browser CORS Violations on API Calls
* **Symptom**: Users could load the login page, but submitting credentials failed. The browser console displayed errors: `Access to fetch at 'http://<IP>:5000/api' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present`.
* **Root Cause**: The React client-side application was compiled with a hardcoded `VITE_API_URL` pointing directly to the backend container port `5000`. This constituted a cross-origin request because the frontend was loaded on port `80`, bypassing the reverse proxy and violating browser origin protections.
* **Resolution**: 
  - Rebuilt the frontend static assets with relative API targets (`VITE_API_URL=/api`).
  - Configured Nginx to intercept all `/api/` traffic on port `80` and proxy requests to the backend server inside the internal Docker network. Both services now share the same domain and port, eliminating the need for wildcard CORS headers on the API.

> Screenshot:
>
> Browser Console CORS Error

---

### 3. IP Drift on Container Reboots
* **Symptom**: After restarting the EC2 instance, the frontend could no longer connect to the backend API.
* **Root Cause**: AWS assigns a new public IP address to standard EC2 instances upon restart. Since the frontend's API targets were mapped to the public IP address, the configuration broke after the reboot.
* **Resolution**: 
  - Allocated an **Elastic IP** and attached it to the public-facing gateways.
  - Subsequently migrated the backend instances behind an **Application Load Balancer (ALB)**, routing traffic through a stable domain name (`docco.arakutravels.com`) rather than raw IP addresses.

---

### 4. Prisma CJS vs ESM Client Generation (Code parity issue)
* **Symptom**: During Node-to-Prisma execution, the backend container crashed with: `SyntaxError: Cannot use 'import.meta' outside a module`.
* **Root Cause**: The `schema.prisma` configuration generated an ESM client block, but the backend Node engine was executing as a CommonJS module, causing import syntax conflicts.
* **Resolution**: Updated `schema.prisma` to explicitly enforce JS client output:
  ```prisma
  generator client {
    provider = "prisma-client-js"
  }
  ```
  This compiled CJS compatible assets, which were successfully loaded in the Docker stage.

---

## Diagnostic Commands Reference

Use these command patterns inside the EC2 instance shell to diagnose runtime container states:

```bash
# View real-time container log outputs
docker compose logs -f --tail=100 backend

# Execute a shell inside the database container to inspect schema tables
docker exec -it oshadhi_db psql -U oshadhi_user -d doctor_patient_app

# Check local route table policies
ip route show
```

> Screenshot:
>
> Terminal showing Docker Logs
