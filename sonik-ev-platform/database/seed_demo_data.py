#!/usr/bin/env python3
"""
DEMO DATA SEEDER — Sonik EV Platform
======================================
Populates the database with realistic demo records for local development and
QA testing.  No real payments or personal data are involved.

Usage
-----
  # From the project root:
  python database/seed_demo_data.py           # seed if DB is empty
  python database/seed_demo_data.py --force   # drop all tables, recreate, seed

Prerequisites
-------------
  - A running MySQL instance reachable via DATABASE_URL in .env
  - All Python dependencies installed  (pip install -r requirements.txt)
  - The Flask app factory is importable as  from app import create_app

Seeded records (per run)
------------------------
  4  users          (ADMIN, OPERATOR, DRIVER, SUPPORT)
  5  stations       (Noida / Greater Noida area)
  10 chargers       (mix of connector types and statuses)
  5  tariffs        (one per station, active from 30 days ago)
  8  charging sessions (Completed / Active / Cancelled / Created)
  4  payment records   (one per Completed session)
  5  service tickets   (Hardware, Connectivity, Billing, Software, Safety)
"""

import sys
import os

# ---------------------------------------------------------------------------
# Make the project root importable regardless of invocation directory
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.station import Station
from app.models.charger import Charger
from app.models.charging_session import ChargingSession
from app.models.tariff import Tariff
from app.models.service_ticket import ServiceTicket
from app.models.payment_record import PaymentRecord

from datetime import datetime, timedelta
import uuid


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _ref() -> str:
    """Generate a unique SONIK payment reference code."""
    return f"SONIK-{uuid.uuid4().hex[:12].upper()}"


# ---------------------------------------------------------------------------
# Seed functions (each returns the list of objects created)
# ---------------------------------------------------------------------------

def _seed_users() -> list:
    user_data = [
        ("Sonik Admin",   "admin@sonik.ev",    "admin123",    "ADMIN"),
        ("Rahul Verma",   "operator@sonik.ev", "operator123", "OPERATOR"),
        ("Priya Sharma",  "driver@sonik.ev",   "driver123",   "DRIVER"),
        ("Amit Khanna",   "support@sonik.ev",  "support123",  "SUPPORT"),
    ]
    users = []
    for name, email, pwd, role in user_data:
        u = User(name=name, email=email, role=role)
        u.set_password(pwd)
        db.session.add(u)
        users.append(u)
    db.session.commit()
    return users


def _seed_stations() -> list:
    stations_data = [
        (
            "Sector 18 EV Hub",
            "Sector 18 Market, Atta, Noida",
            "Noida",
            28.57062000,
            77.32722000,
        ),
        (
            "DLF Mall Charge Point",
            "Alpha Commercial Belt, Alpha 1, Greater Noida",
            "Greater Noida",
            28.47458000,
            77.50400000,
        ),
        (
            "Pari Chowk Supercharger",
            "Pari Chowk, Knowledge Park 1, Greater Noida",
            "Greater Noida",
            28.46697000,
            77.49420000,
        ),
        (
            "Noida City Centre Fast Charge",
            "Sector 39, Noida City Centre",
            "Noida",
            28.57002000,
            77.35812000,
        ),
        (
            "Jaypee Greens EV Station",
            "Jaypee Greens, Sector 128, Noida",
            "Greater Noida",
            28.49342000,
            77.52721000,
        ),
    ]
    stations = []
    for name, address, city, lat, lng in stations_data:
        s = Station(name=name, address=address, city=city, latitude=lat, longitude=lng)
        db.session.add(s)
        stations.append(s)
    db.session.commit()
    return stations


