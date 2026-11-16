from datetime import datetime
from app.extensions import db


class ServiceTicket(db.Model):
    __tablename__ = 'service_tickets'

    ticket_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
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
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    # Allowed priorities: Low, Medium, High, Critical — validated in service layer
    priority = db.Column(db.String(20), nullable=False, default='Medium')
    # Allowed statuses: Open, InProgress, Resolved, Closed — validated in service layer
    status = db.Column(db.String(20), nullable=False, default='Open')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    user = db.relationship('User', backref='tickets')
    charger = db.relationship('Charger', backref='tickets')

    def to_dict(self) -> dict:
        return {
            'ticket_id': self.ticket_id,
            'user_id': self.user_id,
            'charger_id': self.charger_id,
            'category': self.category,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return (
            f'<ServiceTicket id={self.ticket_id} category={self.category!r} '
            f'priority={self.priority!r} status={self.status!r}>'
        )
