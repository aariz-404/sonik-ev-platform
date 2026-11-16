"""
tests/test_analytics.py — Test cases for Dashboard Analytics and RBAC access control.
"""

from tests.base import BaseTestCase


class TestAnalytics(BaseTestCase):
    """Test analytics calculations and role-based permissions."""

    def test_analytics_summary_as_admin(self):
        """Admin can access analytics summary and receives calculated DB metrics."""
        res = self.client.get('/api/v1/analytics/summary', headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])

        stats = data['data']['stats']
        self.assertEqual(stats['total_stations'], 2)
        self.assertEqual(stats['total_chargers'], 4)
        self.assertEqual(stats['available_chargers'], 2)
        self.assertEqual(stats['charging_chargers'], 1)
        self.assertEqual(stats['offline_chargers'], 1)
        self.assertEqual(stats['active_sessions'], 1)
        self.assertEqual(stats['open_tickets'], 1)
        self.assertIn('total_energy_today_kwh', stats)
        self.assertIn('total_energy_all_time_kwh', stats)

        # Recent activity
        self.assertIn('recent_activity', data['data'])
        self.assertIsInstance(data['data']['recent_activity'], list)

    def test_analytics_summary_as_operator(self):
        """Operator can access analytics summary."""
        res = self.client.get('/api/v1/analytics/summary', headers=self.operator_headers)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.get_json()['success'])

    def test_analytics_summary_as_support(self):
        """Support can access analytics summary."""
        res = self.client.get('/api/v1/analytics/summary', headers=self.support_headers)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.get_json()['success'])

    def test_driver_forbidden_from_analytics(self):
        """Drivers MUST NOT access operator/admin analytics (403 Forbidden)."""
        res = self.client.get('/api/v1/analytics/summary', headers=self.driver_headers)
        self.assertEqual(res.status_code, 403)
        data = res.get_json()
        self.assertFalse(data['success'])
        self.assertEqual(data['error'], 'Forbidden')

    def test_unauthenticated_forbidden_from_analytics(self):
        """Unauthenticated requests are rejected with 401 Unauthorized."""
        res = self.client.get('/api/v1/analytics/summary')
        self.assertEqual(res.status_code, 401)
