from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    __table_args__ = (
        UniqueConstraint(
            "booking_id",
            "sequence",
            name="uq_ticket_booking_sequence",
        ),
    )

    id = Column(Integer, primary_key=True)

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    sequence = Column(
        Integer,
        nullable=False,
        default=1,
    )

    ticket_code = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    status = Column(
        String(20),
        nullable=False,
        default="active",
    )

    checked_in_at = Column(
        DateTime,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    booking = relationship("Booking")