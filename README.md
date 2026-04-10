# Group22's Specialist Consultation Booking System

**CPT202 Software Engineering — Group Project, Sprint 1**
Xi'an Jiaotong-Liverpool University · Year 3, Semester 2 · Group 22

---

A web-based platform for scheduling and managing consultations between clients and specialists. Three user roles are supported: client, specialist, and administrator. The system handles the full booking lifecycle — discovery, slot selection, booking confirmation, and status tracking.

This repository contains the Sprint 1 deliverable. The codebase is under active development; known limitations are noted at the bottom.

---

## Contents

- [System Overview](#system-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [How to Run](#how-to-run)
  - [1. Database](#1-database-mysql)
  - [2. Backend](#2-backend-spring-boot)
  - [3. Frontend](#3-frontend-vue)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Implemented Modules](#implemented-modules)
- [Known Issues](#known-issues)
- [Team](#team)

---

## System Overview

```
Client browser
     │
     ▼
Vue 3 SPA (Vite, Element Plus)          port 5173
     │  REST/JSON over HTTP
     ▼
Spring Boot 3 REST API                  port 8080
     │  JPA / Hibernate
     ▼
MySQL 8                                 port 3306
```

Authentication is JWT-based. The token is stored in `localStorage` and attached to every request via an Axios interceptor. Role-based routing is enforced on both the frontend (Vue Router guard) and backend (Spring Security filter chain).

---

## Tech Stack

| Layer      | Technology                    | Version   |
|------------|-------------------------------|-----------|
| Backend    | Java                          | 17        |
| Backend    | Spring Boot                   | 3.4.5     |
| Backend    | Spring Security               | (bundled) |
| Backend    | JJWT                          | 0.12.6    |
| Backend    | Hibernate / Spring Data JPA   | (bundled) |
| Backend    | springdoc-openapi (Swagger)   | 2.7.0     |
| Backend    | Maven                         | 3.9+ (wrapper included) |
| Database   | MySQL                         | 8.0+      |
| Frontend   | Vue 3                         | 3.5.12    |
| Frontend   | Vite                          | 5.4.10    |
| Frontend   | Element Plus                  | 2.8.4     |
| Frontend   | Pinia                         | 2.2.4     |
| Frontend   | Vue Router                    | 4.4.5     |
| Frontend   | Axios                         | 1.7.7     |
| Frontend   | Node.js                       | 18+       |

---

# Prerequisites

The following must be installed before running the project. If starting from a clean machine, install in the order listed.

### Java 17 (if you have java 17or 17+, skip this step)(check by running java -version)
install:
Spring Boot 3.x requires Java 17 or higher. Java 21 also works.

Download: search in browser, find one
Choose the **JDK** (not JRE), select your OS, and run the installer. To verify:

```bash
java -version
# Expected: openjdk version "17.x.x" ...
```

If `java -version` is not recognised after install, add the JDK `bin` directory to your system `PATH`. On Windows: System Properties → Environment Variables → Path → Add `C:\Program Files\Eclipse Adoptium\jdk-17.x.x\bin` (adjust to your install path).

### Maven(dont need manual install. when running this in /Backend folder, maven will auto install: .\mvnw spring-boot:run)

The backend includes the Maven wrapper (`mvnw` / `mvnw.cmd`), so a global Maven install is not required. The wrapper downloads Maven 3.9 automatically on first use, provided Java is on your `PATH`.

If you prefer a global install: https://maven.apache.org/download.cgi

### MySQL 8

Download: https://dev.mysql.com/downloads/installer/

The **MySQL Installer (Windows)** or **MySQL Community Server** is sufficient. During setup:
- Set root password (the project defaults to `123456`)
- Keep default port `3306`
- Enable "Start MySQL Service on system startup"

MySQL Workbench is optional but useful for inspecting data: https://dev.mysql.com/downloads/workbench/

To verify MySQL is running:

```bash
mysql -u root -p
# Enter your password — should see the mysql> prompt
```

### Node.js 18+

Download: https://nodejs.org/en/download (choose the LTS version, currently 20.x)

The installer also includes `npm`. To verify:

```bash
node -v
# Expected: v18.x.x or v20.x.x

npm -v
# Expected: 10.x.x
```

### Git

Download: https://git-scm.com/downloads

---

# How to Run
## case 2: not first run but later test run:
in /Backend folder. 1. open terminal, 2. run:
```bash
./mvnw spring-boot:run        # Linux / macOS
mvnw.cmd spring-boot:run      # Windows
```
then in /Frontend folder, 3. open terminal, 4. run:
```bash
npm run dev
```
then press ctrl+click open link of frontend.

## case 1: first time run: mysql setup and project dependencies install
### (1. Database (MySQL)

The application creates and seeds the database automatically on first startup. You only need to create an empty schema:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS consult_db;"
```

Or in MySQL Workbench, run:

```sql
CREATE DATABASE IF NOT EXISTS consult_db;
```

```properties
spring.datasource.username=root
spring.datasource.password=123456
```

### (2. Backend (Spring Boot)

Open a terminal in the project root:

```bash
cd Backend
./mvnw spring-boot:run        # Linux / macOS
mvnw.cmd spring-boot:run      # Windows
```

The first run downloads all Maven dependencies (~200 MB). Subsequent starts are fast. On startup the application seeds all demo accounts, categories, specialist profiles, and time slots automatically.

The API is available at `http://localhost:8080`.

Swagger UI (interactive API docs): `http://localhost:8080/swagger-ui/index.html`

> **IntelliJ IDEA users:** import as a Maven project, then run `BookingApplication.java`. No additional configuration needed.
>
> IntelliJ IDEA Community (free): https://www.jetbrains.com/idea/download/
> Spring Tool Suite 4 (free, Eclipse-based): https://spring.io/tools

### 3. Frontend (Vue)

Open a **second terminal** — the backend must keep running in the first one:

```bash
cd FrontEnd/booking-app
npm install
npm run dev
```

`npm install` only needs to run once, or after `package.json` changes. The development server starts at `http://localhost:5173`.

---

## Demo Accounts

All accounts share the password **`Password123`**.

| Email                       | Role        | Notes                          |
|-----------------------------|-------------|--------------------------------|
| admin@example.com           | Admin       | Full system access             |
| dr.chen@example.com         | Specialist  | General Consultation, Senior   |
| sarah.miller@example.com    | Specialist  | Mental Health, Expert          |
| james.park@example.com      | Specialist  | Career Coaching, Senior        |
| dr.liu@example.com          | Specialist  | Nutrition & Diet, Intermediate |
| emily.hart@example.com      | Specialist  | Legal Advice, Senior           |
| alice@example.com           | Client      | —                              |
| bob@example.com             | Client      | —                              |
| carol@example.com           | Client      | —                              |
| david@example.com           | Client      | —                              |

New accounts can be registered through the UI. New specialist registrations require admin approval before appearing in search results.

---

## Project Structure

```
202-Group_22/
├── Backend/                        Spring Boot backend
│   ├── src/main/java/
│   │   └── com/grooming/pet/
│   │       ├── config/             Security config, JWT, data seeding
│   │       ├── controller/         REST endpoints (Auth, Specialist, Booking, Admin)
│   │       ├── dto/                Request / response DTOs
│   │       ├── exception/          Exception types + global handler
│   │       ├── model/              JPA entities (User, Specialist, Slot, Booking...)
│   │       ├── repository/         Spring Data JPA interfaces
│   │       └── service/            Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── schema.sql                  Reference DDL (informational)
│   └── pom.xml
│
│
└── FrontEnd/booking-app/           Vue 3 single-page application
    └── src/
        ├── api/                    Axios API layer (all HTTP calls in one place)
        ├── components/             AppLayout, AdminLayout
        ├── composables/            usePagination
        ├── router/                 Vue Router + role-based navigation guard
        ├── stores/                 Pinia auth store (token, role, user info)
        └── views/
            ├── shared/             Landing, specialist public profile, change password
            ├── customer/           Dashboard, search, booking wizard, session detail
            ├── specialist/         Dashboard, slot management, session requests, profile
            └── admin/              Dashboard, users, profile approvals, sessions,
                                    categories, announcements, activity logs
```

---

## Implemented Modules

| Module | Description                         | Status   |
|--------|-------------------------------------|----------|
| M1     | User Auth & Access Control          | Done     |
| M2     | Specialist Profile Management       | Done     |
| M3     | Availability & Schedule Management  | Done     |
| M4     | Booking & Appointment Flow          | Done     |
| M5     | Search & Discovery                  | Done     |
| M6     | Booking Status & Lifecycle          | Done     |
| M7     | Client Dashboard & History          | Done     |
| M8     | Admin Panel                         | Done     |

Full API documentation for all endpoints is at `http://localhost:8080/swagger-ui/index.html` when the backend is running.

---

## Known Issues

- Email notifications are not implemented. Status changes are tracked in the UI only.
- No file upload for specialist credentials or profile photos.
- The Financial Planning category is seeded but no specialists are assigned to it in demo data.
- Slot dates in seed data are calculated relative to the current date, so they reset on each backend restart. Slots expire as real calendar days pass.

---

## Team

Group 22 · CPT202 Software Engineering · XJTLU · 2025–2026

Eight members. Scrum methodology, two-week sprints. Sprint 1 delivered a functional end-to-end system covering all 8 planned modules.
