"""Tests for user registration and login."""


def test_register_new_user(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "alice@example.com", "password": "supersecret123"},
    )
    assert response.status_code == 201
    body = response.json()
    assert "access_token" in body
    assert body["user"]["email"] == "alice@example.com"
    # Password must never be echoed back
    assert "password" not in body["user"]


def test_register_duplicate_email_fails(client):
    client.post(
        "/api/auth/register",
        json={"email": "bob@example.com", "password": "supersecret123"},
    )
    response = client.post(
        "/api/auth/register",
        json={"email": "bob@example.com", "password": "anotherpassword"},
    )
    assert response.status_code == 400


def test_login_with_correct_credentials(client):
    client.post(
        "/api/auth/register",
        json={"email": "carol@example.com", "password": "supersecret123"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "carol@example.com", "password": "supersecret123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_with_wrong_password_fails(client):
    client.post(
        "/api/auth/register",
        json={"email": "dave@example.com", "password": "supersecret123"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "dave@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
