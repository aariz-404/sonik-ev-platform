"""
tests/base.py — Base test case class providing test fixtures, in-memory DB, and seed data.
"""

import unittest
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.station import Station
from app.models.charger import Charger
from app.models.charging_session import ChargingSession
from app.models.tariff import Tariff
from app.models.service_ticket import ServiceTicket
from app.models.payment_record import PaymentRecord
from app.middleware.auth import generate_token


class BaseTestCase(unittest.TestCase):
    """Base class for all test cases."""

    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

        db.create_all()
        self.seed_test_data()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def seed_test_data(self):
        """Seed minimal comprehensive data for test scenarios."""
        # 1. Users
        self.admin_user = User(name='Admin User', email='admin@sonik.ev', role='ADMIN')
        self.admin_user.set_password('admin123')

        self.operator_user = User(name='Operator User', email='operator@sonik.ev', role='OPERATOR')
        self.operator_user.set_password('operator123')

        self.driver_user = User(name='Driver User', email='driver@sonik.ev', role='DRIVER')
        self.driver_user.set_password('driver123')

        self.other_driver = User(name='Other Driver', email='driver2@sonik.ev', role='DRIVER')
        self.other_driver.set_password('driver123')

        self.support_user = User(name='Support User', email='support@sonik.ev', role='SUPPORT')
        self.support_user.set_password('support123')

        db.session.add_all([
            self.admin_user, self.operator_user, self.driver_user,
            self.other_driver, self.support_user
        ])
        db.session.commit()

        # Auth headers
        self.admin_token = generate_token(self.admin_user.user_id, self.admin_user.role, self.admin_user.email)
        self.admin_headers = {'Authorization': f'Bearer {self.admin_token}', 'Content-Type': 'application/json'}

        self.operator_token = generate_token(self.operator_user.user_id, self.operator_user.role, self.operator_user.email)
        self.operator_headers = {'Authorization': f'Bearer {self.operator_token}', 'Content-Type': 'application/json'}

        self.driver_token = generate_token(self.driver_user.user_id, self.driver_user.role, self.driver_user.email)
        self.driver_headers = {'Authorization': f'Bearer {self.driver_token}', 'Content-Type': 'application/json'}

        self.other_driver_token = generate_token(self.other_driver.user_id, self.other_driver.role, self.other_driver.email)
        self.other_driver_headers = {'Authorization': f'Bearer {self.other_driver_token}', 'Content-Type': 'application/json'}

        self.support_token = generate_token(self.support_user.user_id, self.support_user.role, self.support_user.email)
        self.support_headers = {'Authorization': f'Bearer {self.support_token}', 'Content-Type': 'application/json'}

        # 2. Stations
        self.station1 = Station(
            name='Sector 18 EV Hub',
            address='Sector 18 Market, Atta, Noida',
            city='Noida',
            latitude=28.57062000,
            longitude=77.32722000
        )
        self.station2 = Station(
            name='DLF Mall Charge Point',
            address='Alpha Commercial Belt, Greater Noida',
            city='Greater Noida',
            latitude=28.47458000,
            longitude=77.50400000
        )
        db.session.add_all([self.station1, self.station2])
        db.session.commit()

        # 3. Chargers
        self.charger1 = Charger(station_id=self.station1.station_id, connector_type='CCS2', power_kw=50.0, status='Available')
        self.charger2 = Charger(station_id=self.station1.station_id, connector_type='Type2', power_kw=22.0, status='Charging')
        self.charger3 = Charger(station_id=self.station2.station_id, connector_type='CCS2', power_kw=100.0, status='Available')
        self.charger4 = Charger(station_id=self.station2.station_id, connector_type='CHAdeMO', power_kw=50.0, status='Offline')
        db.session.add_all([self.charger1, self.charger2, self.charger3, self.charger4])
        db.session.commit()

        # 4. Tariffs
        now = datetime.utcnow()
        self.tariff1 = Tariff(station_id=self.station1.station_id, rate_per_kwh=16.5, valid_from=now - timedelta(days=10))
        self.tariff2 = Tariff(station_id=self.station2.station_id, rate_per_kwh=18.0, valid_from=now - timedelta(days=10))
        db.session.add_all([self.tariff1, self.tariff2])
        db.session.commit()

        # 5. Charging Sessions
        self.session1 = ChargingSession(
            user_id=self.driver_user.user_id,
            charger_id=self.charger1.charger_id,
            start_time=now - timedelta(hours=3),
            end_time=now - timedelta(hours=2),
            energy_kwh=20.0,
            status='Completed'
        )
        self.session2 = ChargingSession(
            user_id=self.driver_user.user_id,
            charger_id=self.charger2.charger_id,
            start_time=now - timedelta(hours=1),
            energy_kwh=0.0,
            status='Active'
        )
        db.session.add_all([self.session1, self.session2])
        db.session.commit()

        # 6. Payment Record
        self.payment1 = PaymentRecord(
            session_id=self.session1.session_id,
            amount=330.0,
            payment_status='Completed',
            reference_code='SONIK-TEST-001'
        )
        db.session.add(self.payment1)

        # 7. Service Ticket
        self.ticket1 = ServiceTicket(
            user_id=self.driver_user.user_id,
            charger_id=self.charger4.charger_id,
            category='Hardware',
            description='Screen broken on charger 4',
            priority='High',
            status='Open'
        )
        db.session.add(self.ticket1)
        db.session.commit()
