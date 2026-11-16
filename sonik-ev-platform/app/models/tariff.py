from datetime import datetime
from app.extensions import db


class Tariff(db.Model):
    __tablename__ = 'tariffs'

    tariff_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    station_id = db.Column(
        db.Integer,
        db.ForeignKey('stations.station_id'),
        nullable=False,
    )
    rate_per_kwh = db.Column(db.Numeric(8, 4), nullable=False)
    valid_from = db.Column(db.DateTime, nullable=False)
    valid_to = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            'tariff_id': self.tariff_id,
            'station_id': self.station_id,
            'rate_per_kwh': float(self.rate_per_kwh) if self.rate_per_kwh is not None else None,
            'valid_from': self.valid_from.isoformat() if self.valid_from else None,
            'valid_to': self.valid_to.isoformat() if self.valid_to else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return (
            f'<Tariff id={self.tariff_id} station_id={self.station_id} '
            f'rate_per_kwh={self.rate_per_kwh}>'
        )
