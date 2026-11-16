from app.extensions import db
from app.models.service_ticket import ServiceTicket

def get_tickets(user_id=None, role=None, status=None, priority=None, limit=20, offset=0):
    query = ServiceTicket.query
    if role == 'DRIVER' and user_id:
        query = query.filter(ServiceTicket.user_id == user_id)
    if status:
        query = query.filter(ServiceTicket.status == status)
    if priority:
        query = query.filter(ServiceTicket.priority == priority)
    total = query.count()
    tickets = query.order_by(ServiceTicket.created_at.desc()).offset(offset).limit(limit).all()
    return tickets, total

def get_ticket_by_id(ticket_id):
    return ServiceTicket.query.get(ticket_id)

def create_ticket(data):
    ticket = ServiceTicket(**data)
    db.session.add(ticket)
    db.session.commit()
    return ticket

def update_ticket(ticket, **kwargs):
    for k, v in kwargs.items():
        setattr(ticket, k, v)
    db.session.commit()
    return ticket
