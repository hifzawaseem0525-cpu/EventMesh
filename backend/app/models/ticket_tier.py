from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class TicketTier(Base):
    __tablename__ = "ticket_tiers"

    __table_args__ = (
        CheckConstraint(
            "price >= 0",
            name="ck_ticket_tier_price_non_negative",
        ),
        CheckConstraint(
            "available_quantity >= 0",
            name="ck_ticket_tier_quantity_non_negative",
        ),
        UniqueConstraint(
            "event_id",
            "name",
            name="uq_ticket_tier_event_name",
        ),
    )

    id = Column(Integer, primary_key=True)
    event_id = Column(
        Integer,
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    available_quantity = Column(
        Integer,
        nullable=False,
        default=0,
    )

    event = relationship("Event", backref="ticket_tiers")