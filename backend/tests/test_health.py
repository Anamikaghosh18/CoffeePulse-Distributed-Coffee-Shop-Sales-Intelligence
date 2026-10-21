"""Tests for health check endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app
from backend.app.services.spark_manager import spark_manager


@pytest.mark.anyio
async def test_health_endpoint() -> None:
    """Verify that /health responds 200 with valid schema and does NOT start Spark."""
    # Ensure Spark is not running before test
    assert not spark_manager.is_active()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["healthy", "degraded"]
        assert "services" in data
        assert data["services"]["api"]["status"] == "healthy"
        assert data["services"]["spark"]["status"] == "idle"

    # Verify Spark was NOT started as a side-effect
    assert not spark_manager.is_active()


@pytest.mark.anyio
async def test_api_v1_health_endpoint() -> None:
    """Verify that /api/v1/health responds 200."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["app_name"] == "Coffiko API"
