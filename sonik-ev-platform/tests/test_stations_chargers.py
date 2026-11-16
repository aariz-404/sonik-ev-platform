"""
tests/test_stations_chargers.py — Test cases for Station and Charger endpoints.
"""

from tests.base import BaseTestCase


class TestStationsChargers(BaseTestCase):
    """Test stations and chargers endpoints and filters."""

    # ------------------ STATIONS ------------------ #

    def test_list_stations(self):
        """GET /api/v1/stations returns paginated stations list."""
        res = self.client.get('/api/v1/stations')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
        self.assertEqual(data['pagination']['total'], 2)

    def test_filter_stations_by_city(self):
        """Filter stations by city."""
        res = self.client.get('/api/v1/stations?city=Noida')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data['data']), 1)
        self.assertEqual(data['data'][0]['city'], 'Noida')

    def test_search_stations_text(self):
        """Search stations by name or address keyword."""
        res = self.client.get('/api/v1/stations?search=Sector 18')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data['data']), 1)
        self.assertIn('Sector 18', data['data'][0]['name'])

    def test_get_station_by_id(self):
        """GET /api/v1/stations/<id> returns station with charger count and current tariff."""
        res = self.client.get(f'/api/v1/stations/{self.station1.station_id}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['name'], 'Sector 18 EV Hub')
        self.assertIn('charger_count', data['data'])
        self.assertEqual(data['data']['charger_count'], 2)
        self.assertIn('current_tariff', data['data'])
        self.assertIsNotNone(data['data']['current_tariff'])

    def test_get_station_not_found(self):
        """GET /api/v1/stations/9999 returns 404."""
        res = self.client.get('/api/v1/stations/9999')
        self.assertEqual(res.status_code, 404)
        data = res.get_json()
        self.assertFalse(data['success'])

    # ------------------ CHARGERS ------------------ #

    def test_list_chargers(self):
        """GET /api/v1/chargers returns all chargers with nested station info."""
        res = self.client.get('/api/v1/chargers')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 4)
        self.assertIn('station', data['data'][0])

    def test_filter_chargers(self):
        """Filter chargers by station, connector, status, and min_power."""
        # By status
        res = self.client.get('/api/v1/chargers?status=Available')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data['data']), 2)

        # By connector_type
        res = self.client.get('/api/v1/chargers?connector_type=CCS2')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data['data']), 2)

        # By min_power
        res = self.client.get('/api/v1/chargers?min_power=60')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data['data']), 1)
        self.assertEqual(data['data'][0]['power_kw'], 100.0)

    def test_get_charger_by_id(self):
        """GET /api/v1/chargers/<id> returns single charger with station details."""
        res = self.client.get(f'/api/v1/chargers/{self.charger1.charger_id}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['connector_type'], 'CCS2')
        self.assertEqual(data['data']['station']['station_id'], self.station1.station_id)

    def test_get_charger_not_found(self):
        """GET /api/v1/chargers/9999 returns 404."""
        res = self.client.get('/api/v1/chargers/9999')
        self.assertEqual(res.status_code, 404)
        data = res.get_json()
        self.assertFalse(data['success'])
