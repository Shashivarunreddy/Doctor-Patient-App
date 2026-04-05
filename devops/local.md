
# Phase 1 — Local Development Setup
> Doctor-Patient App | Verified: April 2026 | OS: Windows 11

---

## Overview
This document covers the complete local development setup for the Doctor-Patient App.
The goal of Phase 1 was to verify the full stack runs correctly on a local machine
before containerization (Phase 2) and cloud deployment (Phase 3).

**Stack:**
- Frontend: React + Vite (TypeScript)
- Backend: Node.js + Express + TypeScript + Prisma ORM
- Database: PostgreSQL 18 (local)
- Video: Agora RTC (token-based)

---

## Prerequisites

| Tool | Version Verified | Install |
|------|-----------------|---------|
| Node.js | v22.13.1 | https://nodejs.org |
| npm | v11.5.2 | Comes with Node |
| PostgreSQL | v18.1 | https://www.postgresql.org/download/windows/ |
| Git | any | https://git-scm.com |

### Windows PATH Fix for PostgreSQL
After installing PostgreSQL on Windows, add it to PATH permanently:
```powershell
# Run in PowerShell (replace 18 with your version)
[System.Environment]::SetEnvironmentVariable(
  "PATH",
  $env:PATH + ";C:\Program Files\PostgreSQL\18\bin",
  [System.EnvironmentVariableTarget]::User
)
```

Verify:
```bash
psql --version
# Expected: psql (PostgreSQL) 18.1
```

---

## Step 1 — Clone the Repo
```bash
git clone <repo-url>
cd Doctor-Patient-App
git checkout main
git log --oneline -1
# Verify you are on commit: 10fd627
```

---

## Step 2 — Local PostgreSQL Setup

### 2a. Start PostgreSQL service
```powershell
# PowerShell as Administrator
Start-Service -Name postgresql-x64-18
```

### 2b. Create local database and user
```bash
# Connect as superuser
psql -U postgres
```
```sql
-- Inside psql
CREATE DATABASE doctor_patient_app;
CREATE USER oshadhi_user WITH PASSWORD '<your_local_password>';
GRANT ALL PRIVILEGES ON DATABASE doctor_patient_app TO oshadhi_user;
\q
```

> ⚠️ Use a simple password with no special characters (avoid `@`, `#`, `$`)
> to prevent URL encoding conflicts in `DATABASE_URL`

### 2c. Verify connection
```bash
psql -U oshadhi_user -d doctor_patient_app -h localhost
# Should connect without errors
\q
```

---

## Step 3 — Backend Setup

### 3a. Install dependencies
```bash
cd backend
npm install
```

### 3b. Create backend/.env
Create a file at `backend/.env` using this template:
```env
# Database — local PostgreSQL
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/doctor_patient_app"

# Agora (get from client)
APP_ID=<agora_app_id>
APP_CERTIFICATE=<agora_app_certificate>

# Server
PORT=5000

# JWT
JWT_ACCESS_SECRET=<any_strong_random_string>
JWT_REFRESH_SECRET=<any_strong_random_string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# CORS
FRONTEND_URL=http://localhost:5173

# Admin seed credentials
ADMIN_EMAIL=admin@oshadhi.com
ADMIN_PASSWORD=<your_admin_password>
```

> ⚠️ Never commit `.env` to Git — it is already in `backend/.gitignore`

### 3c. Verify all env keys are present
```bash
node -e "
const required = [
  'APP_ID', 'APP_CERTIFICATE', 'PORT', 'DATABASE_URL',
  'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRY', 'JWT_REFRESH_EXPIRY',
  'BCRYPT_SALT_ROUNDS', 'FRONTEND_URL', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'
];
require('dotenv').config();
required.forEach(k => {
  const ok = !!process.env[k];
  console.log((ok ? '✅' : '❌ MISSING') + ' ' + k);
});
"
```

All keys should show ✅

### 3d. Generate Prisma client
```bash
npx prisma generate
```

### 3e. Run database migrations
```bash
npx prisma migrate deploy
```

Expected output — 5 migrations applied:
- Initial schema (User, DoctorProfile, PatientProfile, TimeSlot)
- Appointment migration (20260405064018)

### 3f. Verify tables in database
```bash
npx prisma studio
# Opens at http://localhost:5555
```

Confirm these tables exist:
- `User`
- `DoctorProfile`
- `PatientProfile`
- `TimeSlot`
- `Appointment`
- `_prisma_migrations` → should show 5 rows

### 3g. Compile and start backend
```bash
npx tsc
node dist/server.js
```

Expected output:
Admin user already exists, skipping seed.
Server running on port 5000
### 3h. Verify backend is responding
Open browser → `http://localhost:5000`

Expected response:
```json
{"success": false, "message": "Route not found"}
```
This is correct — it means Express is running and the global error handler is active.

