from app.extensions import db
from app.models.charger import Charger

def get_all_chargers(station_id=None, connector_type=None, status=None, min_power=None, limit=20, offset=0):
    query = Charger.query
    if station_id:
        query = query.filter(Charger.station_id == station_id)
    if connector_type:
        query = query.filter(Charger.connector_type == connector_type)
    if status:
        query = query.filter(Charger.status == status)
    if min_power is not None:
        query = query.filter(Charger.power_kw >= min_power)
    total = query.count()
    chargers = query.order_by(Charger.charger_id).offset(offset).limit(limit).all()
    return chargers, total

def get_charger_by_id(charger_id):
    return Charger.query.get(charger_id)

def update_charger_status(charger_id, status):
    charger = Charger.query.get(charger_id)
    if not charger:
        return None
    charger.status = status
    db.session.commit()
    return charger
