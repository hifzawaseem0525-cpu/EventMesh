from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    price = Column(Float, nullable=False, default=0.0)
    image = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="draft")

    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organizer = relationship("User", backref="events")