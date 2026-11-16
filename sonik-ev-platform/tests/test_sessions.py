"""
tests/test_sessions.py — Test cases for Charging Session state machine, lifecycle, and authorization.
"""

from tests.base import BaseTestCase
from app.models.charger import Charger
from app.models.payment_record import PaymentRecord


class TestSessions(BaseTestCase):
    """Test charging session lifecycle and state machine."""

    def test_create_session_success(self):
        """Creating session on an Available charger succeeds and returns status Created."""
        payload = {'charger_id': self.charger3.charger_id}  # charger3 is Available
        res = self.client.post('/api/v1/sessions', json=payload, headers=self.driver_headers)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['status'], 'Created')
        self.assertEqual(data['data']['charger_id'], self.charger3.charger_id)

    def test_create_session_unavailable_charger(self):
        """Attempting to start a session on a Charging or Offline charger returns 409 Conflict."""
        # charger2 is 'Charging'
        res = self.client.post('/api/v1/sessions', json={'charger_id': self.charger2.charger_id}, headers=self.driver_headers)
        self.assertEqual(res.status_code, 409)

        # charger4 is 'Offline'
        res = self.client.post('/api/v1/sessions', json={'charger_id': self.charger4.charger_id}, headers=self.driver_headers)
        self.assertEqual(res.status_code, 409)

    def test_create_session_missing_charger(self):
        """Non-existent charger returns 404."""
        res = self.client.post('/api/v1/sessions', json={'charger_id': 9999}, headers=self.driver_headers)
        self.assertEqual(res.status_code, 404)

    def test_state_machine_created_to_active(self):
        """Transition Created -> Active sets start_time and flips charger to Charging."""
        # Create session on charger3
        res = self.client.post('/api/v1/sessions', json={'charger_id': self.charger3.charger_id}, headers=self.driver_headers)
        session_id = res.get_json()['data']['session_id']

        # Transition to Active
        res = self.client.patch(f'/api/v1/sessions/{session_id}', json={'status': 'Active'}, headers=self.driver_headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['data']['status'], 'Active')
        self.assertIsNotNone(data['data']['start_time'])

        # Check charger status is now 'Charging'
        charger = Charger.query.get(self.charger3.charger_id)
        self.assertEqual(charger.status, 'Charging')

    def test_state_machine_active_to_completed(self):
        """Transition Active -> Completed sets end_time, resets charger to Available, and creates PaymentRecord."""
        # self.session2 is Active on charger2
        res = self.client.patch(
            f'/api/v1/sessions/{self.session2.session_id}',
            json={'status': 'Completed', 'energy_kwh': 25.5},
            headers=self.driver_headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['data']['status'], 'Completed')
        self.assertEqual(data['data']['energy_kwh'], 25.5)
        self.assertIsNotNone(data['data']['end_time'])

        # Check charger is now Available
        charger = Charger.query.get(self.charger2.charger_id)
        self.assertEqual(charger.status, 'Available')

        # Check PaymentRecord was created
        payment = PaymentRecord.query.filter_by(session_id=self.session2.session_id).first()
        self.assertIsNotNone(payment)
        self.assertEqual(payment.payment_status, 'Completed')
        self.assertGreater(payment.amount, 0)

    def test_completed_requires_positive_energy(self):
        """Completing a session without positive energy_kwh is rejected with 400 or 422."""
        res = self.client.patch(
            f'/api/v1/sessions/{self.session2.session_id}',
            json={'status': 'Completed', 'energy_kwh': 0},
            headers=self.driver_headers
        )
        self.assertIn(res.status_code, [400, 422])

        res = self.client.patch(
            f'/api/v1/sessions/{self.session2.session_id}',
            json={'status': 'Completed', 'energy_kwh': -5.0},
            headers=self.driver_headers
        )
        self.assertIn(res.status_code, [400, 422])

    def test_invalid_transitions_rejected(self):
        """Invalid state transitions are rejected with 422."""
        # 1. Created -> Completed directly is invalid
        res = self.client.post('/api/v1/sessions', json={'charger_id': self.charger3.charger_id}, headers=self.driver_headers)
        session_id = res.get_json()['data']['session_id']
        res = self.client.patch(f'/api/v1/sessions/{session_id}', json={'status': 'Completed', 'energy_kwh': 10.0}, headers=self.driver_headers)
        self.assertEqual(res.status_code, 422)

        # 2. Completed -> Active is invalid
        res = self.client.patch(f'/api/v1/sessions/{self.session1.session_id}', json={'status': 'Active'}, headers=self.driver_headers)
        self.assertEqual(res.status_code, 422)

        # 3. Completed -> Cancelled is invalid
        res = self.client.patch(f'/api/v1/sessions/{self.session1.session_id}', json={'status': 'Cancelled'}, headers=self.driver_headers)
        self.assertEqual(res.status_code, 422)

    def test_driver_cannot_modify_other_driver_session(self):
        """A driver cannot modify another driver's charging session."""
        res = self.client.patch(
            f'/api/v1/sessions/{self.session2.session_id}',
            json={'status': 'Cancelled'},
            headers=self.other_driver_headers
        )
        self.assertEqual(res.status_code, 403)

    def test_list_sessions_role_isolation(self):
        """Drivers only see their own sessions; Admin sees all sessions."""
        # Driver
        res = self.client.get('/api/v1/sessions', headers=self.driver_headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        for s in data['data']:
            self.assertEqual(s['user_id'], self.driver_user.user_id)

        # Admin
        res = self.client.get('/api/v1/sessions', headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreaterEqual(data['pagination']['total'], 2)
