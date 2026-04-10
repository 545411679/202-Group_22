# Backend Rewrite Plan
**Reference:** `api_contract/new_api-contract.md`, `sprint0/schema.sql`
**Stack:** Spring Boot 3.4.5, Java 17, MySQL, JWT (jjwt 0.12.6)
**Package root:** `com.grooming.pet`

---

## Approach logic

Code is written in **dependency order**, not alphabetical or by module.
Everything upstream depends on the foundation being stable — so the foundation
is built once, fully, before anyone else writes a line.

Within the team, work parallelises **after** the foundation and auth slice are
verified working end-to-end. If the stack is broken and 8 people are building on
top of it simultaneously, every hour spent is wasted.

Two documents drive all decisions:
- **`schema.sql`** → entities (what is stored)
- **`new_api-contract.md`** → DTOs (what is exchanged)
- **Services** → encode only the business rules explicitly stated in the contract
- **Controllers** → thin: validate request, call one service method, return response

---

## Step 0 — Schema decisions (before any Java is written)

These questions must be answered before entities are written.
Wrong entities require schema migration — painful to fix later.

**Decision 1 — How is `specialty` stored on specialists?**
The contract defines admin-managed categories and a `GET /api/categories` endpoint.
Option A: store category name (string) in `specialists.specialty` — denormalized, simpler.
Option B: add `category_id` FK column to specialists → `specialists.category_id BIGINT FK→categories`.
**Recommended: Option A.** Simpler. If a category is renamed later, existing specialist
profiles retain the name they were approved under — which is correct behaviour.
With Option A: `GET /api/categories` returns the list of names. Specialist picks one.
No FK means the DB won't enforce referential integrity, but validation can do it in the service.

**Schema extensions required** (add to schema.sql before implementation):

