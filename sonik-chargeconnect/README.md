# Sonik ChargeConnect — EV Driver Charger Discovery & Session Portal

**ChargeConnect** is the customer-facing EV driver portal for the **Sonik EV Platform** (inspired by the domain and workflows of Sonik Mobility). It enables electric vehicle drivers to discover charging stations across Noida and Greater Noida, check connector compatibility (CCS2, Type 2, etc.), verify live availability and power ratings, initiate demonstration charging sessions linked to backend state machines, and track their personal charging history.

---

## ⚡ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Navy `#10233F`, Electric Blue `#1463FF`, Green for Available, Orange for Charging, Red for Offline)
- **Icons:** Lucide React
- **Client State & API:** Fetch with typed API client, JWT session handling, and Toast notifications
- **Backend Integration:** Connects to Sonik EV Platform Flask REST API (`http://localhost:5000/api/v1`)

---

## 🚀 Key Features

1. **Driver Authentication & Registration:**
   - Dedicated driver sign-in with instant demo autofill (`driver@sonik.ev` / `driver123`).
   - Self-service registration creating real driver accounts in the backend via `POST /api/v1/auth/register`.
   - Role-based route guard redirecting unauthorized users.

2. **Find a Charger (Discovery & Smart Filtering):**
   - Live availability counters (Total, Available, In Use).
   - Real-time search by station name, landmark, address, or connector.
   - Multi-criteria filtering: Location / City, Connector Type, Minimum Power (kW), Availability Status.
   - Deterministic illustrative distances (e.g. `2.6 km away (approx)`).

3. **Charger Details & Specifications:**
   - High-fidelity hardware specs (Power rating, Connector type, 24/7 access note).
   - Real-time station details, address, and applicable electricity tariff (`₹ / kWh`).
   - Embedded interactive demonstration session controller.

4. **8-Step Demonstration Session Workflow:**
   - **Step 1:** Select an Available charger.
   - **Step 2:** Display hardware specs and active tariff per kWh.
   - **Step 3 & 4:** Driver clicks "Start Demo Session" &rarr; `POST /api/v1/sessions` generates session ID with `Created` status.
   - **Step 5 & 6:** "Activate Session" &rarr; `PATCH /api/v1/sessions/<id>` engages power relay and transitions to `Active`.
   - **Step 7:** Live active timer and simulated energy telemetry slider.
   - **Step 8:** Driver completes or aborts session &rarr; `PATCH /api/v1/sessions/<id>` updates to `Completed` (with energy kWh delivered) or `Cancelled`, resetting hardware status to Available.

5. **My Sessions (Driver Isolated History):**
   - Real-time session history fetched from `GET /api/v1/sessions` (filtered to authenticated driver).
   - Filter by status: All, Active, Created, Completed, Cancelled.
   - Direct inline action buttons for active or created sessions.
   - Aggregate total energy delivered counter.

6. **Support & Service Requests:**
   - Log service tickets via `POST /api/v1/tickets` (Hardware, Software, Connectivity, Billing, Safety).
   - Optional link to specific charger hardware.
   - Real-time list of driver-submitted tickets with status badges (`Open`, `InProgress`, `Resolved`).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js LTS (v18+)
- Sonik EV Platform Backend running on `http://localhost:5000`

### Setup & Run
```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Start production server on port 3001 (ChargeOps runs on 3000)
npm run start
```

Or for development:
```bash
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) in your browser.
