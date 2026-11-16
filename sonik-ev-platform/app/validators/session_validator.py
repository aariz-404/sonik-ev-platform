VALID_STATUSES = {'Created', 'Active', 'Completed', 'Cancelled', 'Failed'}

def validate_create_session(data):
    errors = []
    charger_id = data.get('charger_id')
    if charger_id is None:
        errors.append('charger_id is required')
        return {}, errors
    try:
        charger_id = int(charger_id)
        if charger_id < 1:
            errors.append('charger_id must be a positive integer')
    except (ValueError, TypeError):
        errors.append('charger_id must be a positive integer')
        return {}, errors
    return {'charger_id': charger_id}, errors

def validate_update_session(data):
    errors = []
    status = data.get('status')
    if not status:
        errors.append('status is required')
        return {}, errors
    if status not in VALID_STATUSES:
        errors.append(f'status must be one of: {", ".join(VALID_STATUSES)}')
        return {}, errors
    energy_kwh = None
    if 'energy_kwh' in data:
        try:
            energy_kwh = float(data['energy_kwh'])
            if energy_kwh < 0:
                errors.append('energy_kwh must be a non-negative number')
        except (ValueError, TypeError):
            errors.append('energy_kwh must be a number')
    if status == 'Completed' and (energy_kwh is None or energy_kwh <= 0):
        errors.append('energy_kwh is required and must be positive when status is Completed')
    return {'status': status, 'energy_kwh': energy_kwh}, errors
