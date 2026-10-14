
from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "EventMesh API is running"}


def test_register_user(client: TestClient):
    response = client.post(
        "/auth/register",
        json={
            "name": "Test Student",
            "email": "student@example.com",
            "password": "TestPassword123",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Student"
    assert data["email"] == "student@example.com"
    assert data["role"] == "student"
    assert "hashed_password" not in data


def test_duplicate_registration_is_rejected(client: TestClient):
    payload = {
        "name": "Test Student",
        "email": "student@example.com",
        "password": "TestPassword123",
    }

    first = client.post("/auth/register", json=payload)
    second = client.post("/auth/register", json=payload)

    assert first.status_code == 201
    assert second.status_code == 400
    assert second.json()["detail"] == "Email is already registered"


def test_login_with_invalid_password_is_rejected(client: TestClient):
    client.post(
        "/auth/register",
        json={
            "name": "Test Student",
            "email": "student@example.com",
            "password": "TestPassword123",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "student@example.com",
            "password": "WrongPassword123",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_me_requires_authentication(client: TestClient):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_login_and_get_current_user(client: TestClient):
    client.post(
        "/auth/register",
        json={
            "name": "Test Student",
            "email": "student@example.com",
            "password": "TestPassword123",
        },
    )

    login = client.post(
        "/auth/login",
        json={
            "email": "student@example.com",
            "password": "TestPassword123",
        },
    )

    assert login.status_code == 200
    token = login.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == "student@example.com"
    assert response.json()["name"] == "Test Student"
