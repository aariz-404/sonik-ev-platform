from app.extensions import db
from app.models.station import Station
from app.models.charger import Charger
from app.models.charging_session import ChargingSession
from app.models.service_ticket import ServiceTicket
from sqlalchemy import func, cast, Date
from datetime import datetime, date

def get_summary_stats():
    today = date.today()
    
    total_stations = db.session.query(func.count(Station.station_id)).scalar() or 0
    total_chargers = db.session.query(func.count(Charger.charger_id)).scalar() or 0
    available_chargers = db.session.query(func.count(Charger.charger_id)).filter(Charger.status == 'Available').scalar() or 0
    charging_chargers = db.session.query(func.count(Charger.charger_id)).filter(Charger.status == 'Charging').scalar() or 0
    offline_chargers = db.session.query(func.count(Charger.charger_id)).filter(Charger.status == 'Offline').scalar() or 0
    maintenance_chargers = db.session.query(func.count(Charger.charger_id)).filter(Charger.status == 'Maintenance').scalar() or 0
    active_sessions = db.session.query(func.count(ChargingSession.session_id)).filter(ChargingSession.status == 'Active').scalar() or 0
    open_tickets = db.session.query(func.count(ServiceTicket.ticket_id)).filter(ServiceTicket.status.in_(['Open', 'InProgress'])).scalar() or 0
    
    energy_today_result = db.session.query(func.sum(ChargingSession.energy_kwh)).filter(
        ChargingSession.status == 'Completed',
        func.date(ChargingSession.end_time) == today
    ).scalar()
    total_energy_today = float(energy_today_result) if energy_today_result else 0.0
    
    energy_all_time_result = db.session.query(func.sum(ChargingSession.energy_kwh)).filter(
        ChargingSession.status == 'Completed'
    ).scalar()
    total_energy_all_time = float(energy_all_time_result) if energy_all_time_result else 0.0
    
    completed_today = db.session.query(func.count(ChargingSession.session_id)).filter(
        ChargingSession.status == 'Completed',
        func.date(ChargingSession.end_time) == today
    ).scalar() or 0
    
    return {
        'total_stations': total_stations,
        'total_chargers': total_chargers,
        'available_chargers': available_chargers,
        'charging_chargers': charging_chargers,
        'offline_chargers': offline_chargers,
        'maintenance_chargers': maintenance_chargers,
        'active_sessions': active_sessions,
        'open_tickets': open_tickets,
        'total_energy_today_kwh': round(total_energy_today, 4),
        'total_energy_all_time_kwh': round(total_energy_all_time, 4),
        'completed_sessions_today': completed_today,
    }

def get_recent_activity(limit=10):
    from app.models.user import User
    sessions = db.session.query(ChargingSession).order_by(
        ChargingSession.created_at.desc()
    ).limit(limit).all()
    
    result = []
    for s in sessions:
        item = s.to_dict()
        # Add user name
        user = db.session.query(User).get(s.user_id)
        item['user_name'] = user.name if user else 'Unknown'
        # Add charger and station info
        charger = db.session.query(Charger).get(s.charger_id)
        if charger:
            item['charger_connector'] = charger.connector_type
            item['charger_power_kw'] = float(charger.power_kw)
            station = db.session.query(Station).get(charger.station_id)
            if station:
                item['station_name'] = station.name
                item['station_city'] = station.city
            else:
                item['station_name'] = None
                item['station_city'] = None
        else:
            item['charger_connector'] = None
            item['charger_power_kw'] = None
            item['station_name'] = None
            item['station_city'] = None
        result.append(item)
    return result
