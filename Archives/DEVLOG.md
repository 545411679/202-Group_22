# DEVLOG — Sprint 1 Backend Rewrite
**Project:** Specialist Consultation Booking System — Group 22
**Format:** Ongoing log of decisions, risks, open questions, and issues.
           Add new entries at the top of each section (newest first).

---

## Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-04-07 | Use Spring Boot 3.4.5 (not 4.x) | SB4 requires Java 21; team targets Java 17. Safer and better documented. |
| 2026-04-07 | Keep package `com.grooming.pet` | Renaming requires directory restructuring with no functional benefit. |
| 2026-04-07 | Role checks in service layer, not URL-based rules | Service-layer checks stay colocated with the logic they protect. Easier to maintain. |
| 2026-04-07 | Defer certificate file upload to Sprint 2 | Requires file storage infrastructure not yet decided. Sprint 1 focuses on core booking flow. |
| 2026-04-07 | Add `categories` table (Option B) | API contract defines admin-managed categories and `GET /api/categories`. Free text specialty is not sufficient. |
| 2026-04-07 | JWT stateless auth, no session | Matches API contract spec. Simpler for REST API. |

---

## Predicted Risks

### HIGH — Will likely block the build if not handled

**R1: CORS not configured**
Frontend (Vue, port 5173) calls backend (port 8080). Browsers block cross-origin requests by default.
Without CORS config in `SecurityConfig`, every API call from the frontend silently fails with a CORS error.
This is one of the most common causes of "the backend is running but the frontend can't reach it."
Fix: Add `.cors(cors -> cors.configurationSource(...))` in SecurityConfig allowing `http://localhost:5173`.

**R2: JWT secret key too short**
jjwt 0.12.x enforces a minimum 256-bit (32-character) secret for HMAC-SHA256.
A short secret causes a `WeakKeyException` at startup.
Fix: Ensure `jwt.secret` in application.properties is at least 32 characters.

**R3: data.sql runs before Hibernate creates tables**
`spring.sql.init.mode=always` runs data.sql on startup.
If `spring.jpa.defer-datasource-initialization=true` is missing, data.sql runs before
Hibernate has created the tables → SQL error → app fails to start.
Fix: Confirm this property is present in application.properties.

**R4: Spring Security default config blocks everything**
Adding `spring-boot-starter-security` auto-configures a default security layer that rejects
all requests. A custom `SecurityConfig` must be present and correct or nothing works.
Common mistake: partial config that still blocks login/register endpoints.
Fix: Explicitly `permitAll()` on register and login; ensure filter chain is complete.

---

### MEDIUM — Will cause bugs that are hard to trace

**R5: BCrypt mismatch in seed data**
data.sql seeds test users with passwords. If plain text is used instead of BCrypt hashes,
login always returns 401 for seed users even though the user exists.
Fix: Pre-hash passwords using BCrypt. Hash for `Password123`:
`$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

**R6: LocalDate/LocalTime serialize as arrays**
Jackson doesn't know how to serialize Java 8 date/time types by default.
Without config, `LocalDate` becomes `[2026, 4, 8]` instead of `"2026-04-08"` in JSON.
Fix: Add to application.properties:
`spring.jackson.serialization.write-dates-as-timestamps=false`

**R7: BookingSlot composite primary key**
JPA composite PKs require either `@EmbeddedId` (separate ID class) or `@IdClass`.
Wrong setup causes startup errors or silent data corruption.
Fix: Use `@EmbeddedId` with a `BookingSlotId` class implementing `Serializable` with correct
`equals()` and `hashCode()`.

**R8: Concurrent slot booking (race condition)**
Two clients booking the same slot at the same millisecond could both pass the availability check
before either has written to the DB.
The `UNIQUE (slot_id)` constraint on `booking_slots` is the final guard (will throw a DB error),
but the service should catch that and return 409, not 500.
Fix: `@Transactional` on `BookingService.createBooking()`, catch `DataIntegrityViolationException`
and convert to `ConflictException`.

**R9: SPECIALIST login requires second query**
When a SPECIALIST logs in, `AuthService.login()` must also fetch the `specialistId` from the
`specialists` table. If the specialist hasn't created a profile yet, this returns null (valid).
Easy to forget this second query, returning `specialistId: null` always.
Fix: In `AuthService.login()`, after generating JWT, call
`specialistRepository.findByUser(user).map(Specialist::getId).orElse(null)`.

**R10: `GlobalExceptionHandler` missing Spring's own exceptions**
If `HttpMessageNotReadableException` (malformed JSON body) or `MethodArgumentNotValidException`
(@Valid failure) are not caught by the global handler, Spring returns its own error format —
breaking the contract's standard error shape for the frontend.
Fix: Add `@ExceptionHandler` for both in `GlobalExceptionHandler`.

---

### LOW — Known gaps to address before final delivery

**R11: `specialty` field type in specialists table**
Current `schema.sql` has `specialty VARCHAR(255)` (free text).
Adding `categories` table means specialist specialty should FK to a category.
Decision needed: store category name (denormalized, simpler) or category ID (normalized, safer).
Recommendation: store category name in `specialists.specialty`. If category is renamed, existing
profiles retain the original name — which is actually correct behavior.

**R12: Paginated response shape**
Spring Data's `Page<T>` serializes to a shape that partially matches the contract envelope but
includes extra Spring-internal fields. Write a `PageResponse<T>` wrapper DTO that maps
`Page<T>` to exactly `{content, page, size, totalElements, totalPages}`.

**R13: `upcoming` vs `appointments` overlap in dashboard**
`GET /api/dashboard/appointments` returns both an `upcoming` list (next 24h) and an `appointments`
list (filter/sort result). Contract is silent on whether items appear in both.
Decision needed: `upcoming` = subset of `appointments` shown separately, or a separate pre-filter?
Recommendation: compute them separately. `appointments` respects user's filters. `upcoming`
always shows confirmed appointments within 24h regardless of filters.

**R14: Role check granularity on booking status**
PATCH /api/bookings/{id}/status allows different actions for different roles.
If role checks are done in service (not URL security), the service must verify:
- CONFIRM/REJECT/COMPLETE → caller must be SPECIALIST who owns this booking's specialist
- CANCEL → caller must be CLIENT who owns this booking, OR the SPECIALIST
Getting the "ownership" check wrong is a security bug.

---

## Open Questions

| # | Question | Who decides | Status |
|---|---|---|---|
| Q1 | Store specialty as category name (denormalized) or category ID (FK)? | Tech lead | Open |
| Q2 | Where to store certificate files? Local disk? Cloud? | Team | Deferred to Sprint 2 |
| Q3 | Should `upcoming` items also appear in `appointments` list? | Frontend + backend agree | Open |
| Q4 | What is the "allowed advance booking window"? Contract mentions it but doesn't specify the duration. | Product/team | Open |
| Q5 | Should disabling a user (PATCH /api/admin/users/{id}/status) also cancel their active bookings? | Team | Open |

---

## Issues Encountered

_(Add entries here as issues are found during development)_

| Date | Issue | Resolution |
|---|---|---|
| — | — | — |
