-- =============================================================================
-- Sonik EV Platform — MySQL DDL Schema
-- =============================================================================
-- Run against an already-created database:
--   mysql -u <user> -p <database_name> < database/schema.sql
--
-- NOTE: No CREATE DATABASE statement is included; create the target database
--       manually or via your deployment pipeline before running this file.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Drop tables in reverse dependency order (child → parent)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS payment_records;
DROP TABLE IF EXISTS service_tickets;
DROP TABLE IF EXISTS charging_sessions;
DROP TABLE IF EXISTS tariffs;
DROP TABLE IF EXISTS chargers;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  user_id       INT           NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('ADMIN','OPERATOR','DRIVER','SUPPORT') NOT NULL DEFAULT 'DRIVER',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),
  KEY        idx_users_role  (role)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- stations
-- ---------------------------------------------------------------------------
CREATE TABLE stations (
  station_id  INT            NOT NULL AUTO_INCREMENT,
  name        VARCHAR(150)   NOT NULL,
  address     VARCHAR(300)   NOT NULL,
  city        VARCHAR(100)   NOT NULL,
  latitude    DECIMAL(10,8)  NOT NULL,
  longitude   DECIMAL(11,8)  NOT NULL,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (station_id),
  KEY idx_stations_city (city)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- chargers
-- ---------------------------------------------------------------------------
CREATE TABLE chargers (
  charger_id     INT          NOT NULL AUTO_INCREMENT,
  station_id     INT          NOT NULL,
  connector_type ENUM('CCS2','Type2','CHAdeMO','AC','DC') NOT NULL,
  power_kw       DECIMAL(8,2) NOT NULL,
  status         ENUM('Available','Charging','Offline','Maintenance') NOT NULL DEFAULT 'Available',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (charger_id),
  CONSTRAINT fk_chargers_station
    FOREIGN KEY (station_id) REFERENCES stations (station_id) ON DELETE RESTRICT,
  KEY idx_chargers_status  (status),
  KEY idx_chargers_station (station_id),
  CONSTRAINT chk_chargers_power CHECK (power_kw > 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- charging_sessions
-- ---------------------------------------------------------------------------
CREATE TABLE charging_sessions (
  session_id  INT            NOT NULL AUTO_INCREMENT,
  user_id     INT            NOT NULL,
  charger_id  INT            NOT NULL,
  start_time  DATETIME       DEFAULT NULL,
  end_time    DATETIME       DEFAULT NULL,
  energy_kwh  DECIMAL(10,4)  NOT NULL DEFAULT 0.0000,
  status      ENUM('Created','Active','Completed','Cancelled','Failed') NOT NULL DEFAULT 'Created',
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (session_id),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id)    REFERENCES users    (user_id)    ON DELETE RESTRICT,
  CONSTRAINT fk_sessions_charger
    FOREIGN KEY (charger_id) REFERENCES chargers (charger_id) ON DELETE RESTRICT,
  KEY idx_sessions_user    (user_id),
  KEY idx_sessions_charger (charger_id),
  KEY idx_sessions_status  (status),
  CONSTRAINT chk_sessions_energy CHECK (energy_kwh >= 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- tariffs
-- ---------------------------------------------------------------------------
CREATE TABLE tariffs (
  tariff_id    INT          NOT NULL AUTO_INCREMENT,
  station_id   INT          NOT NULL,
  rate_per_kwh DECIMAL(8,4) NOT NULL,
  valid_from   DATETIME     NOT NULL,
  valid_to     DATETIME     DEFAULT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (tariff_id),
  CONSTRAINT fk_tariffs_station
    FOREIGN KEY (station_id) REFERENCES stations (station_id) ON DELETE RESTRICT,
  KEY idx_tariffs_station (station_id),
  CONSTRAINT chk_tariffs_rate CHECK (rate_per_kwh > 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- service_tickets
-- ---------------------------------------------------------------------------
CREATE TABLE service_tickets (
  ticket_id   INT     NOT NULL AUTO_INCREMENT,
  user_id     INT     NOT NULL,
  charger_id  INT     NOT NULL,
  category    ENUM('Hardware','Software','Billing','Connectivity','Safety','Other') NOT NULL,
  description TEXT    NOT NULL,
  priority    ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
  status      ENUM('Open','InProgress','Resolved','Closed')  NOT NULL DEFAULT 'Open',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (ticket_id),
  CONSTRAINT fk_tickets_user
    FOREIGN KEY (user_id)    REFERENCES users    (user_id)    ON DELETE RESTRICT,
  CONSTRAINT fk_tickets_charger
    FOREIGN KEY (charger_id) REFERENCES chargers (charger_id) ON DELETE RESTRICT,
  KEY idx_tickets_user   (user_id),
  KEY idx_tickets_status (status)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- payment_records  (MOCK ONLY — no real payment gateway)
-- ---------------------------------------------------------------------------
CREATE TABLE payment_records (
  payment_id     INT            NOT NULL AUTO_INCREMENT,
  session_id     INT            NOT NULL,
  amount         DECIMAL(10,2)  NOT NULL,
  payment_status ENUM('Pending','Completed','Failed','Refunded') NOT NULL DEFAULT 'Pending',
  reference_code VARCHAR(100)   NOT NULL,
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (payment_id),
  UNIQUE KEY uq_payment_session   (session_id),
  UNIQUE KEY uq_payment_reference (reference_code),
  CONSTRAINT fk_payments_session
    FOREIGN KEY (session_id) REFERENCES charging_sessions (session_id) ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
