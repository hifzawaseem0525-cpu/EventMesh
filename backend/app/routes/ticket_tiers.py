from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.models.ticket_tier import TicketTier
from app.models.user import User
from app.schemas.ticket_tier import TicketTierCreate, TicketTierResponse
from app.utils.dependencies import get_current_organizer


router = APIRouter(
    prefix="/ticket-tiers",
    tags=["Ticket Tiers"],
)


def _get_owned_event(
    event_id: int,
    current_user: User,
    db: Session,
) -> Event:
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if (
        event.organizer_id != current_user.id
        and current_user.role != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this event",
        )

    return event


def _get_owned_tier(
    tier_id: int,
    current_user: User,
    db: Session,
) -> TicketTier:
    tier = db.query(TicketTier).filter(
        TicketTier.id == tier_id
    ).first()

    if not tier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket tier not found",
        )

    _get_owned_event(
        tier.event_id,
        current_user,
        db,
    )

    return tier


@router.get(
    "/event/{event_id}",
    response_model=list[TicketTierResponse],
)
def get_ticket_tiers_for_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return (
        db.query(TicketTier)
        .filter(TicketTier.event_id == event_id)
        .all()
    )


@router.post(
    "/",
    response_model=TicketTierResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket_tier(
    tier_data: TicketTierCreate,
    current_user: User = Depends(get_current_organizer),
    db: Session = Depends(get_db),
):
    _get_owned_event(
        tier_data.event_id,
        current_user,
        db,
    )

    new_tier = TicketTier(
        event_id=tier_data.event_id,
        name=tier_data.name,
        price=tier_data.price,
        available_quantity=tier_data.available_quantity,
    )

    db.add(new_tier)
    db.commit()
    db.refresh(new_tier)

    return new_tier


@router.put(
    "/{tier_id}",
    response_model=TicketTierResponse,
)
def update_ticket_tier(
    tier_id: int,
    tier_data: TicketTierCreate,
    current_user: User = Depends(get_current_organizer),
    db: Session = Depends(get_db),
):
    tier = _get_owned_tier(
        tier_id,
        current_user,
        db,
    )

    if tier_data.event_id != tier.event_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot move a ticket tier to a different event",
        )

    tier.name = tier_data.name
    tier.price = tier_data.price
    tier.available_quantity = tier_data.available_quantity

    db.commit()
    db.refresh(tier)

    return tier


@router.delete(
    "/{tier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_ticket_tier(
    tier_id: int,
    current_user: User = Depends(get_current_organizer),
    db: Session = Depends(get_db),
):
    tier = _get_owned_tier(
        tier_id,
        current_user,
        db,
    )

    db.delete(tier)
    db.commit()

    return None