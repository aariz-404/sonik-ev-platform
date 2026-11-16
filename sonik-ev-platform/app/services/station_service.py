from app.repositories import station_repository
from app.models.tariff import Tariff
from app.models.charger import Charger
from app.extensions import db
from datetime import datetime

def get_stations(city=None, search=None, limit=20, offset=0):
    stations, total = station_repository.get_all_stations(city=city, search=search, limit=limit, offset=offset)
    return [s.to_dict() for s in stations], total

def get_station(station_id):
    station = station_repository.get_station_by_id(station_id)
    if not station:
        return None
    data = station.to_dict()
    data['charger_count'] = Charger.query.filter_by(station_id=station_id).count()
    data['available_chargers'] = Charger.query.filter_by(station_id=station_id, status='Available').count()
    tariff = get_current_tariff(station_id)
    data['current_tariff'] = tariff.to_dict() if tariff else None
    return data

def get_current_tariff(station_id):
    now = datetime.utcnow()
    return Tariff.query.filter(
        Tariff.station_id == station_id,
        Tariff.valid_from <= now,
        db.or_(Tariff.valid_to == None, Tariff.valid_to >= now)
    ).first()
