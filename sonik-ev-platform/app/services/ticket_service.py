from app.repositories import ticket_repository
from app.repositories.charger_repository import get_charger_by_id

VALID_CATEGORIES = {'Hardware', 'Software', 'Billing', 'Connectivity', 'Safety', 'Other'}
VALID_PRIORITIES = {'Low', 'Medium', 'High', 'Critical'}
VALID_STATUSES = {'Open', 'InProgress', 'Resolved', 'Closed'}

def get_tickets(current_user, status=None, priority=None, limit=20, offset=0):
    tickets, total = ticket_repository.get_tickets(
        user_id=current_user['user_id'],
        role=current_user['role'],
        status=status,
        priority=priority,
        limit=limit,
        offset=offset
    )
    return [t.to_dict() for t in tickets], total

def create_ticket(current_user, charger_id, category, description, priority='Medium'):
    charger = get_charger_by_id(charger_id)
    if not charger:
        return None, 'Charger not found', 404
    if category not in VALID_CATEGORIES:
        return None, f'Invalid category. Must be one of: {", ".join(VALID_CATEGORIES)}', 422
    if priority not in VALID_PRIORITIES:
        return None, f'Invalid priority. Must be one of: {", ".join(VALID_PRIORITIES)}', 422
    ticket = ticket_repository.create_ticket({
        'user_id': current_user['user_id'],
        'charger_id': charger_id,
        'category': category,
        'description': description.strip(),
        'priority': priority,
        'status': 'Open'
    })
    return ticket.to_dict(), None, None

def update_ticket(ticket_id, data, current_user):
    ticket = ticket_repository.get_ticket_by_id(ticket_id)
    if not ticket:
        return None, 'Ticket not found', 404
    if current_user['role'] == 'DRIVER':
        if ticket.user_id != current_user['user_id']:
            return None, 'You can only update your own tickets', 403
        if ticket.status != 'Open':
            return None, 'Drivers can only edit open tickets', 422
    updates = {}
    if 'status' in data:
        if data['status'] not in VALID_STATUSES:
            return None, f'Invalid status', 422
        updates['status'] = data['status']
    if 'priority' in data:
        if data['priority'] not in VALID_PRIORITIES:
            return None, f'Invalid priority', 422
        updates['priority'] = data['priority']
    if 'description' in data and data['description'].strip():
        updates['description'] = data['description'].strip()
    if not updates:
        return ticket.to_dict(), None, None
    ticket = ticket_repository.update_ticket(ticket, **updates)
    return ticket.to_dict(), None, None
