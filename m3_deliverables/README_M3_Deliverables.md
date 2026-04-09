# M3 Deliverables - Slot and Booking Database Design

## 1. What is included

This folder contains a submission-ready draft for the M3 member of Part B - Database Design:

- `schema.sql`: merged SQL schema for M2 + M3 alignment
- `Slot.java`: JPA entity for consultation time slots
- `Booking.java`: JPA entity for bookings
- `SlotRepository.java`: Spring Data JPA repository
- `BookingRepository.java`: Spring Data JPA repository
- `SlotStatus.java`: enum for slot status
- `BookingStatus.java`: enum for booking status
- `M3SlotRuleService.java`: service-layer rule skeleton for M3 validation and operation constraints
- `M3_API_Contract.md`: API contract draft for M4/M5/M6 integration

## 2. Key design decisions

### 2.1 Why use `users` instead of `User`
`User` is a risky table name in SQL because it can clash with reserved words or built-in objects in some database engines. The plural name `users` is safer and more portable.

### 2.2 Why `bookings` stores both `customer_id` and `specialist_id`
Although the specialist can be found indirectly through the selected slots, storing `specialist_id` directly makes dashboard queries, lifecycle updates, admin monitoring, and filtering much simpler.

### 2.3 Why `bookings.total_fee` is stored
The specialist fee is defined on the specialist profile. When a booking is submitted, the system should calculate the final fee and save it in the booking record. This preserves historical correctness even if the specialist changes their price later.

### 2.4 Why add `booking_slots`
M4 allows customers to select **one or several consecutive slots**. That means one booking may contain multiple slots. Because of this, a junction table `booking_slots` is necessary.

### 2.5 Why `slots.status` only has `AVAILABLE` and `UNAVAILABLE`
M3 treats slot availability and booking lifecycle as separate concepts:
- slot availability belongs to Slot
- booking status belongs to Booking

This separation avoids mixing schedule inventory with booking workflow.

## 3. Mapping from PBI to database fields

### Slot
- `specialist_id`: slot belongs to a specialist
- `slot_date`, `start_time`, `end_time`: required by M3 slot creation PBI
- `status`: supports Available / Unavailable
- `created_at`, `updated_at`: useful for audit and ordering

### Booking
- `customer_id`: booking is submitted by customer
- `specialist_id`: booking targets a specific specialist
- `contact`: mandatory and editable in booking form
- `topic`: optional, max 100 chars
- `notes`: optional, max 500 chars
- `total_fee`: required by M4 fee display and persistence
- `status`: required by M4 + M6 lifecycle

## 4. Assumptions you should confirm with M2

1. `specialists.id` is the FK target used by `slots.specialist_id` and `bookings.specialist_id`
2. `users.id` is the FK target used by `bookings.customer_id`
3. service fee is stored in `specialists.price_amount`
4. only specialists with status `ACTIVE` can be booked
5. M2 will provide `User.java` and `Specialist.java` entities in the same project

## 5. Important implementation note

`Slot.java` and `Booking.java` reference `Specialist` and `User` entities that are owned by M2. If the package name in your real project is different, update the package/import statements accordingly.

## 6. P0 updates completed

1. **Repository naming aligned with JPA nested-property convention**
   - `findBySpecialistId...` -> `findBySpecialist_Id...`
   - `findByCustomerId...` -> `findByCustomer_Id...`
2. **M3 rule service skeleton added**
   - Past date / time order / min duration / advance window
   - Overlap conflict guard
   - Block delete/mark-unavailable for booked slots (`PENDING/CONFIRMED`)
3. **API contract draft added**
   - Create/list/delete/mark-unavailable endpoints
   - Integration-facing error codes for M4/M5/M6
