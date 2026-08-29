"""Tests for the /health and /api/version endpoints."""


def test_health_check_returns_200(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert "status" in body
    assert "database" in body


def test_version_endpoint(client):
    response = client.get("/api/version")
    assert response.status_code == 200
    assert "version" in response.json()
