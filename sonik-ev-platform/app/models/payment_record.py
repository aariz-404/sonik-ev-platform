from datetime import datetime
from app.extensions import db


class PaymentRecord(db.Model):
    __tablename__ = 'payment_records'

    payment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(
        db.Integer,
        db.ForeignKey('charging_sessions.session_id'),
        unique=True,
        nullable=False,
    )
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    # Allowed statuses: Pending, Completed, Failed, Refunded — validated in service layer
    payment_status = db.Column(db.String(20), nullable=False, default='Pending')
    reference_code = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    session = db.relationship(
        'ChargingSession',
        backref=db.backref('payment', uselist=False),
    )

    def to_dict(self) -> dict:
        return {
            'payment_id': self.payment_id,
            'session_id': self.session_id,
            'amount': float(self.amount) if self.amount is not None else None,
            'payment_status': self.payment_status,
            'reference_code': self.reference_code,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return (
            f'<PaymentRecord id={self.payment_id} session_id={self.session_id} '
            f'amount={self.amount} status={self.payment_status!r}>'
        )
