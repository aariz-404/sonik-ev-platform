from app.extensions import db
from app.models.station import Station
from sqlalchemy import func

def get_all_stations(city=None, search=None, limit=20, offset=0):
    query = Station.query
    if city:
        query = query.filter(func.lower(Station.city) == city.lower())
    if search:
        like = f'%{search}%'
        query = query.filter(
            db.or_(Station.name.ilike(like), Station.address.ilike(like))
        )
    total = query.count()
    stations = query.order_by(Station.station_id).offset(offset).limit(limit).all()
    return stations, total

def get_station_by_id(station_id):
    return Station.query.get(station_id)

def create_station(data):
    station = Station(**data)
    db.session.add(station)
    db.session.commit()
    return station

def update_station(station_id, data):
    station = Station.query.get(station_id)
    if not station:
        return None
    for k, v in data.items():
        setattr(station, k, v)
    db.session.commit()
    return station