```sql
-- 1. Add status to users
ALTER TABLE users
    ADD COLUMN status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE';

-- 2. Categories table
CREATE TABLE categories (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 3. Announcements table
CREATE TABLE announcements (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    body       TEXT         NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Activity logs table
CREATE TABLE activity_logs (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id      BIGINT,
    actor_role    VARCHAR(50),
    action        VARCHAR(255) NOT NULL,
    target_entity VARCHAR(100),
    target_id     BIGINT,
    timestamp     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## Package structure

```
com.grooming.pet
│
├── config/
│   ├── SecurityConfig.java          CORS + JWT filter chain + role URL rules
│   ├── JwtUtil.java                 generate / validate JWT tokens
│   ├── JwtFilter.java               intercept every request, extract + validate token
│   └── UserDetailsServiceImpl.java  load user by email for Spring Security
│
├── exception/
│   ├── GlobalExceptionHandler.java  @RestControllerAdvice — catches all exceptions
│   ├── BadRequestException.java     → 400
│   ├── UnauthorizedException.java   → 401
│   ├── ForbiddenException.java      → 403
│   ├── ResourceNotFoundException.java → 404
│   └── ConflictException.java       → 409
│
├── model/                           one class per DB table
│   ├── User.java
│   ├── Specialist.java
│   ├── Category.java
│   ├── Slot.java
│   ├── Booking.java
│   ├── BookingSlot.java             composite PK — see Phase 1 notes
│   ├── Announcement.java
│   └── ActivityLog.java
│
├── repository/                      one interface per entity
│   ├── UserRepository.java
│   ├── SpecialistRepository.java
│   ├── CategoryRepository.java
│   ├── SlotRepository.java
│   ├── BookingRepository.java
│   ├── BookingSlotRepository.java
│   ├── AnnouncementRepository.java
│   └── ActivityLogRepository.java
│
├── dto/
│   ├── request/                     inbound — shaped from contract request bodies
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── PasswordChangeRequest.java
│   │   ├── SpecialistProfileRequest.java
│   │   ├── SpecialistStatusRequest.java
│   │   ├── SlotCreateRequest.java
│   │   ├── BookingCreateRequest.java
│   │   ├── BookingStatusRequest.java
│   │   ├── ReviewRequest.java
│   │   ├── UserStatusRequest.java
│   │   ├── AnnouncementRequest.java
│   │   └── CategoryRequest.java
│   └── response/                    outbound — shaped from contract success responses
│       ├── LoginResponse.java
│       ├── MeResponse.java
│       ├── SpecialistProfileResponse.java
│       ├── SpecialistSummaryResponse.java
│       ├── PendingSpecialistResponse.java
│       ├── SlotResponse.java
│       ├── ScheduleResponse.java
│       ├── BookingCreateResponse.java
│       ├── BookingStatusResponse.java
│       ├── SpecialistBookingResponse.java
│       ├── AppointmentSummaryResponse.java
│       ├── AppointmentDetailResponse.java
│       ├── DashboardResponse.java
│       ├── AdminBookingResponse.java
│       ├── AdminUserResponse.java
│       ├── AdminUserDetailResponse.java
│       ├── CategoryResponse.java
│       ├── AnnouncementResponse.java
│       ├── ActivityLogResponse.java
│       ├── ErrorResponse.java
│       └── PageResponse.java        generic paginated wrapper — see Phase 1 notes
│
├── service/
│   ├── AuthService.java
│   ├── SpecialistService.java
│   ├── SlotService.java
│   ├── BookingService.java
│   ├── DashboardService.java
│   ├── CategoryService.java
│   ├── AnnouncementService.java
│   ├── AdminService.java
│   └── ActivityLogService.java
│
├── controller/
│   ├── AuthController.java          /api/auth/**
│   ├── SpecialistController.java    /api/specialists/** (profile, slots, search, schedule, bookings)
│   ├── BookingController.java       /api/bookings/**
│   ├── DashboardController.java     /api/dashboard/**
│   └── AdminController.java         /api/admin/**
│
└── PetApplication.java
```

**Why one controller covers multiple URL prefixes:**
`SpecialistController` handles `/api/specialists/profile`, `/api/specialists/slots`,
`/api/specialists/search`, `/api/specialists/{id}/schedule`, `/api/specialists/bookings`.
These all operate on the specialist resource. Split by **resource ownership**, not URL segment.

---

## Global coding rules (all team members must follow)

1. **`@Transactional` on service methods only.** Never on controllers. Never on repositories
   (Spring Data handles that internally). If a service method writes to more than one table,
   `@Transactional` ensures both writes succeed or both roll back.

2. **Role checks in service layer.** Every service method that is role-restricted begins with
   a check against the authenticated user's role. Throw `ForbiddenException` if the role is wrong.
   Get the current user from Spring Security context:
   ```java
   // utility method — add to AuthService or a SecurityUtils helper
   User getCurrentUser() {
       String email = SecurityContextHolder.getContext()
           .getAuthentication().getName();
       return userRepository.findByEmail(email)
           .orElseThrow(() -> new UnauthorizedException("Not authenticated."));
   }
   ```

3. **Controllers are thin.** A controller method does three things only:
   - Accept the request (parse body / path params)
   - Call one service method
   - Return `ResponseEntity` with the correct status code
   No business logic, no DB calls, no if-else on data.

4. **Never return plain exceptions to the client.** All errors go through
   `GlobalExceptionHandler`. Never let a stack trace reach the HTTP response.

5. **Never store or log plain passwords.** BCrypt before saving. Never log password fields.

---

## Phase 1 — Foundation
**Owner: one person (most experienced). Duration: ~2 days. Blocks everyone else.**

### 1a. Entities

One class per DB table. Rules:
- Field names: camelCase. Column names: snake_case via `@Column(name="...")`.
- `@Enumerated(EnumType.STRING)` on all enum fields.
- `@CreationTimestamp` / `@UpdateTimestamp` (Hibernate annotations) for timestamp fields.
- No business logic in entities.

**Critical details per entity:**

`User`
```
fields: id, email, passwordHash (@Column(name="password_hash")), name,
        role (enum: CLIENT SPECIALIST ADMIN),
        status (enum: ACTIVE DISABLED),
        createdAt
```

`Specialist`
```
fields: id, user (@OneToOne, @JoinColumn(name="user_id")),
        specialty (String — category name, plain text),
        qualificationLevel (@Column(name="qualification_level")),
        bio, priceAmount (@Column(name="price_amount")),
        status (enum: PENDING ACTIVE PAUSED REJECTED),
        createdAt
```

`Category`
```
fields: id, name
```

`Slot`
```
fields: id, specialist (@ManyToOne), slotDate (LocalDate), startTime (LocalTime),
        endTime (LocalTime), status (enum: AVAILABLE UNAVAILABLE),
        createdAt, updatedAt
```

`Booking`
```
fields: id, customer (@ManyToOne User, @JoinColumn(name="customer_id")),
        specialist (@ManyToOne),
        contact, topic, notes, totalFee (BigDecimal),
        status (enum: PENDING CONFIRMED REJECTED CANCELLED COMPLETED),
        createdAt, updatedAt
```

`BookingSlot` — composite PK, handle carefully:
```java
// Separate ID class required
@Embeddable
public class BookingSlotId implements Serializable {
    private Long bookingId;
    private Long slotId;
    // equals() and hashCode() are REQUIRED
}

@Entity
@Table(name = "booking_slots")
public class BookingSlot {
    @EmbeddedId
    private BookingSlotId id;

    @ManyToOne
    @MapsId("bookingId")
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne
    @MapsId("slotId")
    @JoinColumn(name = "slot_id")
    private Slot slot;
}
```

`Announcement`
```
fields: id, title, body, createdAt, updatedAt
```

`ActivityLog`
```
fields: id, actorId (Long, nullable), actorRole (String), action (String),
        targetEntity (String), targetId (Long, nullable), timestamp
```

### 1b. Repositories

Start with empty interfaces — add query methods only as services require them.

Methods you know will be needed:
```java
// UserRepository
Optional<User> findByEmail(String email);
boolean existsByEmail(String email);

// SpecialistRepository
Optional<Specialist> findByUser(User user);
List<Specialist> findByStatus(Specialist.Status status);
// search: name LIKE, specialty LIKE — add @Query when implementing M5

// SlotRepository
List<Slot> findBySpecialist(Specialist specialist);
// overlap check — add @Query when implementing M3

// BookingRepository
List<Booking> findByCustomer(User customer);
List<Booking> findBySpecialist(Specialist specialist);

// BookingSlotRepository
List<BookingSlot> findBySlot(Slot slot);
boolean existsBySlotAndBooking_StatusIn(Slot slot, List<Booking.Status> statuses);
```

### 1c. JWT + Security

**`JwtUtil`**
- Secret and expiry from `application.properties` (`jwt.secret`, `jwt.expiration-ms`)
- `generateToken(String email, String role)` → signs with HMAC-SHA256
- `extractEmail(String token)`, `extractRole(String token)`
- `isTokenValid(String token)` → catches `JwtException`, returns boolean
- Secret must be at least 32 characters (256 bits) — enforced by jjwt

**`UserDetailsServiceImpl implements UserDetailsService`**
```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPasswordHash())
            .roles(user.getRole().name())
            .build();
    }
}
```

**`JwtFilter extends OncePerRequestFilter`**
- Extract `Authorization: Bearer <token>` header
- If no header: do nothing, let Spring Security handle as unauthenticated
- If header present: validate token, load user, set `SecurityContextHolder`

**`SecurityConfig`**

Two critical additions beyond the basic filter chain:

```java
// CORS — must be here or frontend calls fail silently
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

Permit list:
- `POST /api/auth/register` → permitAll
- `POST /api/auth/login` → permitAll
- Everything else → authenticated (role checks done in service layer)

### 1d. Exception handling

`GlobalExceptionHandler` must catch:
- All custom exceptions (`BadRequestException` → 400, etc.)
- `MethodArgumentNotValidException` → 400 (from `@Valid` on request DTOs)
- `HttpMessageNotReadableException` → 400 (malformed JSON body)
- `AccessDeniedException` → 403
- `Exception` (catch-all) → 500

All responses use the contract's standard shape:
```json
{ "status": 400, "error": "Bad Request", "message": "..." }
```

### 1e. PageResponse wrapper

```java
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public static <T> PageResponse<T> of(Page<T> page) {
        PageResponse<T> r = new PageResponse<>();
        r.content = page.getContent();
        r.page = page.getNumber();
        r.size = page.getSize();
        r.totalElements = page.getTotalElements();
        r.totalPages = page.getTotalPages();
        return r;
    }
}
```

### 1f. application.properties

```properties
spring.application.name=consult-booking-system

spring.datasource.url=jdbc:mysql://localhost:3306/consult_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true

spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true

spring.jackson.serialization.write-dates-as-timestamps=false

jwt.secret=group22-booking-system-secret-key-must-be-32chars
jwt.expiration-ms=3600000

server.port=8080
```

---

## Phase 2 — Auth slice (M1) — gate checkpoint

**Do not start Phase 3 until this passes manual testing in Postman.**

Implement in this order:
1. DTOs: `RegisterRequest`, `LoginRequest`, `PasswordChangeRequest`, `LoginResponse`, `MeResponse`
2. `AuthService`: `register()`, `login()`, `me()`, `changePassword()`
3. `AuthController`: all 5 endpoints

**`AuthService.login()` must do all of:**
1. Find user by email — 401 if not found
2. `passwordEncoder.matches(input, user.getPasswordHash())` — 401 if wrong
3. If SPECIALIST: query `specialistRepository.findByUser(user)` to get `specialistId` (null if no profile yet)
4. Generate JWT via `jwtUtil.generateToken(email, role)`
5. Return `LoginResponse` with token, role, userId, specialistId

**Manual test sequence (Postman):**
```
1. POST /api/auth/register   → expect 201
2. POST /api/auth/login      → expect 200 + token
3. GET  /api/auth/me         → use token in header → expect 200 + user info
4. GET  /api/auth/me         → no token → expect 401
5. GET  /api/auth/me         → wrong token → expect 401
```
All 5 must pass before Phase 3 starts.

---

## Phase 3 — Module implementation (parallel after Phase 2)

Each person writes their module's DTOs + Service + Controller together — one vertical slice at a time.
Do not write all DTOs for a module first, then all service methods. Write one endpoint fully, test it, then next.

### Module ownership

| Module | Owner writes | Key endpoints |
|---|---|---|
| M2 | `SpecialistProfileRequest/Response`, `SpecialistService` (profile methods), `SpecialistController` (profile endpoints) | POST/PATCH /api/specialists/profile, PATCH /profile/status, GET /profile/{id}, admin pending + review |
| M3 | `SlotCreateRequest`, `SlotResponse`, `SlotService`, `SlotController` methods | POST/GET/PATCH/DELETE /api/specialists/slots |
| M4 | `BookingCreateRequest/Response`, `ScheduleResponse`, `BookingService.createBooking()` | GET /api/specialists/{id}/schedule, POST /api/bookings |
| M5 | `SpecialistSummaryResponse`, `CategoryResponse`, search query in `SpecialistRepository` | GET /api/specialists/search, GET /api/categories |
| M6 | `BookingStatusRequest/Response`, `SpecialistBookingResponse`, `BookingService` status transitions | PATCH /api/bookings/{id}/status, GET /api/specialists/bookings |
| M7 | `DashboardResponse`, `AppointmentDetailResponse`, `DashboardService` | GET /api/dashboard/appointments, GET /api/dashboard/appointments/{id} |
| M8 | All Admin DTOs, `AdminService`, `AnnouncementService`, `CategoryService`, `AdminController` | All /api/admin/** |

### Business rules each module must encode exactly

**M2 — Specialist profile**
- Profile created with `status = PENDING` — never directly ACTIVE
- On PATCH (update): reset status to `PENDING`, keep old data visible until approved
- `PATCH /profile/status` only accepts `ACTIVE` or `PAUSED` — reject anything else with 400
- Ownership check: a specialist can only edit their own profile (derive from JWT)

**M3 — Slots**
- Validate: date must be in future, endTime > startTime, duration ≥ 30 min
- Overlap check: query existing slots for same specialist on same date where times overlap
- Mark unavailable / delete: blocked if slot has booking with status `PENDING` or `CONFIRMED`
- Ownership check: specialist can only manage their own slots

**M4 — Booking creation**
- Fee is **never sent by the client** — server copies `specialist.priceAmount` → `booking.totalFee`
- Each slot ID in `slotIds` creates one `BookingSlot` row
- Wrap entire method in `@Transactional`
- Catch `DataIntegrityViolationException` (unique constraint on slot_id) and throw `ConflictException` → 409

**M6 — Booking status transitions**
State machine — only these transitions are valid:

| From | Action | To | Who |
|---|---|---|---|
| PENDING | CONFIRM | CONFIRMED | SPECIALIST (who owns this booking's specialist) |
| PENDING | REJECT | REJECTED | SPECIALIST (who owns this booking's specialist) |
| PENDING or CONFIRMED | CANCEL | CANCELLED | CLIENT (who made the booking) OR SPECIALIST |
| CONFIRMED | COMPLETE | COMPLETED | SPECIALIST (who owns this booking's specialist) |

Any other combination → 400.
When CANCELLED or REJECTED: set all linked slots back to `AVAILABLE`.

**M7 — Dashboard `upcoming` definition**
`upcoming`: bookings with status `CONFIRMED` where the slot's date+startTime is within the next 24 hours.
This list is always computed regardless of the user's filters.
`appointments`: the full filtered/sorted list, respects query params.
Items can appear in both.

**M8 — Admin**
- Delete category: check `specialistRepository.existsBySpecialty(name)` — 400 if any specialist uses it
- Disable user: set `user.status = DISABLED`. Does not cancel active bookings (separate business decision — see DEVLOG Q5)
- All admin endpoints: check caller role = ADMIN at start of service method, throw `ForbiddenException` if not

---

## Phase 4 — Activity logging

Add after all services work. `ActivityLogService` is called by other services, not controllers.

```java
// Simple write — no transaction dependency
@Async  // optional: don't block the main operation
public void log(Long actorId, String actorRole, String action,
                String targetEntity, Long targetId) {
    ActivityLog entry = new ActivityLog();
    // set fields and save
    activityLogRepository.save(entry);
}
```

Call from:
- `BookingService` on every status change
- `SpecialistService` on profile approve/reject
- `AdminService` on user enable/disable
- `AnnouncementService` on create/update/delete

---

## Phase 5 — Seed data (data.sql)

Write after the app starts cleanly with empty tables.

BCrypt hash for `Password123`:
`$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

Minimum:
- 1 ADMIN user
- 1 CLIENT user
- 1 SPECIALIST user + specialist profile (status ACTIVE, linked to a category)
- 1 Category ("General Consultation")
- 2 future slots for the specialist

Use `INSERT IGNORE` on every statement so restarting does not fail on duplicate keys.

---

## Critical path

```
Step 0: Schema decisions resolved (Q1 answered, extensions written)
    ↓
Phase 1: Foundation — one person, ~2 days
    (Entities + Repos + JWT + CORS + Security + Exceptions + PageResponse + properties)
    ↓
Phase 2: Auth slice — VERIFIED in Postman before continuing
    ↓
Phase 3: M2, M3, M4, M5, M6, M7, M8 — parallel, one owner each
    ↓
Phase 4: Activity logging wired in
    ↓
Phase 5: Seed data
```

If Phase 2 is not working, **stop**. Diagnose before starting Phase 3.
Every hour spent building on a broken foundation is multiplied across all team members.