def _seed_chargers(stations: list) -> list:
    chargers_data = [
        # (station_index, connector_type, power_kw, status)
        (0, "CCS2",    50.0,  "Available"),
        (0, "Type2",   22.0,  "Charging"),
        (1, "CCS2",   100.0,  "Available"),
        (1, "CHAdeMO", 50.0,  "Offline"),
        (2, "CCS2",   150.0,  "Available"),
        (2, "Type2",   22.0,  "Maintenance"),
        (3, "CCS2",    60.0,  "Available"),
        (3, "Type2",   11.0,  "Charging"),
        (4, "CCS2",   120.0,  "Available"),
        (4, "CHAdeMO", 50.0,  "Available"),
    ]
    chargers = []
    for idx, conn, power, status in chargers_data:
        c = Charger(
            station_id=stations[idx].station_id,
            connector_type=conn,
            power_kw=power,
            status=status,
        )
        db.session.add(c)
        chargers.append(c)
    db.session.commit()
    return chargers


def _seed_tariffs(stations: list) -> tuple:
    """Returns (tariffs_list, tariff_map {station_id: Tariff})."""
    now = datetime.utcnow()
    tariffs_data = [
        (0, 16.5),
        (1, 18.0),
        (2, 15.5),
        (3, 17.0),
        (4, 19.5),
    ]
    tariffs = []
    tariff_map = {}
    for idx, rate in tariffs_data:
        sid = stations[idx].station_id
        t = Tariff(
            station_id=sid,
            rate_per_kwh=rate,
            valid_from=now - timedelta(days=30),
        )
        db.session.add(t)
        tariffs.append(t)
        tariff_map[sid] = t
    db.session.commit()
    return tariffs, tariff_map


def _seed_sessions(driver: "User", chargers: list) -> list:
    now = datetime.utcnow()
    sessions_input = [
        # (charger_index, start_time,                        end_time,                  energy_kwh, status)
        (0, now - timedelta(hours=5),                   now - timedelta(hours=3),          25.5, "Completed"),
        (2, now - timedelta(days=1, hours=2),           now - timedelta(days=1),           40.2, "Completed"),
        (4, now - timedelta(days=2, hours=1),           now - timedelta(days=2),           15.8, "Completed"),
        (6, now - timedelta(hours=2),                   now - timedelta(hours=1),          18.3, "Completed"),
        (1, now - timedelta(hours=1),                   None,                               0.0, "Active"),
        (7, now - timedelta(minutes=45),                None,                               0.0, "Active"),
        (9, now - timedelta(days=3),                    now - timedelta(days=3, minutes=5), 0.0, "Cancelled"),
        (8, None,                                       None,                               0.0, "Created"),
    ]
    sessions = []
    for cidx, start, end, energy, status in sessions_input:
        s = ChargingSession(
            user_id=driver.user_id,
            charger_id=chargers[cidx].charger_id,
            start_time=start,
            end_time=end,
            energy_kwh=energy,
            status=status,
        )
        db.session.add(s)
        sessions.append(s)
    db.session.commit()
    return sessions


def _seed_payments(
    sessions: list,
    chargers: list,
    tariff_map: dict,
    fallback_tariff: "Tariff",
) -> int:
    """Create one PaymentRecord per Completed session. Returns count created."""
    # Build a quick charger_id → station_id lookup from already-loaded objects
    charger_station: dict[int, int] = {c.charger_id: c.station_id for c in chargers}
    count = 0
    for s in sessions:
        if s.status != "Completed":
            continue
        sid = charger_station.get(s.charger_id)
        tariff = tariff_map.get(sid, fallback_tariff)
        rate = float(tariff.rate_per_kwh)
        amount = round(float(s.energy_kwh) * rate, 2)
        pr = PaymentRecord(
            session_id=s.session_id,
            amount=amount,
            payment_status="Completed",
            reference_code=_ref(),
        )
        db.session.add(pr)
        count += 1
    db.session.commit()
    return count


