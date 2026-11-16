from app.extensions import db
from app.models.charging_session import ChargingSession

def get_sessions(user_id=None, role=None, charger_id=None, status=None, limit=20, offset=0):
    query = ChargingSession.query
    # Drivers see only their own sessions
    if role == 'DRIVER' and user_id:
        query = query.filter(ChargingSession.user_id == user_id)
    elif user_id and role not in ('ADMIN', 'OPERATOR', 'SUPPORT'):
        query = query.filter(ChargingSession.user_id == user_id)
    if charger_id:
        query = query.filter(ChargingSession.charger_id == charger_id)
    if status:
        query = query.filter(ChargingSession.status == status)
    total = query.count()
    sessions = query.order_by(ChargingSession.created_at.desc()).offset(offset).limit(limit).all()
    return sessions, total

def get_session_by_id(session_id):
    return ChargingSession.query.get(session_id)

def create_session(user_id, charger_id):
    session = ChargingSession(user_id=user_id, charger_id=charger_id, status='Created', energy_kwh=0)
    db.session.add(session)
    db.session.commit()
    return session

def update_session(session, **kwargs):
    for k, v in kwargs.items():
        setattr(session, k, v)
    db.session.commit()
    return session
