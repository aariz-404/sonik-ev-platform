from datetime import datetime
from app.extensions import db


class ChargingSession(db.Model):
    __tablename__ = 'charging_sessions'

    session_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.user_id'),
        nullable=False,
    )
    charger_id = db.Column(
        db.Integer,
        db.ForeignKey('chargers.charger_id'),
        nullable=False,
    )
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    energy_kwh = db.Column(db.Numeric(10, 4), nullable=False, default=0)
    # Allowed statuses: Created, Active, Completed, Cancelled — validated in service layer
    status = db.Column(db.String(20), nullable=False, default='Created')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    user = db.relationship('User', backref='sessions')

    def to_dict(self) -> dict:
        return {
            'session_id': self.session_id,
            'user_id': self.user_id,
            'charger_id': self.charger_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'energy_kwh': float(self.energy_kwh) if self.energy_kwh is not None else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return (
            f'<ChargingSession id={self.session_id} user_id={self.user_id} '
            f'charger_id={self.charger_id} status={self.status!r}>'
        )
