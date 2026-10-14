
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi.testclient import TestClient

from app.models.booking import Booking
from app.models.event import Event
from app.models.ticket import Ticket
from app.models.ticket_tier import TicketTier
from app.models.user import User
from app.utils.security import create_access_token


def create_user(db_session, email="student@example.com", role="student"):
    user = User(
        name="Test User",
        email=email,
        hashed_password="not-used-for-these-tests",
        role=role,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(user.id)
    return token, user.id


def create_event(db_session, organizer_id, status="published", days_from_now=30):
    event = Event(
        title="Booking Test Event",
        description="Event for automated booking tests",
        category="Technology",
        location="Bengaluru",
        date=datetime.now(timezone.utc).replace(tzinfo=None)
        + timedelta(days=days_from_now),
        price=100.0,
        status=status,
        organizer_id=organizer_id,
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
    return event.id


def create_ticket_tier(
    db_session,
    event_id,
    quantity=10,
    price=Decimal("250.00"),
):
    tier = TicketTier(
        event_id=event_id,
        name="General Admission",
        price=price,
        available_quantity=quantity,
    )
    db_session.add(tier)
    db_session.commit()
    db_session.refresh(tier)
    return tier.id


def prepare_booking(db_session, event_status="published", stock=10):
    _, organizer_id = create_user(
        db_session,
        email="organizer@example.com",
        role="organizer",
    )
    event_id = create_event(
        db_session,
        organizer_id,
        status=event_status,
    )
    tier_id = create_ticket_tier(
        db_session,
        event_id,
        quantity=stock,
    )
    student_token, student_id = create_user(db_session)
    return student_token, student_id, event_id, tier_id


def test_student_can_book_tickets(client: TestClient, db_session):
    token, student_id, event_id, tier_id = prepare_booking(db_session)

    response = client.post(
        "/bookings/",
        headers={"Authorization": f"Bearer {token}"},
        json={"ticket_tier_id": tier_id, "quantity": 2},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == student_id
    assert data["event_id"] == event_id
    assert data["ticket_tier_id"] == tier_id
    assert data["quantity"] == 2
    assert Decimal(str(data["price_per_ticket"])) == Decimal("250.00")
    assert Decimal(str(data["total_amount"])) == Decimal("500.00")
    assert data["status"] == "confirmed"


def test_booking_reduces_available_ticket_quantity(
    client: TestClient, db_session
):
    token, _, _, tier_id = prepare_booking(db_session, stock=10)

    response = client.post(
        "/bookings/",
        headers={"Authorization": f"Bearer {token}"},
        json={"ticket_tier_id": tier_id, "quantity": 3},
    )

    assert response.status_code == 201

    tier = db_session.get(TicketTier, tier_id)
    assert tier.available_quantity == 7


def test_booking_generates_one_ticket_per_unit(
    client: TestClient, db_session
):
    token, _, _, tier_id = prepare_booking(db_session)

    response = client.post(
        "/bookings/",
        headers={"Authorization": f"Bearer {token}"},
        json={"ticket_tier_id": tier_id, "quantity": 3},
    )

    assert response.status_code == 201

    booking_id = response.json()["id"]
    tickets = (
        db_session.query(Ticket)
        .filter(Ticket.booking_id == booking_id)
        .order_by(Ticket.sequence)
        .all()
    )

    assert len(tickets) == 3
    assert [ticket.sequence for ticket in tickets] == [1, 2, 3]
    assert all(ticket.status == "active" for ticket in tickets)
    assert len({ticket.ticket_code for ticket in tickets}) == 3


def test_booking_fails_when_stock_is_insufficient(
    client: TestClient, db_session
):
    token, _, _, tier_id = prepare_booking(db_session, stock=2)

    response = client.post(
        "/bookings/",
        headers={"Authorization": f"Bearer {token}"},
        json={"ticket_tier_id": tier_id, "quantity": 3},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Not enough tickets available"

    tier = db_session.get(TicketTier, tier_id)
    assert tier.available_quantity == 2
    assert db_session.query(Booking).count() == 0
    assert db_session.query(Ticket).count() == 0


def test_booking_draft_event_is_rejected(
    client: TestClient, db_session
):
    token, _, _, tier_id = prepare_booking(
        db_session,
        event_status="draft",
    )

    response = client.post(
        "/bookings/",
        headers={"Authorization": f"Bearer {token}"},
        json={"ticket_tier_id": tier_id, "quantity": 1},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "This event is not available for booking"
    )


def test_booking_nonexistent_ticket_tier_is_rejected(
    client: TestClient, db_session
):
    token, _ = create_user(db_session)

    response = client.post(
        "/bookings/",
        headers={"Authorization": f"Bearer {token}"},
        json={"ticket_tier_id": 999, "quantity": 1},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Ticket tier not found"


def test_booking_quantity_above_limit_is_rejected(
    client: TestClient, db_session
):
    token, _, _, tier_id = prepare_booking(db_session)

    response = client.post(
        "/bookings/",
        headers={"Authorization": f"Bearer {token}"},
        json={"ticket_tier_id": tier_id, "quantity": 11},
    )

    assert response.status_code == 422


def test_booking_requires_authentication(client: TestClient, db_session):
    _, _, _, tier_id = prepare_booking(db_session)

    response = client.post(
        "/bookings/",
        json={"ticket_tier_id": tier_id, "quantity": 1},
    )

    assert response.status_code == 401
