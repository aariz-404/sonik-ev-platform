from functools import wraps
from flask import request, jsonify, g, current_app
import jwt
import time
from datetime import datetime, timezone


def generate_token(user_id, role, email):
    """Generate a signed JWT access token for the given user."""
    expires_in = current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)
    now = int(time.time())
    payload = {
        'sub': user_id,
        'role': role,
        'email': email,
        'iat': now,
        'exp': now + expires_in,
    }
    return jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256',
    )


def decode_token(token):
    """Decode and verify a JWT, returning its payload."""
    return jwt.decode(
        token,
        current_app.config['JWT_SECRET_KEY'],
        algorithms=['HS256'],
    )


def token_required(f):
    """Decorator: require a valid Bearer token in the Authorization header.

    On success, sets ``g.current_user`` to a dict with keys
    ``user_id``, ``role``, and ``email``.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Unauthorized',
                'message': 'Missing or invalid token',
            }), 401

        token = auth_header.split(' ', 1)[1]
        try:
            payload = decode_token(token)
            g.current_user = {
                'user_id': payload['sub'],
                'role': payload['role'],
                'email': payload['email'],
            }
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'error': 'Unauthorized',
                'message': 'Token has expired',
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'error': 'Unauthorized',
                'message': 'Invalid token',
            }), 401

        return f(*args, **kwargs)
    return decorated


def role_required(*roles):
    """Decorator: require the authenticated user to hold one of *roles*.

    Must be applied **after** (i.e. outer to) any other route decorators;
    ``token_required`` is applied automatically.

    Example::

        @bp.route('/admin')
        @role_required('admin', 'superadmin')
        def admin_view():
            ...
    """
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if g.current_user.get('role') not in roles:
                return jsonify({
                    'success': False,
                    'error': 'Forbidden',
                    'message': f'Access restricted to: {", ".join(roles)}',
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
