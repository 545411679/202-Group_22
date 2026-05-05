# CHANGELOG

All notable changes to this project are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — Sprint 1

### Fixed — pom.xml (2026-04-07)
- Downgraded `spring-boot-starter-parent` from `4.0.3` → `3.4.5`
  - Spring Boot 4.x requires Java 21; team targets Java 17. Caused build failure on most machines.
- Replaced non-existent `spring-boot-starter-webmvc` → `spring-boot-starter-web` (correct artifact name)
- Replaced non-existent `spring-boot-starter-data-jpa-test` → `spring-boot-starter-test`
- Removed non-existent `spring-boot-starter-webmvc-test` (does not exist as a standalone artifact)
- Removed `spring-boot-starter-thymeleaf` (frontend is a separate Vue SPA; Thymeleaf not needed)
- Updated project identifiers: `groupId` `com.grooming` → `com.group22`, `artifactId` `pet` → `booking`
- Added JWT dependencies: `jjwt-api`, `jjwt-impl`, `jjwt-jackson` v0.12.6 (required for M1 auth)
- Added `spring-security-test` for test scope

### Planned — Backend full rewrite (in progress)
- Rewriting all entities, repositories, services, controllers, DTOs to align with:
  - `schema.sql` (canonical data model)
  - `api-contract-v2.md` (endpoint specs)
- See checkpoint plan in project notes
