
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.event import Event
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketCheckIn, TicketResponse
from app.utils.dependencies import get_current_user, get_current_organizer
from app.utils.qr import generate_ticket_qr


router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"],
)


# ---------------------------------------------------------
# GET MY TICKETS
# ---------------------------------------------------------
@router.get(
    "/me",
    response_model=list[TicketResponse],
)
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tickets = (
        db.query(Ticket)
        .join(Booking, Ticket.booking_id == Booking.id)
        .filter(Booking.user_id == current_user.id)
        .order_by(Ticket.created_at.desc())
        .all()
    )

    return tickets


# ---------------------------------------------------------
# GET ONE TICKET
# ---------------------------------------------------------
@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
)
def get_my_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = (
        db.query(Ticket)
        .join(Booking, Ticket.booking_id == Booking.id)
        .filter(
            Ticket.id == ticket_id,
            Booking.user_id == current_user.id,
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    return ticket


# ---------------------------------------------------------
# GET TICKET QR CODE
# ---------------------------------------------------------
@router.get(
    "/{ticket_id}/qr",
)
def get_ticket_qr(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = (
        db.query(Ticket)
        .join(Booking, Ticket.booking_id == Booking.id)
        .filter(
            Ticket.id == ticket_id,
            Booking.user_id == current_user.id,
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    qr_image = generate_ticket_qr(ticket.ticket_code)

    return Response(
        content=qr_image,
        media_type="image/png",
    )


# ---------------------------------------------------------
# CHECK IN TICKET
# ---------------------------------------------------------
@router.post(
    "/check-in",
    response_model=TicketResponse,
)
def check_in_ticket(
    ticket_data: TicketCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_code == ticket_data.ticket_code)
        .with_for_update()
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    booking = (
        db.query(Booking)
        .filter(Booking.id == ticket.booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    event = (
        db.query(Event)
        .filter(Event.id == booking.event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to check in tickets for this event",
        )

    if ticket.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket has already been used or cancelled",
        )

    ticket.status = "used"

    # Store the UTC timestamp as a naive datetime for MySQL DATETIME.
    ticket.checked_in_at = datetime.now(timezone.utc).replace(tzinfo=None)

    db.commit()
    db.refresh(ticket)

    return ticket
