# Sonik EV Platform — Backend API

An enterprise-grade, functional REST API backend for an EV Charging Network Management Platform inspired by the domain and workflows of **Sonik Mobility**.

This backend powers two frontend applications:
1. **ChargeOps** — Operator & Admin Dashboard for station health, live sessions, tariff management, service ticketing, and network analytics.
2. **ChargeConnect** — EV Driver Portal for discovering chargers, checking availability, initiating sessions, monitoring charging telemetry, and reporting issues.

---

## Tech Stack

- **Runtime:** Python 3.9+ (Tested on Python 3.14)
- **Framework:** Flask 3.0+
- **Database:** MySQL 8.0+
- **ORM:** SQLAlchemy 2.0+ / Flask-SQLAlchemy 3.1+
- **Driver:** PyMySQL 1.1+
- **Authentication:** Stateless JWT via PyJWT (Bearer token)
- **Password Security:** PBKDF2 / Scrypt hashing via Werkzeug Security
- **CORS Support:** Flask-CORS
- **Configuration:** Python-Dotenv with multi-environment configs (Development, Testing, Production)
- **Testing:** Python `unittest` test suite (34 automated tests, 100% passing)

---

## Architectural Design

The backend adheres strictly to a clean, decoupled, layered architectural pattern:

```
sonik-ev-platform/
├── app/
│   ├── __init__.py              # Application factory (create_app), extension wiring, route registration
│   ├── extensions.py            # Shared SQLAlchemy and CORS instances
│   ├── models/                  # SQLAlchemy ORM entity models with relationships and serialisation
│   │   ├── __init__.py
│   │   ├── user.py              # Users with password hashing & check methods
│   │   ├── station.py           # Charging stations with geo-coordinates
│   │   ├── charger.py           # Physical chargers, connector types, power ratings, and live statuses
│   │   ├── charging_session.py  # Session records with energy & timestamps
│   │   ├── tariff.py            # Station-specific time-valid pricing per kWh
│   │   ├── service_ticket.py    # Charger hardware, software, billing, safety issue tickets
│   │   └── payment_record.py    # Mock transaction and billing references for completed sessions
│   ├── routes/                  # REST API Blueprints returning standardized JSON
│   │   ├── __init__.py
│   │   ├── auth.py              # Login, /me profile, logout, token refresh
│   │   ├── stations.py          # Station discovery, search, city filter, station detail
│   │   ├── chargers.py          # Charger listing with filters (connector, status, min_power, station)
│   │   ├── sessions.py          # Session creation, listing, state machine transitions (PATCH)
│   │   ├── tickets.py           # Service ticket creation, tracking, status updates
│   │   └── analytics.py         # Operator analytics dashboard summary
│   ├── services/                # Business logic, state machine validation, tariff calculations
│   │   ├── __init__.py
│   │   ├── station_service.py
│   │   ├── charger_service.py
│   │   ├── session_service.py   # Strict state transitions and charger status synchronization
│   │   ├── ticket_service.py
│   │   └── analytics_service.py
│   ├── repositories/            # Parameterized database queries and transactions
│   │   ├── __init__.py
│   │   ├── station_repository.py
│   │   ├── charger_repository.py
│   │   ├── session_repository.py
│   │   ├── ticket_repository.py
│   │   └── analytics_repository.py  # Real database aggregations (never hardcoded)
│   ├── validators/              # Input sanitization and payload validation
│   │   ├── __init__.py
│   │   ├── station_validator.py
│   │   ├── session_validator.py
│   │   └── ticket_validator.py
│   └── middleware/              # Cross-cutting concerns
│       ├── __init__.py
│       ├── auth.py              # JWT token decoder, @token_required and @role_required RBAC decorators
│       ├── error_handlers.py    # Centralized JSON error responses (400, 401, 403, 404, 409, 422, 500)
│       └── response.py          # Standardized envelope response helpers
├── database/
│   ├── schema.sql               # Production-ready MySQL DDL with constraints and indexes
│   ├── seed_demo_data.sql       # Pure SQL demo seed data with realistic Noida/Greater Noida records
│   └── seed_demo_data.py        # Python CLI seeder tool with idempotent execution and --force flag
├── tests/                       # Unit and integration test suite
│   ├── __init__.py
│   ├── base.py                  # Base test case with test client and fixtures
│   ├── test_auth.py             # Auth flow tests
│   ├── test_stations_chargers.py# Station and charger filter tests
│   ├── test_sessions.py         # Session state machine and transition tests
│   ├── test_tickets.py          # Service ticket lifecycle tests
│   └── test_analytics.py        # Analytics DB aggregation and RBAC access control tests
├── .env.example                 # Template environment variables
├── app.py                       # Top-level entry point
├── config.py                    # Multi-environment configuration classes
├── requirements.txt             # Pinned production dependencies
└── README.md                    # Project documentation
```

