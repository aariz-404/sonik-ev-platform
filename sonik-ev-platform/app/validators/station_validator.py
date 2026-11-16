def validate_station_filters(args):
    errors = []
    city = args.get('city', '').strip() or None
    search = args.get('search', '').strip() or None
    try:
        limit = int(args.get('limit', 20))
        if limit < 1 or limit > 100:
            limit = 20
    except (ValueError, TypeError):
        limit = 20
    try:
        offset = int(args.get('offset', 0))
        if offset < 0:
            offset = 0
    except (ValueError, TypeError):
        offset = 0
    return {'city': city, 'search': search, 'limit': limit, 'offset': offset}, errors

def validate_charger_filters(args):
    errors = []
    station_id = None
    connector_type = args.get('connector_type', '').strip() or None
    status = args.get('status', '').strip() or None
    min_power = None

    VALID_CONNECTORS = {'CCS2', 'Type2', 'CHAdeMO', 'AC', 'DC'}
    VALID_STATUSES = {'Available', 'Charging', 'Offline', 'Maintenance'}

    if args.get('station_id'):
        try:
            station_id = int(args['station_id'])
        except (ValueError, TypeError):
            errors.append('station_id must be an integer')

    if connector_type and connector_type not in VALID_CONNECTORS:
        errors.append(f'connector_type must be one of: {", ".join(VALID_CONNECTORS)}')
        connector_type = None

    if status and status not in VALID_STATUSES:
        errors.append(f'status must be one of: {", ".join(VALID_STATUSES)}')
        status = None

    if args.get('min_power'):
        try:
            min_power = float(args['min_power'])
            if min_power < 0:
                errors.append('min_power must be a positive number')
                min_power = None
        except (ValueError, TypeError):
            errors.append('min_power must be a number')

    try:
        limit = int(args.get('limit', 20))
        if limit < 1 or limit > 100:
            limit = 20
    except (ValueError, TypeError):
        limit = 20
    try:
        offset = int(args.get('offset', 0))
        if offset < 0:
            offset = 0
    except (ValueError, TypeError):
        offset = 0

    return {
        'station_id': station_id, 'connector_type': connector_type,
        'status': status, 'min_power': min_power, 'limit': limit, 'offset': offset
    }, errors
