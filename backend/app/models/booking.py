from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    String,
    Numeric,
    CheckConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    __table_args__ = (
        CheckConstraint(
            "quantity > 0",
            name="ck_booking_quantity_positive",
        ),
    )

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    event_id = Column(
        Integer,
        ForeignKey("events.id"),
        nullable=False,
        index=True,
    )

    ticket_tier_id = Column(
        Integer,
        ForeignKey("ticket_tiers.id"),
        nullable=False,
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=1,
    )

    price_per_ticket = Column(
        Numeric(10, 2),
        nullable=False,
    )

    total_amount = Column(
        Numeric(10, 2),
        nullable=False,
    )

    status = Column(
        String(20),
        nullable=False,
        default="confirmed",
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    user = relationship("User")
    event = relationship("Event")
    ticket_tier = relationship("TicketTier")