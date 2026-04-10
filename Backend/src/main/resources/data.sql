-- ============================================================
--  Seed data — Consultation Booking System (Sprint 1 demo)
--  All passwords are:  Password123
--  BCrypt hash:  $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
INSERT IGNORE INTO users (id, email, password_hash, name, role, status) VALUES
  (1,  'admin@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin',      'ADMIN',      'ACTIVE'),

  -- Specialists
  (2,  'dr.chen@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Wei Chen',      'SPECIALIST', 'ACTIVE'),
  (3,  'sarah.miller@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sarah Miller',      'SPECIALIST', 'ACTIVE'),
  (4,  'james.park@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'James Park',        'SPECIALIST', 'ACTIVE'),
  (5,  'dr.liu@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Fang Liu',      'SPECIALIST', 'ACTIVE'),
  (6,  'emily.hart@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Emily Hart',        'SPECIALIST', 'ACTIVE'),

  -- Customers
  (7,  'alice@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Alice Wang',        'CLIENT',     'ACTIVE'),
  (8,  'bob@example.com',        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Bob Zhang',         'CLIENT',     'ACTIVE'),
  (9,  'carol@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Carol Lee',         'CLIENT',     'ACTIVE'),
  (10, 'david@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'David Kim',         'CLIENT',     'ACTIVE');

-- ── Categories ───────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name) VALUES
  (1, 'General Consultation'),
  (2, 'Mental Health'),
  (3, 'Nutrition & Diet'),
  (4, 'Legal Advice'),
  (5, 'Career Coaching'),
  (6, 'Financial Planning');

-- ── Specialist profiles ──────────────────────────────────────
INSERT IGNORE INTO specialists (id, user_id, name, specialty, qualification_level, bio, price_amount, status) VALUES
  (1, 2, 'Dr. Wei Chen',   'General Consultation', 'Senior',
   'Board-certified physician with 12 years of clinical experience in internal medicine and preventive care. Fluent in English and Mandarin.',
   200.00, 'ACTIVE'),

  (2, 3, 'Sarah Miller',   'Mental Health',        'Expert',
   'Licensed clinical psychologist specialising in anxiety, depression, and stress management. CBT and mindfulness-based practitioner.',
   280.00, 'ACTIVE'),

  (3, 4, 'James Park',     'Career Coaching',      'Senior',
   'Certified executive coach with a background in HR leadership at Fortune 500 companies. Specialises in career transitions and leadership development.',
   350.00, 'ACTIVE'),

  (4, 5, 'Dr. Fang Liu',   'Nutrition & Diet',     'Intermediate',
   'Registered dietitian focused on evidence-based nutrition for weight management, sports performance, and chronic disease prevention.',
   150.00, 'ACTIVE'),

  (5, 6, 'Emily Hart',     'Legal Advice',         'Senior',
   'Practising solicitor with 8 years of experience in employment law and contract disputes. Provides initial consultation and document review.',
   400.00, 'ACTIVE');

-- ── Slots (always future dates, relative to today) ──────────
INSERT IGNORE INTO slots (id, specialist_id, slot_date, start_time, end_time, status) VALUES
  -- Dr. Wei Chen (specialist 1)
  (1,  1, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '09:00:00', '10:00:00', 'AVAILABLE'),
  (2,  1, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '11:00:00', '12:00:00', 'AVAILABLE'),
  (3,  1, DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '09:00:00', '10:00:00', 'AVAILABLE'),
  (4,  1, DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '14:00:00', '15:00:00', 'AVAILABLE'),
  (5,  1, DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '10:00:00', '11:00:00', 'AVAILABLE'),

  -- Sarah Miller (specialist 2)
  (6,  2, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '10:00:00', '11:00:00', 'AVAILABLE'),
  (7,  2, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '14:00:00', '15:00:00', 'AVAILABLE'),
  (8,  2, DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '10:00:00', '11:00:00', 'AVAILABLE'),
  (9,  2, DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '09:00:00', '10:00:00', 'AVAILABLE'),
  (10, 2, DATE_ADD(CURDATE(), INTERVAL 4 DAY),  '15:00:00', '16:00:00', 'UNAVAILABLE'),

  -- James Park (specialist 3)
  (11, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '13:00:00', '14:00:00', 'AVAILABLE'),
  (12, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '13:00:00', '14:00:00', 'AVAILABLE'),
  (13, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '11:00:00', '12:00:00', 'AVAILABLE'),

  -- Dr. Fang Liu (specialist 4)
  (14, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '08:00:00', '09:00:00', 'AVAILABLE'),
  (15, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '16:00:00', '17:00:00', 'AVAILABLE'),
  (16, 4, DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '08:00:00', '09:00:00', 'AVAILABLE'),
  (17, 4, DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '14:00:00', '15:00:00', 'AVAILABLE'),

  -- Emily Hart (specialist 5)
  (18, 5, DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '10:00:00', '11:00:00', 'AVAILABLE'),
  (19, 5, DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '15:00:00', '16:00:00', 'AVAILABLE'),
  (20, 5, DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '10:00:00', '11:00:00', 'AVAILABLE'),
  (21, 5, DATE_ADD(CURDATE(), INTERVAL 4 DAY),  '13:00:00', '14:00:00', 'AVAILABLE');
