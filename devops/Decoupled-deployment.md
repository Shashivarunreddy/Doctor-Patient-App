# Deployment Architecture Refactor: Independent Frontend and Backend Deployments

## Background

The production deployment pipeline previously used a single deployment workflow triggered by both Frontend CI and Backend CI workflows.

The deployment process attempted to pull both frontend and backend Docker images using the same commit SHA and redeploy the entire application stack regardless of which component changed.

This introduced multiple operational issues:

* Frontend deployments depended on backend image availability.
* Backend deployments depended on frontend image availability.
* Missing SHA-tagged images could block production deployments.
* A change in one component could unnecessarily recreate unrelated containers.
* Deployment failures became difficult to troubleshoot because frontend and backend release paths were coupled.

---

## Problem Statement

The application repository contains independently developed components:

* Frontend
* Backend

Each component follows its own development lifecycle and release cadence.

However, production deployment treated frontend and backend as a single deployment unit.

As a result:

* Backend-only changes could fail deployment if frontend SHA images were unavailable.
* Frontend-only changes could fail deployment if backend SHA images were unavailable.
* Production deployments were tightly coupled to shared SHA resolution.
* Container recreation occurred even when unrelated services had not changed.

---

## Refactor Overview

The deployment workflow was separated into two independent deployment jobs:

### Backend Deployment

Triggered only when:

* Backend CI completes successfully.
* Changes reach the main branch.

Deployment behavior:

* Attempts deployment using the backend SHA-tagged image.
* Falls back to latest image if SHA image is unavailable.
* Recreates only the backend container.
* Does not restart frontend services.

---

### Frontend Deployment

Triggered only when:

* Frontend CI completes successfully.
* Changes reach the main branch.

Deployment behavior:

* Attempts deployment using the frontend SHA-tagged image.
* Falls back to latest image if SHA image is unavailable.
* Recreates only the frontend container.
* Does not restart backend services.

---

## Deployment Characteristics

### Independent Release Paths

Frontend and backend deployments can now occur independently.

A backend release no longer requires:

* Frontend image availability.
* Frontend container recreation.

A frontend release no longer requires:

* Backend image availability.
* Backend container recreation.

---

### SHA-Based Deployments

Each deployment attempts to use the exact Git commit SHA generated during CI.

This improves:

* Traceability
* Rollback visibility
* Release auditing

Fallback behavior exists to prevent deployment interruptions when SHA-tagged images are unavailable.

---

### Reduced Production Impact

Container recreation is now scoped to the service being deployed.

Examples:

* Backend deployment → backend container only.
* Frontend deployment → frontend container only.

This reduces unnecessary service restarts and minimizes deployment risk.

---

## Result

The production deployment architecture now supports:

* Independent frontend deployments.
* Independent backend deployments.
* Service-specific container recreation.
* SHA-based image deployment.
* Fallback deployment protection.
* Reduced deployment coupling.

This establishes a cleaner deployment foundation for future infrastructure changes, including frontend migration to S3 and CloudFront while maintaining backend services on EC2.
