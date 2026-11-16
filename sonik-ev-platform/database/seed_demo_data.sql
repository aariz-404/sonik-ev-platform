-- =============================================================================
-- Sonik EV Platform — Demo Data Seed Script (SQL)
-- =============================================================================
-- DEMO DATA ONLY - NOT FOR PRODUCTION USE
--
-- Run against an already-created schema:
--   mysql -u <user> -p sonik_ev_db < database/seed_demo_data.sql
--
-- Demo Accounts:
--   Admin:    admin@sonik.ev    / admin123
--   Operator: operator@sonik.ev / operator123
--   Driver:   driver@sonik.ev   / driver123
--   Support:  support@sonik.ev  / support123
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Users (Admin, Operator, Driver, Support)
-- Passwords hashed via Werkzeug generate_password_hash
-- ---------------------------------------------------------------------------
INSERT INTO users (user_id, name, email, password_hash, role, created_at, updated_at) VALUES
(1, 'Sonik Admin', 'admin@sonik.ev', 'scrypt:32768:8:1$RZC84O4h3PrmeRiW$db70a56a1933db54efcb8fd438847c418902c09ac0e3767dc5441767b5ee098dedabde4bca912304e321f91ddee145fd184c982f3d6cf22ea8f3aa435b5aee54', 'ADMIN', NOW(), NOW()),
(2, 'Rahul Verma', 'operator@sonik.ev', 'scrypt:32768:8:1$Ko2851G4OppiTwDi$a33d341ca16c5839a44373b7d50fc07c2ba62dc0100cc3eb660eca2472ac088edf5106fe0095d7fe2335d3301f92b0c71b57b9e685724636344356400cad48a3', 'OPERATOR', NOW(), NOW()),
(3, 'Priya Sharma', 'driver@sonik.ev', 'scrypt:32768:8:1$dNxK62IW8qIMZZBY$dfdd779e961df703ab9602bbbb9b899591c84b26e49debb6c4d4f749f25450d68dc60fe49e2e5f81f7cf406a99468be22f2b569a12a29844cdb6da053dc2752a', 'DRIVER', NOW(), NOW()),
(4, 'Amit Khanna', 'support@sonik.ev', 'scrypt:32768:8:1$Oqao3ZpQCz5RarY5$de75d7049d809f92e8e9b2d4d61abef707c82494be0dd3905fef490536148285f01e846c5de975fb9b0b2b8c698284dba508154778edf29416927aa6348a006a', 'SUPPORT', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ---------------------------------------------------------------------------
-- 2. Stations (5 realistic locations in Noida & Greater Noida)
-- ---------------------------------------------------------------------------
INSERT INTO stations (station_id, name, address, city, latitude, longitude, created_at, updated_at) VALUES
(1, 'Sector 18 EV Hub', 'Sector 18 Market, Atta, Noida', 'Noida', 28.57062000, 77.32722000, NOW(), NOW()),
(2, 'DLF Mall Charge Point', 'Alpha Commercial Belt, Alpha 1, Greater Noida', 'Greater Noida', 28.47458000, 77.50400000, NOW(), NOW()),
(3, 'Pari Chowk Supercharger', 'Pari Chowk, Knowledge Park 1, Greater Noida', 'Greater Noida', 28.46697000, 77.49420000, NOW(), NOW()),
(4, 'Noida City Centre Fast Charge', 'Sector 39, Noida City Centre', 'Noida', 28.57002000, 77.35812000, NOW(), NOW()),
(5, 'Jaypee Greens EV Station', 'Jaypee Greens, Sector 128, Noida-Greater Noida Expressway', 'Greater Noida', 28.49342000, 77.52721000, NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ---------------------------------------------------------------------------
-- 3. Chargers (10 chargers: mix of CCS2, Type 2, CHAdeMO; various statuses and powers)
-- ---------------------------------------------------------------------------
INSERT INTO chargers (charger_id, station_id, connector_type, power_kw, status, created_at, updated_at) VALUES
(1,  1, 'CCS2',    50.00,  'Available',   NOW(), NOW()),
(2,  1, 'Type2',   22.00,  'Charging',    NOW(), NOW()),
(3,  2, 'CCS2',    100.00, 'Available',   NOW(), NOW()),
(4,  2, 'CHAdeMO', 50.00,  'Offline',     NOW(), NOW()),
(5,  3, 'CCS2',    150.00, 'Available',   NOW(), NOW()),
(6,  3, 'Type2',   22.00,  'Maintenance', NOW(), NOW()),
(7,  4, 'CCS2',    60.00,  'Available',   NOW(), NOW()),
(8,  4, 'Type2',   11.00,  'Charging',    NOW(), NOW()),
(9,  5, 'CCS2',    120.00, 'Available',   NOW(), NOW()),
(10, 5, 'CHAdeMO', 50.00,  'Available',   NOW(), NOW())
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- ---------------------------------------------------------------------------
-- 4. Tariffs (One active tariff per station, rates in INR/kWh)
-- ---------------------------------------------------------------------------
INSERT INTO tariffs (tariff_id, station_id, rate_per_kwh, valid_from, valid_to, created_at) VALUES
(1, 1, 16.5000, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, NOW()),
(2, 2, 18.0000, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, NOW()),
(3, 3, 15.5000, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, NOW()),
(4, 4, 17.0000, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, NOW()),
(5, 5, 19.5000, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, NOW())
ON DUPLICATE KEY UPDATE rate_per_kwh=VALUES(rate_per_kwh);

-- ---------------------------------------------------------------------------
-- 5. Charging Sessions (8 sessions across multiple states)
-- ---------------------------------------------------------------------------
INSERT INTO charging_sessions (session_id, user_id, charger_id, start_time, end_time, energy_kwh, status, created_at, updated_at) VALUES
(1, 3, 1,  DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), 25.5000, 'Completed', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 3, 3,  DATE_SUB(NOW(), INTERVAL 26 HOUR), DATE_SUB(NOW(), INTERVAL 24 HOUR), 40.2000, 'Completed', DATE_SUB(NOW(), INTERVAL 26 HOUR), DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(3, 3, 5,  DATE_SUB(NOW(), INTERVAL 49 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR), 15.8000, 'Completed', DATE_SUB(NOW(), INTERVAL 49 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(4, 3, 7,  DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), 18.3000, 'Completed', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(5, 3, 2,  DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, 0.0000, 'Active', DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW()),
(6, 3, 8,  DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL, 0.0000, 'Active', DATE_SUB(NOW(), INTERVAL 45 MINUTE), NOW()),
(7, 3, 10, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), 0.0000, 'Cancelled', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(8, 3, 9,  NULL, NULL, 0.0000, 'Created', NOW(), NOW())
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- ---------------------------------------------------------------------------
-- 6. Payment Records (MOCK ONLY — for Completed sessions)
-- ---------------------------------------------------------------------------
INSERT INTO payment_records (payment_id, session_id, amount, payment_status, reference_code, created_at, updated_at) VALUES
(1, 1, 420.75, 'Completed', 'SONIK-DEMO-PAY001', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 2, 723.60, 'Completed', 'SONIK-DEMO-PAY002', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(3, 3, 244.90, 'Completed', 'SONIK-DEMO-PAY003', DATE_SUB(NOW(), INTERVAL 48 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(4, 4, 311.10, 'Completed', 'SONIK-DEMO-PAY004', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR))
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- ---------------------------------------------------------------------------
-- 7. Service Tickets (5 realistic issues)
-- ---------------------------------------------------------------------------
INSERT INTO service_tickets (ticket_id, user_id, charger_id, category, description, priority, status, created_at, updated_at) VALUES
(1, 3, 4, 'Hardware', 'Charger display screen is blank and unresponsive. Unable to read charging parameters or QR code.', 'High', 'Open', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(2, 3, 6, 'Connectivity', 'Charger showing offline status on app. OCPP heartbeat has not been received by central system for 48 hours.', 'Critical', 'InProgress', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(3, 3, 1, 'Billing', 'User was debited twice for a single charging session on Sector 18 EV Hub. Requesting refund for duplicate debit.', 'High', 'Open', DATE_SUB(NOW(), INTERVAL 12 HOUR), NOW()),
(4, 2, 3, 'Software', 'Firmware version mismatch on DLF Mall unit. App expects v2.1.0 but controller reports v1.9.5. Remote OTA update required.', 'Medium', 'Open', DATE_SUB(NOW(), INTERVAL 6 HOUR), NOW()),
(5, 3, 2, 'Safety', 'User observed unusual arcing/sparking sound when connector was inserted into charging port. Emergency stop engaged.', 'Critical', 'Open', DATE_SUB(NOW(), INTERVAL 3 HOUR), NOW())
ON DUPLICATE KEY UPDATE status=VALUES(status);
