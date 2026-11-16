from flask import Blueprint, request
from app.services import session_service
from app.validators.session_validator import validate_create_session, validate_update_session
from app.middleware.auth import token_required
from app.middleware.response import success_response, error_response, paginated_response

sessions_bp = Blueprint('sessions', __name__, url_prefix='/api/v1/sessions')

@sessions_bp.route('', methods=['POST'])
@token_required
def create_session():
    from flask import g
    data = request.get_json(silent=True) or {}
    validated, errors = validate_create_session(data)
    if errors:
        return error_response('Bad Request', 'Validation failed', 400, errors)
    result, msg, code = session_service.create_session(g.current_user['user_id'], validated['charger_id'])
    if code:
        return error_response('Error', msg, code)
    return success_response(result, 'Session created successfully', 201)

@sessions_bp.route('', methods=['GET'])
@token_required
def list_sessions():
    from flask import g
    args = request.args
    status = args.get('status')
    charger_id = args.get('charger_id')
    if charger_id:
        try:
            charger_id = int(charger_id)
        except (ValueError, TypeError):
            charger_id = None
    try:
        limit = min(int(args.get('limit', 20)), 100)
        offset = max(int(args.get('offset', 0)), 0)
    except (ValueError, TypeError):
        limit, offset = 20, 0
    sessions, total = session_service.get_sessions(g.current_user, charger_id=charger_id, status=status, limit=limit, offset=offset)
    return paginated_response(sessions, total, limit, offset)

@sessions_bp.route('/<int:session_id>', methods=['PATCH'])
@token_required
def update_session(session_id):
    from flask import g
    data = request.get_json(silent=True) or {}
    validated, errors = validate_update_session(data)
    if errors:
        return error_response('Bad Request', 'Validation failed', 400, errors)
    result, msg, code = session_service.update_session(session_id, validated['status'], validated.get('energy_kwh'), g.current_user)
    if code:
        return error_response('Error', msg, code)
    return success_response(result, 'Session updated successfully')
