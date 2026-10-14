
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class TicketTierCreate(BaseModel):
    event_id: int
    name: str = Field(min_length=1, max_length=100)
    price: Decimal = Field(ge=0)
    available_quantity: int = Field(default=0, ge=0)


class TicketTierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    name: str
    price: Decimal
    available_quantity: int
