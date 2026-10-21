"""Tests for configuration loading."""

from backend.app.core.config import settings


def test_settings_loaded() -> None:
    """Verify application configuration has correct defaults and parsed values."""
    assert settings.PROJECT_NAME == "Coffiko API"
    assert settings.API_V1_PREFIX == "/api/v1"
    assert isinstance(settings.CORS_ORIGINS, list)
    assert len(settings.CORS_ORIGINS) > 0
    assert settings.SPARK_MASTER == "local[*]"
