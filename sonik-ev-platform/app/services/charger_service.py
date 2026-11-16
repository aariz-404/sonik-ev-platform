from app.repositories import charger_repository

def get_chargers(station_id=None, connector_type=None, status=None, min_power=None, limit=20, offset=0):
    chargers, total = charger_repository.get_all_chargers(
        station_id=station_id, connector_type=connector_type,
        status=status, min_power=min_power, limit=limit, offset=offset
    )
    return [c.to_dict_with_station() for c in chargers], total

def get_charger(charger_id):
    charger = charger_repository.get_charger_by_id(charger_id)
    if not charger:
        return None
    return charger.to_dict_with_station()
