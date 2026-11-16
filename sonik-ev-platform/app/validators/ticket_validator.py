VALID_CATEGORIES = {'Hardware', 'Software', 'Billing', 'Connectivity', 'Safety', 'Other'}
VALID_PRIORITIES = {'Low', 'Medium', 'High', 'Critical'}
VALID_STATUSES = {'Open', 'InProgress', 'Resolved', 'Closed'}

def validate_create_ticket(data):
    errors = []
    charger_id = data.get('charger_id')
    if charger_id is None:
        errors.append('charger_id is required')
    else:
        try:
            charger_id = int(charger_id)
        except (ValueError, TypeError):
            errors.append('charger_id must be an integer')
            charger_id = None

    category = data.get('category', '').strip()
    if not category:
        errors.append('category is required')
    elif category not in VALID_CATEGORIES:
        errors.append(f'category must be one of: {", ".join(sorted(VALID_CATEGORIES))}')
        category = None

    description = data.get('description', '').strip()
    if not description:
        errors.append('description is required')
    elif len(description) < 10:
        errors.append('description must be at least 10 characters')

    priority = data.get('priority', 'Medium').strip()
    if priority not in VALID_PRIORITIES:
        errors.append(f'priority must be one of: {", ".join(sorted(VALID_PRIORITIES))}')
        priority = 'Medium'

    if errors:
        return {}, errors
    return {'charger_id': charger_id, 'category': category, 'description': description, 'priority': priority}, []

def validate_update_ticket(data):
    errors = []
    result = {}
    if 'status' in data:
        if data['status'] not in VALID_STATUSES:
            errors.append(f'status must be one of: {", ".join(sorted(VALID_STATUSES))}')
        else:
            result['status'] = data['status']
    if 'priority' in data:
        if data['priority'] not in VALID_PRIORITIES:
            errors.append(f'priority must be one of: {", ".join(sorted(VALID_PRIORITIES))}')
        else:
            result['priority'] = data['priority']
    if 'description' in data:
        desc = data['description'].strip()
        if desc:
            result['description'] = desc
    return result, errors
