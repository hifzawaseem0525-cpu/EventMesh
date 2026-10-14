
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.models.event import Event
from app.models.user import User
from app.utils.security import create_access_token


def create_user(db_session, role="organizer", email="organizer@example.com"):
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
    return create_access_token(user.id), user.id


def create_event(db_session, organizer_id, status="published"):
    event = Event(
        title="Test Tech Meetup",
        description="Test event",
        category="Technology",
        location="Bengaluru",
        date=datetime.now(timezone.utc).replace(tzinfo=None)
        + timedelta(days=30),
        price=100.0,
        status=status,
        organizer_id=organizer_id,
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
    return event.id


def tier_payload(event_id, **overrides):
    payload = {
        "event_id": event_id,
        "name": "General Admission",
        "price": 250,
        "available_quantity": 50,
    }
    payload.update(overrides)
    return payload


def test_organizer_can_create_ticket_tier(client: TestClient, db_session):
    token, user_id = create_user(db_session)
    event_id = create_event(db_session, user_id)

    response = client.post(
        "/ticket-tiers/",
        headers={"Authorization": f"Bearer {token}"},
        json=tier_payload(event_id),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["event_id"] == event_id
    assert data["name"] == "General Admission"
    assert float(data["price"]) == 250.0
    assert data["available_quantity"] == 50


def test_student_cannot_create_ticket_tier(client: TestClient, db_session):
    token, _ = create_user(
        db_session,
        role="student",
        email="student@example.com",
    )

    response = client.post(
        "/ticket-tiers/",
        headers={"Authorization": f"Bearer {token}"},
        json=tier_payload(1),
    )

    assert response.status_code == 403


def test_ticket_tier_for_missing_event_is_rejected(
    client: TestClient, db_session
):
    token, _ = create_user(db_session)

    response = client.post(
        "/ticket-tiers/",
        headers={"Authorization": f"Bearer {token}"},
        json=tier_payload(999),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Event not found"


def test_negative_ticket_price_is_rejected(
    client: TestClient, db_session
):
    token, user_id = create_user(db_session)
    event_id = create_event(db_session, user_id)

    response = client.post(
        "/ticket-tiers/",
        headers={"Authorization": f"Bearer {token}"},
        json=tier_payload(event_id, price=-1),
    )

    assert response.status_code == 422


def test_negative_ticket_quantity_is_rejected(
    client: TestClient, db_session
):
    token, user_id = create_user(db_session)
    event_id = create_event(db_session, user_id)

    response = client.post(
        "/ticket-tiers/",
        headers={"Authorization": f"Bearer {token}"},
        json=tier_payload(event_id, available_quantity=-1),
    )

    assert response.status_code == 422


def test_organizer_cannot_modify_another_organizers_event(
    client: TestClient, db_session
):
    _, other_user_id = create_user(
        db_session,
        email="other-organizer@example.com",
    )
    event_id = create_event(db_session, other_user_id)

    token, _ = create_user(
        db_session,
        email="second-organizer@example.com",
    )

    response = client.post(
        "/ticket-tiers/",
        headers={"Authorization": f"Bearer {token}"},
        json=tier_payload(event_id),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
        "You do not have permission to modify this event"
    )