def _seed_tickets(driver: "User", operator: "User", chargers: list) -> list:
    tickets_data = [
        (
            driver.user_id,
            chargers[3].charger_id,
            "Hardware",
            "Charger display screen is blank and unresponsive. Cannot read session details.",
            "High",
            "Open",
        ),
        (
            driver.user_id,
            chargers[5].charger_id,
            "Connectivity",
            "Charger shows offline on app. OCPP heartbeat not received for 48 hours.",
            "Critical",
            "InProgress",
        ),
        (
            driver.user_id,
            chargers[0].charger_id,
            "Billing",
            "Was charged twice for the same session on 2026-11-10. Reference: SONIK-DUPBILL01",
            "High",
            "Open",
        ),
        (
            operator.user_id,
            chargers[2].charger_id,
            "Software",
            "Firmware version mismatch. App reports v2.1.0 but charger reports v1.9.5. Update needed.",
            "Medium",
            "Open",
        ),
        (
            driver.user_id,
            chargers[1].charger_id,
            "Safety",
            "Unusual sparking sound and slight burning smell when connector was inserted. Session aborted.",
            "Critical",
            "Open",
        ),
    ]
    tickets = []
    for user_id, charger_id, category, description, priority, status in tickets_data:
        t = ServiceTicket(
            user_id=user_id,
            charger_id=charger_id,
            category=category,
            description=description,
            priority=priority,
            status=status,
        )
        db.session.add(t)
        tickets.append(t)
    db.session.commit()
    return tickets


# ---------------------------------------------------------------------------
# Main entry-point
# ---------------------------------------------------------------------------

def seed_all(force: bool = False) -> None:
    app = create_app("development")
    with app.app_context():
        if force:
            print("--force: dropping all tables and recreating schema …")
            db.drop_all()

        print("Ensuring database tables exist …")
        db.create_all()

        # Idempotency guard (skipped when --force wipes the DB first)
        existing = User.query.filter_by(email="admin@sonik.ev").first()
        if existing:
            print(
                "Demo data already exists. "
                "Run with --force to drop everything and re-seed."
            )
            return

        # ---- users ---------------------------------------------------------
        print("Seeding users …")
        users = _seed_users()
        print(f"  ✓ {len(users)} users")

        admin    = users[0]  # noqa: F841  (kept for clarity)
        operator = users[1]
        driver   = users[2]

        # ---- stations ------------------------------------------------------
        print("Seeding stations …")
        stations = _seed_stations()
        print(f"  ✓ {len(stations)} stations")

        # ---- chargers ------------------------------------------------------
        print("Seeding chargers …")
        chargers = _seed_chargers(stations)
        print(f"  ✓ {len(chargers)} chargers")

        # ---- tariffs -------------------------------------------------------
        print("Seeding tariffs …")
        tariffs, tariff_map = _seed_tariffs(stations)
        print(f"  ✓ {len(tariffs)} tariffs")

        # ---- charging sessions ---------------------------------------------
        print("Seeding charging sessions …")
        sessions = _seed_sessions(driver, chargers)
        print(f"  ✓ {len(sessions)} charging sessions")

        # ---- payment records -----------------------------------------------
        print("Seeding payment records …")
        pcount = _seed_payments(sessions, chargers, tariff_map, tariffs[0])
        print(f"  ✓ {pcount} payment records")

        # ---- service tickets -----------------------------------------------
        print("Seeding service tickets …")
        tickets = _seed_tickets(driver, operator, chargers)
        print(f"  ✓ {len(tickets)} service tickets")

        # ---- summary -------------------------------------------------------
        print()
        print("=" * 54)
        print("  Demo data seeded successfully!")
        print("=" * 54)
        print()
        print("  Demo credentials")
        print("  ─────────────────────────────────────────────")
        print("  Role      Email                  Password")
        print("  ─────────────────────────────────────────────")
        print("  ADMIN     admin@sonik.ev         admin123")
        print("  OPERATOR  operator@sonik.ev      operator123")
        print("  DRIVER    driver@sonik.ev        driver123")
        print("  SUPPORT   support@sonik.ev       support123")
        print("  ─────────────────────────────────────────────")
        print()


if __name__ == "__main__":
    force = "--force" in sys.argv
    seed_all(force=force)
