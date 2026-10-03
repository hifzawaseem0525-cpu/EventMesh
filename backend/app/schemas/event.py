from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


EventStatus = Literal[
    "draft",
    "published",
    "completed",
    "cancelled",
]


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    category: str = Field(min_length=1, max_length=50)
    location: str = Field(min_length=1, max_length=255)
    date: datetime
    price: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )
    image: str | None = None
    status: EventStatus = "draft"


class EventResponse(BaseModel):
    id: int
    title: str
    description: str | None
    category: str
    location: str
    date: datetime
    price: Decimal
    image: str | None
    status: EventStatus
    organizer_id: int

    class Config:
        from_attributes = True