from flask import Blueprint, request
from app.services import station_service
from app.validators.station_validator import validate_station_filters
from app.middleware.response import success_response, error_response, paginated_response

stations_bp = Blueprint('stations', __name__, url_prefix='/api/v1/stations')

@stations_bp.route('', methods=['GET'])
def list_stations():
    filters, errors = validate_station_filters(request.args)
    if errors:
        return error_response('Bad Request', 'Invalid query parameters', 400, errors)
    stations, total = station_service.get_stations(
        city=filters['city'], search=filters['search'],
        limit=filters['limit'], offset=filters['offset']
    )
    return paginated_response(stations, total, filters['limit'], filters['offset'])

@stations_bp.route('/<int:station_id>', methods=['GET'])
def get_station(station_id):
    station = station_service.get_station(station_id)
    if not station:
        return error_response('Not Found', f'Station {station_id} not found', 404)
    return success_response(station)
