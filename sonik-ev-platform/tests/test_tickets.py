"""
tests/test_tickets.py — Test cases for Service Tickets endpoints.
"""

from tests.base import BaseTestCase


class TestTickets(BaseTestCase):
    """Test service ticket operations, creation, and status updates."""

    def test_create_ticket_success(self):
        """Driver can submit a service ticket."""
        payload = {
            'charger_id': self.charger1.charger_id,
            'category': 'Connectivity',
            'description': 'Charger fails to communicate with network when starting session.',
            'priority': 'High'
        }
        res = self.client.post('/api/v1/tickets', json=payload, headers=self.driver_headers)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['status'], 'Open')
        self.assertEqual(data['data']['category'], 'Connectivity')
        self.assertEqual(data['data']['user_id'], self.driver_user.user_id)

    def test_create_ticket_invalid_category(self):
        """Invalid category is rejected with 400 or 422."""
        payload = {
            'charger_id': self.charger1.charger_id,
            'category': 'UnknownCategory',
            'description': 'Something is wrong with this charger.',
            'priority': 'Medium'
        }
        res = self.client.post('/api/v1/tickets', json=payload, headers=self.driver_headers)
        self.assertIn(res.status_code, [400, 422])

    def test_list_tickets(self):
        """List tickets with optional status and priority filters."""
        res = self.client.get('/api/v1/tickets?status=Open', headers=self.operator_headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertGreaterEqual(len(data['data']), 1)

    def test_update_ticket_by_operator(self):
        """Operator can update ticket status and priority."""
        payload = {'status': 'InProgress', 'priority': 'Critical'}
        res = self.client.patch(f'/api/v1/tickets/{self.ticket1.ticket_id}', json=payload, headers=self.operator_headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['data']['status'], 'InProgress')
        self.assertEqual(data['data']['priority'], 'Critical')

    def test_driver_cannot_modify_other_user_ticket(self):
        """Driver cannot update tickets filed by other users."""
        payload = {'description': 'Tampered description'}
        res = self.client.patch(f'/api/v1/tickets/{self.ticket1.ticket_id}', json=payload, headers=self.other_driver_headers)
        self.assertEqual(res.status_code, 403)
