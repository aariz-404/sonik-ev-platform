from datetime import datetime
from app.extensions import db
from app.repositories import session_repository
from app.repositories.charger_repository import get_charger_by_id
from app.models.payment_record import PaymentRecord
from app.models.tariff import Tariff
import uuid

VALID_TRANSITIONS = {
    'Created': ['Active', 'Cancelled'],
    'Active': ['Completed', 'Cancelled', 'Failed'],
    'Completed': [],
    'Cancelled': [],
    'Failed': [],
}

def create_session(user_id, charger_id):
    charger = get_charger_by_id(charger_id)
    if not charger:
        return None, 'Charger not found', 404
    if charger.status != 'Available':
        return None, f'Charger is not available. Current status: {charger.status}', 409
    session = session_repository.create_session(user_id, charger_id)
    return session.to_dict(), None, None

def get_sessions(current_user, charger_id=None, status=None, limit=20, offset=0):
    sessions, total = session_repository.get_sessions(
        user_id=current_user['user_id'],
        role=current_user['role'],
        charger_id=charger_id,
        status=status,
        limit=limit,
        offset=offset
    )
    return [s.to_dict() for s in sessions], total

def update_session(session_id, new_status, energy_kwh, current_user):
    session = session_repository.get_session_by_id(session_id)
    if not session:
        return None, 'Session not found', 404

    # Access control
    if current_user['role'] == 'DRIVER' and session.user_id != current_user['user_id']:
        return None, 'You can only update your own sessions', 403

    # Validate transition
    allowed = VALID_TRANSITIONS.get(session.status, [])
    if new_status not in allowed:
        return None, f'Invalid transition: {session.status} -> {new_status}. Allowed: {allowed}', 422

    updates = {'status': new_status}
    charger = get_charger_by_id(session.charger_id)

    if new_status == 'Active':
        updates['start_time'] = datetime.utcnow()
        if charger:
            charger.status = 'Charging'
            db.session.add(charger)

    elif new_status == 'Completed':
        if energy_kwh is None or float(energy_kwh) <= 0:
            return None, 'energy_kwh is required and must be positive when completing a session', 422
        updates['end_time'] = datetime.utcnow()
        updates['energy_kwh'] = energy_kwh
        if charger:
            charger.status = 'Available'
            db.session.add(charger)
        # Create mock payment record
        tariff = Tariff.query.filter_by(station_id=charger.station_id if charger else None).first()
        rate = float(tariff.rate_per_kwh) if tariff else 15.0
        amount = round(float(energy_kwh) * rate, 2)
        payment = PaymentRecord(
            session_id=session_id,
            amount=amount,
            payment_status='Completed',
            reference_code=f'SONIK-{uuid.uuid4().hex[:12].upper()}'
        )
        db.session.add(payment)

    elif new_status in ('Cancelled', 'Failed'):
        if not session.end_time:
            updates['end_time'] = datetime.utcnow()
        if charger and charger.status == 'Charging':
            charger.status = 'Available'
            db.session.add(charger)

    session = session_repository.update_session(session, **updates)
    return session.to_dict(), None, None
