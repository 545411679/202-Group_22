-- Specialist Consultation Booking System
-- Database schema merged for M2 + M3 alignment
-- Notes:
-- 1) Use plural table names to avoid reserved-word issues such as USER.
-- 2) Fee is stored on specialists.price_amount and copied to bookings.total_fee at submission time.
-- 3) Consecutive multi-slot booking is supported through booking_slots.

DROP TABLE IF EXISTS booking_slots;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS slots;
DROP TABLE IF EXISTS specialists;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CLIENT', 'SPECIALIST', 'ADMIN') NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE specialists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    specialty VARCHAR(255) NOT NULL,
    qualification_level VARCHAR(100) NOT NULL,
    bio TEXT NOT NULL,
    price_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'PAUSED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_specialists_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_specialists_price_nonnegative
        CHECK (price_amount >= 0)
);

CREATE TABLE slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    specialist_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('AVAILABLE', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_slots_specialist
        FOREIGN KEY (specialist_id) REFERENCES specialists(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_slots_exact UNIQUE (specialist_id, slot_date, start_time, end_time),
    CONSTRAINT chk_slots_time_order CHECK (end_time > start_time)
);

CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    specialist_id BIGINT NOT NULL,
    contact VARCHAR(100) NOT NULL,
    topic VARCHAR(100),
    notes VARCHAR(500),
    total_fee DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_customer
        FOREIGN KEY (customer_id) REFERENCES users(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_specialist
        FOREIGN KEY (specialist_id) REFERENCES specialists(id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_bookings_total_fee_nonnegative
        CHECK (total_fee >= 0)
);

CREATE TABLE booking_slots (
    booking_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    PRIMARY KEY (booking_id, slot_id),
    CONSTRAINT uq_booking_slots_slot UNIQUE (slot_id),
    CONSTRAINT fk_booking_slots_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_booking_slots_slot
        FOREIGN KEY (slot_id) REFERENCES slots(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_slots_specialist_date ON slots(specialist_id, slot_date);
CREATE INDEX idx_slots_status ON slots(status);
CREATE INDEX idx_bookings_customer_status ON bookings(customer_id, status);
CREATE INDEX idx_bookings_specialist_status ON bookings(specialist_id, status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
