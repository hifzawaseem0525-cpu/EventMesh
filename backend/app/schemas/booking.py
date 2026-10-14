
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


BookingStatus = Literal["confirmed", "cancelled"]


class BookingCreate(BaseModel):
    ticket_tier_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=10)


class BookingEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    category: str | None = None
    location: str | None = None
    date: datetime
    price: Decimal
    image: str | None = None


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    event_id: int
    ticket_tier_id: int
    quantity: int
    price_per_ticket: Decimal
    total_amount: Decimal
    status: BookingStatus
    created_at: datetime
    event: BookingEventResponse
