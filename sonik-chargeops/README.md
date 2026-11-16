# ChargeOps — Sonik EV Platform Operator Dashboard

A functional, operator-facing EV Charging Network Operations Dashboard inspired by the domain, workflows, and infrastructure management requirements of **Sonik Mobility**.

ChargeOps provides charging point operators (CPOs) and fleet administrators with real-time operational visibility over charging hubs, connector telemetry, charging session lifecycles, and field service triage across the Noida and Greater Noida regional clusters.

---

## Brand & Design System

ChargeOps is styled with a modern, high-contrast EV infrastructure visual language:
- **Primary Navy:** `#10233F` (Deep structural chrome, sidebar, and headers)
- **Electric Blue:** `#1463FF` (Action accents, active states, and telemetry charts)
- **Surfaces:** `#F8FAFC` (Clean light slate canvas)
- **Card Elements:** `#FFFFFF` with subtle 1px border (`#E2E8F0`) and soft elevation shadows
- **Status Badges:** Consistent color-coded indicators for hardware statuses (`Available`, `Charging`, `Offline`, `Maintenance`) and session transitions (`Created`, `Active`, `Completed`, `Cancelled`, `Failed`).

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18 & TypeScript
- **Styling:** Tailwind CSS with custom Sonik brand color tokens
- **Icons:** Lucide React
- **Telemetry Charts:** Recharts (Interactive responsive area chart)
- **API Communication:** Type-safe Fetch REST client with Bearer JWT interceptors and auto-logout
- **Backend:** Flask REST API with MySQL (`http://localhost:5000/api/v1`)

---

## Project Structure

```
sonik-chargeops/
├── app/
│   ├── layout.tsx               # Root HTML layout and global font setup
│   ├── globals.css              # Tailwind directives and custom scrollbars
│   ├── page.tsx                 # Root redirector (/ -> /operator or /login)
│   ├── login/
│   │   └── page.tsx             # Operator login with demo account auto-fill
│   └── operator/
│       ├── layout.tsx           # Protected operator shell, sidebar & toast context
│       ├── page.tsx             # 1. Network Overview & telemetry analytics
│       ├── stations/
│       │   └── page.tsx         # 2. Station Management & charger inventory modal
│       ├── chargers/
│       │   └── page.tsx         # 3. Charger Management & connector filters
│       ├── sessions/
│       │   └── page.tsx         # 4. Charging Session Management & state machine transitions
│       └── tickets/
│           └── page.tsx         # 5. Service Ticket Management & triage modal
├── components/
│   ├── Sidebar.tsx              # Responsive sidebar navigation with Sonik branding
│   ├── Topbar.tsx               # Header with API status, operator profile & sign out
│   ├── DemoBanner.tsx           # Educational prototype disclaimer banner
│   ├── dashboard/
│   │   ├── DashboardMetricCard.tsx # Telemetry metric cards
│   │   ├── EnergyChart.tsx      # Real-time 24h energy trend area chart
│   │   └── index.ts
│   ├── tables/
│   │   ├── DataTable.tsx        # Reusable table with loading skeletons & pagination
│   │   └── index.ts
│   └── ui/
│       ├── Badges.tsx           # Status & priority badges with animated live pulse
│       ├── SearchInput.tsx      # Debounced search bar with clear button
│       ├── FilterDropdown.tsx   # Dropdown menu with active counts
│       ├── States.tsx           # LoadingSkeleton, EmptyState, and ErrorState
│       ├── Toast.tsx            # Toast notification context and stack
│       └── index.ts
├── lib/
│   ├── api.ts                   # Type-safe Flask REST API endpoints and error handler
│   └── auth.ts                  # Client session, JWT localStorage, and RBAC utilities
├── types/
│   └── index.ts                 # TypeScript interfaces for Stations, Chargers, Sessions, etc.
├── hooks/
│   └── useToast.ts              # Hook to trigger success/error/warning alerts
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── .env.local                   # Local API URL configuration
├── tailwind.config.js           # Sonik theme extensions
├── tsconfig.json                # Strict TypeScript configuration
└── package.json                 # Pinned dependencies
```

---

## Core Pages & Features

### 1. Operator Authentication (`/login`)
- Authenticates against Flask `/api/v1/auth/login`.
- Enforces Role-Based Access Control (RBAC): restricts ChargeOps access to `OPERATOR`, `ADMIN`, and `SUPPORT` roles. If a `DRIVER` logs in, access is denied with a clear explanatory message.
- Provides one-click quick-fill buttons for demo credentials.

### 2. Network Overview (`/operator`)
- Displays live statistics dynamically computed by the backend:
  - **Total Stations**
  - **Total Chargers**
  - **Chargers Available / Online**
  - **Chargers Currently Charging**
  - **Offline & Maintenance Units**
  - **Active Sessions**
  - **Energy Consumed Today (kWh) & All-Time Total**
- Interactive **Energy Consumption Trend** chart built with Recharts.
- **Recent Charger Activity** log with live telemetry timestamps.

### 3. Station Management (`/operator/stations`)
- Searchable data table with city filtering (Noida, Greater Noida).
- Geo-coordinate inspection.
- Modal view displaying full station specifications, active tariff rate per kWh, and connected charger inventory.

### 4. Charger Management (`/operator/chargers`)
- Multi-dimensional filtering by:
  - **Status:** `Available`, `Charging`, `Offline`, `Maintenance`
  - **Connector Type:** `CCS2` (DC Fast), `Type 2` (AC), `CHAdeMO`
  - **Power Output:** $\ge 20\text{ kW}$, $\ge 50\text{ kW}$, $\ge 100\text{ kW}$
- Charger detail inspection with parent station and pricing metadata.

### 5. Charging Session Lifecycle (`/operator/sessions`)
- Lists session history with driver and hardware tags.
- Status filters: `Active`, `Completed`, `Created`, `Cancelled`, `Failed`.
- **Operator Override Transition Modal:**
  - `Created` $\to$ `Active` (engages charger and timestamps start time)
  - `Active` $\to$ `Completed` (prompts for delivered energy in kWh and triggers automated payment record creation)
  - `Active` / `Created` $\to$ `Cancelled` or `Failed`
- Immediate background re-fetch and toast confirmation on successful state changes.

### 6. Service Ticket Triage (`/operator/tickets`)
- Tracks reported defects across Hardware, Connectivity, Software, Billing, and Safety categories.
- Filters by resolution status (`Open`, `In Progress`, `Resolved`, `Closed`) and priority (`Critical`, `High`, `Medium`, `Low`).
- Triage modal for operators to adjust priority and advance resolution status.

---

## Installation & Setup

### 1. Prerequisites
- Node.js 18.x or 20+ (tested on Node.js 22+)
- Running Flask backend at `http://localhost:5000`

### 2. Install Dependencies
```bash
cd sonik-chargeops
npm install
```

### 3. Configure Backend Endpoint
Ensure `.env.local` points to your running Flask API:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## Demo Accounts (DEMO DATA ONLY)

Use these credentials on the `/login` screen:

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **Operator** | `operator@sonik.ev` | `operator123` | Full ChargeOps operator dashboard, session overrides, ticket triage |
| **Admin** | `admin@sonik.ev` | `admin123` | Master administrator access |
| **Support** | `support@sonik.ev` | `support123` | Customer support & diagnostics |
| **Driver** | `driver@sonik.ev` | `driver123` | *Denied access to ChargeOps (ChargeConnect only)* |

---

## Educational Prototype Disclaimer

This dashboard is an educational prototype simulating EV charging operations workflows. It is not connected to physical EV charger hardware, proprietary OCPP/OCPI backends, or real credit card processing gateways.
