"""Tests for the /health and /ready endpoints."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["status"] == "ok"
    assert "RapidOCR" in data["engine"]
    assert data["version"] == "1.0.0"
    assert data["ready"] is True
    # Ensure sensitive info is not exposed
    assert "secret" not in data
    assert "path" not in data


def test_ready_check_returns_ok():
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["status"] == "ok"
    assert data["ready"] is True
