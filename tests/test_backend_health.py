"""End-to-end integration test for backend health check."""

import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app


@pytest.mark.anyio
async def test_root_and_v1_health() -> None:
    """Ensure both /health and /api/v1/health are accessible and report valid system status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        resp1 = await client.get("/health")
        assert resp1.status_code == 200
        assert resp1.json()["status"] in ["healthy", "degraded"]

        resp2 = await client.get("/api/v1/health")
        assert resp2.status_code == 200
        assert resp2.json()["app_name"] == "Coffiko API"
