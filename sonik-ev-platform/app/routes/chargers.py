from flask import Blueprint, request
from app.services import charger_service
from app.validators.station_validator import validate_charger_filters
from app.middleware.response import success_response, error_response, paginated_response

chargers_bp = Blueprint('chargers', __name__, url_prefix='/api/v1/chargers')

@chargers_bp.route('', methods=['GET'])
def list_chargers():
    filters, errors = validate_charger_filters(request.args)
    if errors:
        return error_response('Bad Request', 'Invalid query parameters', 400, errors)
    chargers, total = charger_service.get_chargers(
        station_id=filters['station_id'], connector_type=filters['connector_type'],
        status=filters['status'], min_power=filters['min_power'],
        limit=filters['limit'], offset=filters['offset']
    )
    return paginated_response(chargers, total, filters['limit'], filters['offset'])

@chargers_bp.route('/<int:charger_id>', methods=['GET'])
def get_charger(charger_id):
    charger = charger_service.get_charger(charger_id)
    if not charger:
        return error_response('Not Found', f'Charger {charger_id} not found', 404)
    return success_response(charger)