---

## Database Schema & Relational Design

The database consists of 7 relational tables with foreign key constraints, indexes on high-traffic filter columns, and check constraints:

1. **`users`**
   - `user_id` (PK, INT AUTO_INCREMENT)
   - `name` (VARCHAR(100))
   - `email` (VARCHAR(150), UNIQUE, INDEX)
   - `password_hash` (VARCHAR(255))
   - `role` (ENUM: `ADMIN`, `OPERATOR`, `DRIVER`, `SUPPORT`)
   - `created_at`, `updated_at` (DATETIME)

2. **`stations`**
   - `station_id` (PK, INT AUTO_INCREMENT)
   - `name` (VARCHAR(150))
   - `address` (VARCHAR(300))
   - `city` (VARCHAR(100), INDEX)
   - `latitude` (DECIMAL(10,8)), `longitude` (DECIMAL(11,8))
   - `created_at`, `updated_at` (DATETIME)

3. **`chargers`**
   - `charger_id` (PK, INT AUTO_INCREMENT)
   - `station_id` (FK -> `stations.station_id`)
   - `connector_type` (ENUM: `CCS2`, `Type2`, `CHAdeMO`, `AC`, `DC`)
   - `power_kw` (DECIMAL(8,2), CHECK `power_kw > 0`)
   - `status` (ENUM: `Available`, `Charging`, `Offline`, `Maintenance`, INDEX)
   - `created_at`, `updated_at` (DATETIME)

4. **`charging_sessions`**
   - `session_id` (PK, INT AUTO_INCREMENT)
   - `user_id` (FK -> `users.user_id`)
   - `charger_id` (FK -> `chargers.charger_id`)
   - `start_time` (DATETIME, NULLABLE)
   - `end_time` (DATETIME, NULLABLE)
   - `energy_kwh` (DECIMAL(10,4), DEFAULT 0, CHECK `energy_kwh >= 0`)
   - `status` (ENUM: `Created`, `Active`, `Completed`, `Cancelled`, `Failed`, INDEX)
   - `created_at`, `updated_at` (DATETIME)

5. **`tariffs`**
   - `tariff_id` (PK, INT AUTO_INCREMENT)
   - `station_id` (FK -> `stations.station_id`)
   - `rate_per_kwh` (DECIMAL(8,4), CHECK `rate_per_kwh > 0`)
   - `valid_from` (DATETIME)
   - `valid_to` (DATETIME, NULLABLE)
   - `created_at` (DATETIME)

6. **`service_tickets`**
   - `ticket_id` (PK, INT AUTO_INCREMENT)
   - `user_id` (FK -> `users.user_id`)
   - `charger_id` (FK -> `chargers.charger_id`)
   - `category` (ENUM: `Hardware`, `Software`, `Billing`, `Connectivity`, `Safety`, `Other`)
   - `description` (TEXT)
   - `priority` (ENUM: `Low`, `Medium`, `High`, `Critical`)
   - `status` (ENUM: `Open`, `InProgress`, `Resolved`, `Closed`, INDEX)
   - `created_at`, `updated_at` (DATETIME)

7. **`payment_records`** *(Mock Gateway Integration)*
   - `payment_id` (PK, INT AUTO_INCREMENT)
   - `session_id` (FK -> `charging_sessions.session_id`, UNIQUE)
   - `amount` (DECIMAL(10,2))
   - `payment_status` (ENUM: `Pending`, `Completed`, `Failed`, `Refunded`)
   - `reference_code` (VARCHAR(100), UNIQUE)
   - `created_at`, `updated_at` (DATETIME)

---

## Session State Machine

The session service enforces an explicit finite state machine. Invalid transitions are rejected with HTTP `422 Unprocessable Entity`:

```
               [ Start Session ]
                       │
                       ▼
                 ┌───────────┐
                 │  Created  │
                 └─────┬─────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
   ┌───────────┐               ┌───────────┐
   │  Active   │               │ Cancelled │
   └─────┬─────┘               └───────────┘
         │
   ┌─────┴───────────────┬────────────────┐
   ▼                     ▼                ▼
┌───────────┐      ┌───────────┐    ┌───────────┐
│ Completed │      │ Cancelled │    │  Failed   │
└───────────┘      └───────────┘    └───────────┘
```

### Transition Invariants:
1. **Creation:** Starting a session requires a charger whose status is `Available`. If the charger is `Charging`, `Offline`, or under `Maintenance`, the API rejects the request with HTTP `409 Conflict`.
2. **Created → Active:**
   - Automatically sets `start_time = now()`.
   - Flips charger status to `Charging`.