---

## Step 4 — Frontend Setup

### 4a. Install dependencies
```bash
cd frontend
npm install
```

### 4b. Create frontend/.env
```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ `frontend/.env` is git ignored — never commit this file

### 4c. Start frontend
```bash
npm run dev
```

Expected output:
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
---

## Step 5 — Smoke Test

Before full flow testing, confirm all three layers are connected:

- [ ] Open `http://localhost:5173` in browser
- [ ] Open DevTools → Network tab
- [ ] Navigate to login page
- [ ] Confirm API requests go to `http://localhost:5000`
- [ ] No CORS errors in browser console
- [ ] Backend terminal shows incoming request logs

---

## Step 6 — Verified Flows

All flows below were verified end-to-end against local backend and local database:

### Auth
- Doctor registration → login blocked until admin approval
- Patient registration → immediate login
- Admin login → full dashboard access
- Deactivated user → login blocked with error
- Rejected doctor → rejection message on login
- Silent JWT refresh → works correctly (shared refresh promise, no race condition)

### Admin
- Platform stats dashboard loads
- Pending doctor approval list renders
- Approve doctor → doctor can now log in
- Reject doctor → doctor gets rejection message
- Activate / Deactivate doctor → status updates correctly
- View all patients → renders
- View all appointments → renders
- Cancel appointment → status updates

### Doctor
- Profile view and edit works
- 30-minute slot generation works (Manage Slots page)
- Appointment list loads
- Agora call token generated on join
- Call end updates appointment status

### Patient
- Doctor directory shows only active + approved doctors
- Doctor detail page loads
- Available slots visible on booking page
- Appointment booking completes (mock payment flow)
- Appointment list loads
- Agora call token generated on join
- Call end updates appointment status

---

## Step 7 — Known Issues Fixed During Phase 1

### 1. Admin password was hardcoded
**Before:** `Admin@1234` was hardcoded in `auth.service.ts`
**After:** Now read from `ADMIN_PASSWORD` env var via `env.ts`
**Impact:** Backend fails fast on startup if `ADMIN_PASSWORD` is missing

### 2. ts-node-dev EPERM error on Windows
**Before:** `npm run dev` failed on Windows with spawn `EPERM` error
**After:** Dev script changed to `npx tsc && node dist/server.js`
**Impact:** Reliable local startup on Windows

### 3. frontend/.env not git ignored
**Before:** `frontend/.env` was untracked and at risk of accidental commit
**After:** Added `.env`, `.env.local`, `.env.production` to `frontend/.gitignore`
**Impact:** No risk of leaking API URLs or future secrets via git

---

## Step 8 — Windows-Specific Notes

| Issue | Cause | Fix |
|-------|-------|-----|
| `psql` not recognized | PostgreSQL not in PATH | Add `C:\Program Files\PostgreSQL\18\bin` to PATH |
| `EPERM` on ts-node-dev | Windows sandbox restriction | Use `npx tsc && node dist/server.js` |
| `%40` in DATABASE_URL | `@` in password URL-encoded | Use passwords without special characters locally |
| Port already in use | Another process on 5000 | `netstat -ano \| findstr :5000` then kill the PID |

---

## Red Flags Reference

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `Missing required env var` | Key absent from `.env` | Check `env.ts`, add missing key |
| `PrismaClientInitializationError` | Wrong `DATABASE_URL` | Verify local Postgres is running and URL is correct |
| `relation does not exist` | Migrations not run | Run `npx prisma migrate deploy` |
| `connect ECONNREFUSED 5432` | Postgres not running | Run `Start-Service postgresql-x64-18` |
| CORS error in browser | `FRONTEND_URL` mismatch | Must exactly match `http://localhost:5173` |
| Admin seed crash on restart | No upsert guard | Check `server.ts` — seed uses upsert, safe to restart |
| Agora token error | Wrong `APP_ID` or `APP_CERTIFICATE` | Verify Agora credentials in `.env` |

---

## Phase 1 Sign-off

| Item | Status |
|------|--------|
| Local PostgreSQL running on port 5432 | ✅ |
| Database `doctor_patient_app` created | ✅ |
| All 5 Prisma migrations applied | ✅ |
| All 5 tables verified in DB | ✅ |
| Backend compiles with `npx tsc` | ✅ |
| Backend starts on port 5000 | ✅ |
| Admin seed runs correctly | ✅ |
| Frontend starts on port 5173 | ✅ |
| Frontend talks to backend (no CORS errors) | ✅ |
| All 3 roles verified end-to-end | ✅ |
| Video call token generation verified | ✅ |
| Admin password externalized to env | ✅ |
| Windows dev script fixed | ✅ |
| Frontend .env git ignored | ✅ |

---

## Next Step → Phase 2: Docker Compose
→ See [docker.md](./docker.md)

