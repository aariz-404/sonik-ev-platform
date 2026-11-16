from flask import Blueprint, request, g
from app.services import ticket_service
from app.validators.ticket_validator import validate_create_ticket, validate_update_ticket
from app.middleware.auth import token_required
from app.middleware.response import success_response, error_response, paginated_response

tickets_bp = Blueprint('tickets', __name__, url_prefix='/api/v1/tickets')

@tickets_bp.route('', methods=['GET'])
@token_required
def list_tickets():
    args = request.args
    status = args.get('status')
    priority = args.get('priority')
    try:
        limit = min(int(args.get('limit', 20)), 100)
        offset = max(int(args.get('offset', 0)), 0)
    except (ValueError, TypeError):
        limit, offset = 20, 0
    tickets, total = ticket_service.get_tickets(g.current_user, status=status, priority=priority, limit=limit, offset=offset)
    return paginated_response(tickets, total, limit, offset)

@tickets_bp.route('', methods=['POST'])
@token_required
def create_ticket():
    data = request.get_json(silent=True) or {}
    validated, errors = validate_create_ticket(data)
    if errors:
        return error_response('Bad Request', 'Validation failed', 400, errors)
    result, msg, code = ticket_service.create_ticket(g.current_user, validated['charger_id'], validated['category'], validated['description'], validated['priority'])
    if code:
        return error_response('Error', msg, code)
    return success_response(result, 'Ticket created successfully', 201)

@tickets_bp.route('/<int:ticket_id>', methods=['PATCH'])
@token_required
def update_ticket(ticket_id):
    data = request.get_json(silent=True) or {}
    validated, errors = validate_update_ticket(data)
    if errors:
        return error_response('Bad Request', 'Validation failed', 400, errors)
    result, msg, code = ticket_service.update_ticket(ticket_id, validated, g.current_user)
    if code:
        return error_response('Error', msg, code)
    return success_response(result, 'Ticket updated successfully')