3. **Active → Completed:**
   - Validates that `energy_kwh` is provided and strictly positive (`> 0`).
   - Automatically sets `end_time = now()`.
   - Resets charger status to `Available`.
   - Fetches the station's active tariff rate and automatically generates a completed `PaymentRecord` with a unique transaction reference (e.g. `SONIK-XXXXXX`).
4. **Created → Cancelled / Active → Cancelled / Active → Failed:**
   - Sets `end_time = now()`.
   - If charger was `Charging`, resets charger status back to `Available`.

---

## Installation & Setup

### 1. Prerequisites
- Python 3.9 or higher
- MySQL Server 8.0+ running on `localhost:3306`

### 2. Clone and Setup Environment
Navigate to the project root directory:
```bash
cd sonik-ev-platform
```

Create and activate a virtual environment:
```bash
# Windows
py -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `.env` matches your MySQL database credentials:
```env
FLASK_ENV=development
SECRET_KEY=sonik-super-secret-key-2026
JWT_SECRET_KEY=sonik-jwt-secret-token-key-2026
DB_HOST=localhost
DB_PORT=3306
DB_USER=sonik_user
DB_PASSWORD=sonik_password
DB_NAME=sonik_ev_db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. MySQL Database Setup
Open your MySQL terminal:
```sql
CREATE DATABASE sonik_ev_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sonik_user'@'localhost' IDENTIFIED BY 'sonik_password';
GRANT ALL PRIVILEGES ON sonik_ev_db.* TO 'sonik_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Schema Creation & Data Seeding

You can seed the database using either the automated Python seeder or raw SQL.

**Option A: Automated Python Seeder (Recommended)**
```bash
python database/seed_demo_data.py
```
*(To drop all existing tables and re-seed from scratch, add the `--force` flag: `python database/seed_demo_data.py --force`)*

**Option B: Raw SQL Execution**
```bash
mysql -u sonik_user -p sonik_ev_db < database/schema.sql
mysql -u sonik_user -p sonik_ev_db < database/seed_demo_data.sql
```

### 6. Start the Backend Server
```bash
python app.py
```
The API server will start on `http://localhost:5000`.

---

## Demo Credentials (DEMO DATA ONLY)

All seeded demo accounts are pre-configured with secure password hashes:

| Role | Email | Plaintext Password | Primary Access Scope |
|---|---|---|---|
| **ADMIN** | `admin@sonik.ev` | `admin123` | Full access: Network analytics, station management, all sessions |
| **OPERATOR** | `operator@sonik.ev` | `operator123` | ChargeOps Dashboard, hardware monitoring, ticket resolution |
| **DRIVER** | `driver@sonik.ev` | `driver123` | ChargeConnect Portal: station discovery, personal sessions & tickets |
| **SUPPORT** | `support@sonik.ev` | `support123` | Service ticket triage, analytics inspection |

---

## API Reference & Endpoints

All responses follow a uniform JSON envelope:
- **Success:** `{"success": true, "data": ..., "message": "..."}`
- **Paginated:** `{"success": true, "data": [...], "pagination": {"total": 10, "limit": 20, "offset": 0, "pages": 1}}`
- **Error:** `{"success": false, "error": "ErrorType", "message": "Description", "errors": [...]}`

### 1. Health Probe
- `GET /api/v1/health` — Public liveness check.

---

### 2. Authentication (`/api/v1/auth`)

#### `POST /api/v1/auth/login`
Authenticates a user and issues a signed JWT token.
- **Request:**
  ```json
  {
    "email": "driver@sonik.ev",
    "password": "driver123"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer",
      "expires_in": 3600,
      "user": {
        "user_id": 3,
        "name": "Priya Sharma",
        "email": "driver@sonik.ev",
        "role": "DRIVER"
      }
    }
  }
  ```

#### `GET /api/v1/auth/me`
Requires `Authorization: Bearer <token>`. Returns current user profile.

#### `POST /api/v1/auth/logout`
Requires `Authorization: Bearer <token>`. Acknowledges client-side token discard.

---

### 3. Stations (`/api/v1/stations`)

#### `GET /api/v1/stations`
Public station discovery endpoint with pagination and filtering.
- **Query Parameters:**
  - `city` (string, optional) — Filter by city (e.g. `Noida`, `Greater Noida`)
  - `search` (string, optional) — Case-insensitive search on station name or address
  - `limit` (int, default `20`)
  - `offset` (int, default `0`)

#### `GET /api/v1/stations/<id>`
Returns complete station details, total chargers, available chargers, and currently active tariff.

---

### 4. Chargers (`/api/v1/chargers`)

#### `GET /api/v1/chargers`
Public charger listing.
- **Query Parameters:**
  - `station_id` (int, optional)
  - `connector_type` (string: `CCS2`, `Type2`, `CHAdeMO`, `AC`, `DC`)
  - `status` (string: `Available`, `Charging`, `Offline`, `Maintenance`)
  - `min_power` (float, minimum kW output, e.g. `50`)
  - `limit`, `offset`
