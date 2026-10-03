from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.models.user import User
from app.schemas.event import EventCreate, EventResponse
from app.utils.dependencies import get_current_organizer

router = APIRouter(
    prefix="/events",
    tags=["Events"],
)


# -------------------------
# Public: Get all events
# -------------------------
@router.get("/", response_model=list[EventResponse])
def get_events(
    db: Session = Depends(get_db),
):
    return (
        db.query(Event)
        .filter(Event.status == "published")
        .all()
    )


# -------------------------
# Public: Get one event
# -------------------------
@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = (
        db.query(Event)
        .filter(
            Event.id == event_id,
            Event.status == "published",
        )
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return event


# -------------------------
# Organizer: Create event
# -------------------------
@router.post(
    "/",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    new_event = Event(
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        location=event_data.location,
        date=event_data.date,
        price=event_data.price,
        image=event_data.image,
        status=event_data.status,
        organizer_id=current_user.id,
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


# -------------------------
# Helper: Get owned event
# -------------------------
def _get_owned_event(
    event_id: int,
    db: Session,
    current_user: User,
):
    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Organizers can manage only their own events.
    # Admins can manage any event.
    if (
        event.organizer_id != current_user.id
        and current_user.role != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage this event",
        )

    return event


# -------------------------
# Organizer: Update event
# -------------------------
@router.put(
    "/{event_id}",
    response_model=EventResponse,
)
def update_event(
    event_id: int,
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    event = _get_owned_event(
        event_id,
        db,
        current_user,
    )

    event.title = event_data.title
    event.description = event_data.description
    event.category = event_data.category
    event.location = event_data.location
    event.date = event_data.date
    event.price = event_data.price
    event.image = event_data.image
    event.status = event_data.status

    db.commit()
    db.refresh(event)

    return event


# -------------------------
# Organizer: Delete event
# -------------------------
@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    event = _get_owned_event(
        event_id,
        db,
        current_user,
    )

    db.delete(event)
    db.commit()

    return None