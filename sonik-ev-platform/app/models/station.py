from datetime import datetime
from app.extensions import db


class Station(db.Model):
    __tablename__ = 'stations'

    station_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)
    address = db.Column(db.String(300), nullable=False)
    city = db.Column(db.String(100), nullable=False, index=True)
    latitude = db.Column(db.Numeric(10, 8), nullable=False)
    longitude = db.Column(db.Numeric(11, 8), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    chargers = db.relationship(
        'Charger',
        backref='station',
        lazy='dynamic',
        cascade='all, delete-orphan',
    )
    tariffs = db.relationship(
        'Tariff',
        backref='station',
        lazy='dynamic',
        cascade='all, delete-orphan',
    )

    def to_dict(self) -> dict:
        return {
            'station_id': self.station_id,
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'latitude': float(self.latitude) if self.latitude is not None else None,
            'longitude': float(self.longitude) if self.longitude is not None else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f'<Station id={self.station_id} name={self.name!r} city={self.city!r}>'
