# Docker Deployment Guide

> Specialist Consultation Booking System — Group 22

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [File Reference](#file-reference)
- [Service Details](#service-details)
  - [MySQL 8](#1-mysql-8-database)
  - [Backend (Spring Boot)](#2-backend-spring-boot)
  - [Frontend (Vue 3 + Nginx)](#3-frontend-vue-3--nginx)
- [Docker Compose Commands](#docker-compose-commands)
- [Environment Variables](#environment-variables)
- [Data Persistence](#data-persistence)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                  consult-network                         │
│                                                          │
│  ┌──────────────┐       ┌──────────────────┐            │
│  │              │       │                  │            │
│  │   MySQL 8    │◄──────│  Spring Boot     │            │
│  │   port 3306  │ JDBC  │  port 8080       │            │
│  │              │       │                  │            │
│  └──────────────┘       └───────┬──────────┘            │
│                                 │                        │
│                                 │ /api proxy             │
│                                 ▼                        │
│                          ┌──────────────┐               │
│                          │              │               │
│                          │   Nginx      │  port 80      │
│                          │   Vue SPA    │               │
│                          │              │               │
│                          └──────┬───────┘               │
│                                 │                        │
└─────────────────────────────────┼────────────────────────┘
                                  │
                            Host port 5173
                                  │
                                  ▼
                          Browser (User)
```

### Communication Flow

| From | To | Protocol | Address |
|------|----|----------|---------|
| Browser | Nginx (Frontend) | HTTP | `http://localhost:5173` |
| Nginx | Spring Boot (Backend) | HTTP (proxy) | `http://backend:8080/api/*` |
| Spring Boot | MySQL | JDBC | `jdbc:mysql://mysql:3306/consult_db` |

> **Note:** Inside the Docker network, services communicate by container name (`mysql`, `backend`, `frontend`). Host port mappings (`3307`, `8080`, `5173`) are only for external access.

---

## Prerequisites

- **Docker** 24+ and **Docker Compose** v2+
- **Git** (to clone the repository)
- At least **2 GB** of free disk space for Docker images

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/545411679/202-Group_22.git
cd 202-Group_22
```

### 2. Start All Services

```bash
cd docker
docker compose up -d
```

This command:
- Pulls the MySQL 8.0 image (if not cached)
- Builds the backend image (Maven compile + package, then JRE runtime)
- Builds the frontend image (npm ci + vite build, then nginx runtime)
- Starts all three containers

### 3. Verify Deployment

```bash
# Check container status
docker compose ps

# Check backend logs (wait for "Started BookingApplication")
docker compose logs backend

# Test the API
curl -s http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123"}'
```

Expected response — a JSON object with a JWT token:
```json
{"token":"eyJ...","role":"ADMIN","userId":1,"name":"System Admin"}
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend (SPA) | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:8080](http://localhost:8080) |
| Swagger UI | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) |

### 5. Demo Accounts

All accounts use password **`Password123`**:

| Email | Role |
|-------|------|
| admin@example.com | Admin |
| alice@example.com | Client |
| dr.chen@example.com | Specialist |

---

## File Reference

All deployment files are in the `docker/` directory:

| File | Purpose |
|------|---------|
| [docker-compose.yml](docker-compose.yml) | Orchestrates all three services (MySQL, Backend, Frontend) |
| [Backend.Dockerfile](Backend.Dockerfile) | Multi-stage build: Maven compile → JRE runtime |
| [FrontEnd.Dockerfile](FrontEnd.Dockerfile) | Multi-stage build: npm build → nginx static serve |
| [nginx.conf](nginx.conf) | Nginx config: serves SPA + proxies `/api` to backend |

Plus one root-level file:

| File | Purpose |
|------|---------|
| [.dockerignore](../.dockerignore) | Excludes `node_modules`, `target`, `.git` from Docker build context |

---

## Service Details

### 1. MySQL 8 Database

- **Image:** `mysql:8.0`
- **Internal port:** 3306
- **Host port:** 3307 (avoids conflict with local MySQL on 3306)
- **Database:** `consult_db`
- **Root password:** `123456`
- **Data volume:** `mysql-data` → `/var/lib/mysql`
- **Health check:** `mysqladmin ping` every 10s

The backend waits for MySQL to be healthy before starting (via `depends_on` with `condition: service_healthy`).

#### Connecting via Host

```bash
mysql -h 127.0.0.1 -P 3307 -u root -p
# Password: 123456
```

### 2. Backend (Spring Boot)

- **Base image:** `eclipse-temurin:17-jre`
- **Internal port:** 8080
- **Host port:** 8080
- **Build:** Two-stage Maven build inside Docker

#### Environment Variables Override

These variables are passed to the container and override `application.properties`:

```yaml
SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/consult_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME: root
SPRING_DATASOURCE_PASSWORD: 123456
```

#### Build Cache Strategy

The Dockerfile is structured to maximise Docker layer caching:

1. **Copy `pom.xml` only** → `mvn dependency:go-offline` (cached until dependencies change)
2. **Copy `src/`** → `mvn clean package` (rebuilt only when source changes)
3. **JRE runtime stage** — the final image is lean (~330 MB) with only the JAR

### 3. Frontend (Vue 3 + Nginx)

- **Base image:** `nginx:alpine` (production, no dev server)
- **Container port:** 80
- **Host port:** 5173
- **Build:** `node:18-alpine` builds the SPA, then `nginx:alpine` serves it

#### Nginx Configuration

```nginx
# Serve the Vue SPA (with SPA fallback routing)
location / {
    try_files $uri $uri/ /index.html;
}

# Proxy API requests to the backend container
location /api {
    proxy_pass http://backend:8080;
}
```

> **Note:** The Vite dev proxy (in `vite.config.js`) is only used during local development (`npm run dev`). In the Docker deployment, Nginx replaces this functionality.

#### Build Output Size

The final frontend image is only **~64 MB** — the production build is tree-shaken and minified by Vite.

---

## Docker Compose Commands

All commands should be run from the `docker/` directory:

```bash
cd docker
```

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start all services in background |
| `docker compose up` | Start all services with live logs |
| `docker compose down` | Stop and remove containers (preserves MySQL data) |
| `docker compose down -v` | Stop and remove containers **and** delete MySQL data |
| `docker compose logs -f` | Follow all service logs |
| `docker compose logs backend` | View backend logs only |
| `docker compose logs frontend` | View frontend logs only |
| `docker compose ps` | Show container status |
| `docker compose build` | Rebuild images (without cache) |
| `docker compose build --no-cache` | Force full rebuild |
| `docker compose restart backend` | Restart a single service |
| `docker compose exec backend sh` | Open a shell in the backend container |

### Rebuilding After Code Changes

```bash
cd docker
docker compose build
docker compose up -d
```

Or for a single service:

```bash
docker compose build backend
docker compose up -d backend
```

---

## Environment Variables

The following Spring Boot properties are overridden via environment variables in `docker-compose.yml`:

| Environment Variable | Spring Property | Purpose |
|---------------------|-----------------|---------|
| `SPRING_DATASOURCE_URL` | `spring.datasource.url` | JDBC connection URL (points to `mysql` service) |
| `SPRING_DATASOURCE_USERNAME` | `spring.datasource.username` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | `spring.datasource.password` | Database password |

To customise these (e.g., for production), edit the `environment:` block in `docker-compose.yml`.

---

## Data Persistence

MySQL data is stored in a Docker volume named `consult-mysql-data`:

```bash
# Volume persists across restarts
docker compose down    # data survives
docker compose up -d   # data still there

# Delete volume (irreversible data loss)
docker compose down -v
```

To inspect or back up the volume:

```bash
docker run --rm -v mysql-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/mysql-backup.tar.gz -C /data .
```

---

## Troubleshooting

### Port Conflicts

If you see `port is already allocated`:

```bash
# Check what is using the port
netstat -ano | grep <PORT>

# Change host port in docker-compose.yml (e.g., 5173 → 5174)
ports:
  - "5174:80"
```

### MySQL Connection Refused

If the backend crashes with `CommunicationsException`:

```bash
# 1. Check if MySQL is healthy
docker compose ps mysql

# 2. Check MySQL logs
docker compose logs mysql

# 3. Wait for MySQL to be ready, then restart backend
docker compose restart backend
```

The health check waits up to ~100 seconds (`start_period: 30s` + `retries: 10` at `interval: 10s`).

### Docker Build Fails

```bash
# Network issues pulling images
docker pull mysql:8.0              # Test Docker Hub connectivity
docker compose build --no-cache    # Force fresh build

# Out of disk space
docker system prune -a             # Clean unused images/containers
```

### Application Errors

```bash
# Check application logs
docker compose logs -f backend

# Check if the database has the expected tables
docker compose exec mysql mysql -uroot -p123456 consult_db -e "SHOW TABLES;"

# Restart a single service
docker compose restart backend
```

### Container Exit Codes

| Exit Code | Meaning | Common Cause |
|-----------|---------|-------------|
| 0 | Clean exit | — |
| 1 | Application error | Spring Boot failed to start (check logs) |
| 137 | SIGKILL (128 + 9) | Out of memory or manual kill |
| 143 | SIGTERM (128 + 15) | Graceful shutdown (`docker compose down`) |
