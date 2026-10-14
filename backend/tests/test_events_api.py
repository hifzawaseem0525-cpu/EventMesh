
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

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

    token = create_access_token(user.id)
    return token


def event_payload(**overrides):
    payload = {
        "title": "Test Tech Meetup",
        "description": "A test event",
        "category": "Technology",
        "location": "Bengaluru",
        "date": (
            datetime.now(timezone.utc) + timedelta(days=30)
        ).isoformat(),
        "price": 100,
        "image": None,
        "status": "published",
    }
    payload.update(overrides)
    return payload


def test_events_list_is_public(client: TestClient):
    response = client.get("/events/")

    assert response.status_code == 200
    assert response.json() == []


def test_student_cannot_create_event(client: TestClient, db_session):
    token = create_user(
        db_session,
        role="student",
        email="student@example.com",
    )

    response = client.post(
        "/events/",
        headers={"Authorization": f"Bearer {token}"},
        json=event_payload(),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Organizer access required"


def test_organizer_can_create_event(client: TestClient, db_session):
    token = create_user(db_session)

    response = client.post(
        "/events/",
        headers={"Authorization": f"Bearer {token}"},
        json=event_payload(),
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Test Tech Meetup"
    assert response.json()["status"] == "published"


def test_event_with_negative_price_is_rejected(
    client: TestClient, db_session
):
    token = create_user(db_session)

    response = client.post(
        "/events/",
        headers={"Authorization": f"Bearer {token}"},
        json=event_payload(price=-10),
    )

    assert response.status_code == 422


def test_invalid_event_status_is_rejected(
    client: TestClient, db_session
):
    token = create_user(db_session)

    response = client.post(
        "/events/",
        headers={"Authorization": f"Bearer {token}"},
        json=event_payload(status="invalid-status"),
    )

    assert response.status_code == 422