- **Output:** Returns each charger with its nested parent station object.

#### `GET /api/v1/chargers/<id>`
Returns single charger details with parent station information.

---

### 5. Charging Sessions (`/api/v1/sessions`)

All session endpoints require `Authorization: Bearer <token>`.

#### `POST /api/v1/sessions`
Initiates a new charging session on an available charger.
- **Request:**
  ```json
  {
    "charger_id": 1
  }
  ```
- **Response (201):** Returns created session with status `Created`.
- **Error (409):** If charger is not in `Available` status.

#### `GET /api/v1/sessions`
- **Role Isolation:** Drivers automatically receive only their own sessions. Operators and Admins can view all sessions.
- **Query Parameters:** `status`, `charger_id`, `limit`, `offset`.

#### `PATCH /api/v1/sessions/<id>`
Progresses the session through the state machine.
- **Transitions:**
  - `{"status": "Active"}` — Starts charging. Sets start timestamp and changes charger status to `Charging`.
  - `{"status": "Completed", "energy_kwh": 28.4}` — Finishes session. Requires positive `energy_kwh`. Sets end timestamp, changes charger status to `Available`, and generates a `PaymentRecord`.
  - `{"status": "Cancelled"}` — Cancels session and restores charger availability.
  - `{"status": "Failed"}` — Records abnormal termination.

---

### 6. Service Tickets (`/api/v1/tickets`)

All ticket endpoints require `Authorization: Bearer <token>`.

#### `POST /api/v1/tickets`
Submits a service or defect report.
- **Request:**
  ```json
  {
    "charger_id": 4,
    "category": "Hardware",
    "description": "Screen cracked and buttons not responding.",
    "priority": "High"
  }
  ```
- **Allowed Categories:** `Hardware`, `Software`, `Billing`, `Connectivity`, `Safety`, `Other`.
- **Allowed Priorities:** `Low`, `Medium`, `High`, `Critical`.

#### `GET /api/v1/tickets`
Filter tickets by `status` (`Open`, `InProgress`, `Resolved`, `Closed`) or `priority`.

#### `PATCH /api/v1/tickets/<id>`
Update status or priority. Operators can update any ticket; Drivers can only edit their own open tickets.

---

### 7. Dashboard Analytics (`/api/v1/analytics/summary`)

- **Access:** Restricted to `ADMIN`, `OPERATOR`, and `SUPPORT` roles. (Drivers receive `403 Forbidden`).
- **Response:** All metrics dynamically aggregated from live database records:
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "total_stations": 5,
        "total_chargers": 10,
        "available_chargers": 6,
        "charging_chargers": 2,
        "offline_chargers": 1,
        "maintenance_chargers": 1,
        "active_sessions": 2,
        "open_tickets": 4,
        "total_energy_today_kwh": 43.8,
        "total_energy_all_time_kwh": 99.8,
        "completed_sessions_today": 2
      },
      "recent_activity": [
        {
          "session_id": 1,
          "user_name": "Priya Sharma",
          "charger_connector": "CCS2",
          "charger_power_kw": 50.0,
          "station_name": "Sector 18 EV Hub",
          "station_city": "Noida",
          "energy_kwh": 25.5,
          "status": "Completed"
        }
      ]
    }
  }
  ```

---

## Testing with Postman & cURL

### 1. Authenticate as Operator
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "operator@sonik.ev", "password": "operator123"}'
```
Copy the returned `token` from the JSON response.

### 2. View Real-Time Analytics
```bash
curl -X GET http://localhost:5000/api/v1/analytics/summary \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 3. Authenticate as Driver & Start a Session
```bash
# 1. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "driver@sonik.ev", "password": "driver123"}'

# 2. Find Available Chargers in Greater Noida
curl -X GET "http://localhost:5000/api/v1/chargers?status=Available"

# 3. Create Session on Charger #1
curl -X POST http://localhost:5000/api/v1/sessions \
  -H "Authorization: Bearer <DRIVER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"charger_id": 1}'

# 4. Start Session (Active)
curl -X PATCH http://localhost:5000/api/v1/sessions/<SESSION_ID> \
  -H "Authorization: Bearer <DRIVER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "Active"}'

# 5. Complete Session with Energy Delivered
curl -X PATCH http://localhost:5000/api/v1/sessions/<SESSION_ID> \
  -H "Authorization: Bearer <DRIVER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed", "energy_kwh": 18.5}'
```

---

## Running the Automated Test Suite

The project includes 34 automated unit and integration tests verifying all routes, database repositories, state machine invariants, input validations, and RBAC authorization boundaries:

```bash
# Run all tests
python -m unittest discover -s tests -v
```

Expected output:
```
Ran 34 tests in ~2.5s
OK
```
