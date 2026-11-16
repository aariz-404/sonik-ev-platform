from datetime import datetime
from app.extensions import db


class Charger(db.Model):
    __tablename__ = 'chargers'

    charger_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    station_id = db.Column(
        db.Integer,
        db.ForeignKey('stations.station_id'),
        nullable=False,
    )
    connector_type = db.Column(db.String(20), nullable=False)
    # Allowed values: CCS2, Type2, CHAdeMO, AC, DC  — validated in service layer
    power_kw = db.Column(db.Numeric(8, 2), nullable=False)
    # Allowed statuses: Available, Charging, Offline, Maintenance — validated in service layer
    status = db.Column(db.String(20), nullable=False, default='Available')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    sessions = db.relationship(
        'ChargingSession',
        backref='charger',
        lazy='dynamic',
    )

    def to_dict(self) -> dict:
        return {
            'charger_id': self.charger_id,
            'station_id': self.station_id,
            'connector_type': self.connector_type,
            'power_kw': float(self.power_kw) if self.power_kw is not None else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_dict_with_station(self) -> dict:
        """Return charger dict with nested station info."""
        data = self.to_dict()
        data['station'] = self.station.to_dict() if self.station else None
        return data

    def __repr__(self) -> str:
        return (
            f'<Charger id={self.charger_id} connector={self.connector_type!r} '
            f'status={self.status!r} station_id={self.station_id}>'
        )
