"""
tests/test_auth.py — Test cases for authentication and authorization endpoints.
"""

import json
from tests.base import BaseTestCase


class TestAuth(BaseTestCase):
    """Test login, me, and logout authentication flows."""

    def test_login_success(self):
        """Valid credentials return a JWT token and user info."""
        payload = {'email': 'admin@sonik.ev', 'password': 'admin123'}
        res = self.client.post('/api/v1/auth/login', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('token', data['data'])
        self.assertEqual(data['data']['user']['email'], 'admin@sonik.ev')
        self.assertEqual(data['data']['user']['role'], 'ADMIN')

    def test_login_invalid_password(self):
        """Invalid password returns 401 Unauthorized."""
        payload = {'email': 'admin@sonik.ev', 'password': 'wrongpassword'}
        res = self.client.post('/api/v1/auth/login', json=payload)
        self.assertEqual(res.status_code, 401)
        data = res.get_json()
        self.assertFalse(data['success'])

    def test_login_missing_fields(self):
        """Missing email or password returns 400 Bad Request."""
        res = self.client.post('/api/v1/auth/login', json={'email': 'admin@sonik.ev'})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data['success'])

    def test_get_me_success(self):
        """Valid Bearer token accesses /auth/me."""
        res = self.client.get('/api/v1/auth/me', headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['email'], 'admin@sonik.ev')

    def test_get_me_missing_token(self):
        """Request without token returns 401 Unauthorized."""
        res = self.client.get('/api/v1/auth/me')
        self.assertEqual(res.status_code, 401)
        data = res.get_json()
        self.assertFalse(data['success'])

    def test_logout(self):
        """Logout endpoint returns success acknowledgment."""
        res = self.client.post('/api/v1/auth/logout', headers=self.driver_headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
