
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.event import Event
from app.models.ticket import Ticket
from app.models.ticket_tier import TicketTier
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


@router.post(
    "/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Find the selected ticket tier (row-locked on PostgreSQL/MySQL)
    ticket_tier = (
        db.query(TicketTier)
        .filter(TicketTier.id == booking_data.ticket_tier_id)
        .with_for_update()
        .first()
    )

    if not ticket_tier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket tier not found",
        )

    # Find the event belonging to the ticket tier
    event = (
        db.query(Event)
        .filter(Event.id == ticket_tier.event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Only published events can be booked
    if event.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event is not available for booking",
        )

    # Prevent booking after the event has started.
    # Event dates currently use naive UTC datetimes.
    current_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    if event.date <= current_utc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event has already started",
        )

    # Check ticket availability
    if ticket_tier.available_quantity < booking_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough tickets available",
        )

    # Reserve tickets
    ticket_tier.available_quantity -= booking_data.quantity

    # Snapshot current ticket price
    price_per_ticket = ticket_tier.price
    total_amount = price_per_ticket * booking_data.quantity

    # Create booking
    new_booking = Booking(
        user_id=current_user.id,
        event_id=event.id,
        ticket_tier_id=ticket_tier.id,
        quantity=booking_data.quantity,
        price_per_ticket=price_per_ticket,
        total_amount=total_amount,
        status="confirmed",
    )

    db.add(new_booking)
    db.flush()

    # Create one ticket for each booked unit
    for sequence in range(1, booking_data.quantity + 1):
        new_ticket = Ticket(
            booking_id=new_booking.id,
            sequence=sequence,
            ticket_code=uuid.uuid4().hex,
            status="active",
        )

        db.add(new_ticket)

    db.commit()
    db.refresh(new_booking)

    return new_booking


@router.get(
    "/me",
    response_model=list[BookingResponse],
)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    return bookings
