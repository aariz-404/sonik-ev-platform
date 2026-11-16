from flask import Blueprint, request, g, current_app
from app.models.user import User
from app.extensions import db
from app.middleware.auth import generate_token, token_required
from app.middleware.response import success_response, error_response

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new EV Driver account.

    **Request body** (JSON):
        {
            "name": "Jane Doe",
            "email": "driver@example.com",
            "password": "password123"
        }

    **Responses:**
        - 201: Registration successful, returns token and user info.
        - 400: Validation error.
        - 409: Email already registered.
    """
    data = request.get_json(silent=True) or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    errors = []
    if not name:
        errors.append('Name is required.')
    if not email or '@' not in email:
        errors.append('A valid email address is required.')
    if not password or len(password) < 6:
        errors.append('Password must be at least 6 characters.')

    if errors:
        return error_response('Bad Request', 'Validation failed', 400, errors)

    existing = User.query.filter_by(email=email).first()
    if existing:
        return error_response('Conflict', 'An account with this email already exists.', 409)

    user = User(name=name, email=email, role='DRIVER')
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    expires_in = current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)
    token = generate_token(user.user_id, user.role, user.email)

    return success_response(
        {
            'token': token,
            'token_type': 'Bearer',
            'expires_in': expires_in,
            'user': user.to_dict(),
        },
        'Registration successful',
        201,
    )


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user and return a JWT access token.

    **Request body** (JSON):

    .. code-block:: json

        {
            "email": "user@example.com",
            "password": "s3cr3t"
        }

    **Responses:**

    - ``200`` – login successful, token returned.
    - ``400`` – email or password missing.
    - ``401`` – invalid credentials.
    """
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return error_response(
            'Bad Request',
            'Email and password are required',
            400,
        )

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response(
            'Unauthorized',
            'Invalid email or password',
            401,
        )

    if not getattr(user, 'is_active', True):
        return error_response(
            'Forbidden',
            'Account is disabled. Please contact support.',
            403,
        )

    expires_in = current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)
    token = generate_token(user.user_id, user.role, user.email)

    return success_response(
        {
            'token': token,
            'token_type': 'Bearer',
            'expires_in': expires_in,
            'user': user.to_dict(),
        },
        'Login successful',
    )


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me():
    """Return the authenticated user's profile.

    Requires a valid ``Authorization: Bearer <token>`` header.

    **Responses:**

    - ``200`` – user profile returned.
    - ``401`` – missing or invalid token.
    - ``404`` – user record not found.
    """
    user = User.query.get(g.current_user['user_id'])
    if not user:
        return error_response('Not Found', 'User not found', 404)
    return success_response(user.to_dict())


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """Invalidate the current session (client-side token discard).

    Because JWTs are stateless, the server cannot truly revoke a token.
    The client must delete the token from storage.  For server-side
    revocation, integrate a token-blocklist (e.g. Redis) separately.

    **Responses:**

    - ``200`` – logout acknowledged.
    - ``401`` – missing or invalid token.
    """
    return success_response(
        message='Logged out successfully. Please discard your token.',
    )


@auth_bp.route('/refresh', methods=['POST'])
@token_required
def refresh():
    """Issue a fresh token for the currently authenticated user.

    The existing token must still be valid when this endpoint is called.
    Returns a new token with a reset expiry window.

    **Responses:**

    - ``200`` – new token returned.
    - ``401`` – missing or expired token.
    - ``404`` – user no longer exists.
    """
    user = User.query.get(g.current_user['user_id'])
    if not user:
        return error_response('Not Found', 'User not found', 404)

    if not getattr(user, 'is_active', True):
        return error_response(
            'Forbidden',
            'Account is disabled. Please contact support.',
            403,
        )

    expires_in = current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)
    token = generate_token(user.user_id, user.role, user.email)

    return success_response(
        {
            'token': token,
            'token_type': 'Bearer',
            'expires_in': expires_in,
        },
        'Token refreshed successfully',
    )
