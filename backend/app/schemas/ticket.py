# app/schemas/ticket.py

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


TicketStatus = Literal["active", "used", "cancelled"]


class TicketResponse(BaseModel):
    id: int
    booking_id: int
    sequence: int
    ticket_code: str
    status: TicketStatus
    checked_in_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class TicketCheckIn(BaseModel):
    ticket_code: str