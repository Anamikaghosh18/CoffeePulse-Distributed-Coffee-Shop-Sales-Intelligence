"""Health check response models."""

from datetime import datetime, timezone
from typing import Dict, Literal, Optional
from pydantic import BaseModel, Field


class ServiceHealthStatus(BaseModel):
    """Status details for individual subsystem components."""

    status: Literal["healthy", "degraded", "idle", "unhealthy"] = Field(
        ..., description="Current operational state of component"
    )
    details: Optional[str] = Field(
        default=None, description="Additional context or diagnostics"
    )


class HealthCheckResponse(BaseModel):
    """System health check response."""

    status: Literal["healthy", "degraded", "unhealthy"] = Field(
        ..., description="Overall health indicator"
    )
    app_name: str = Field(..., description="Application name")
    version: str = Field(..., description="Application version")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp of the check",
    )
    environment: str = Field(..., description="Deployment environment (e.g. development)")
    services: Dict[str, ServiceHealthStatus] = Field(
        ..., description="Status breakdown of subcomponents"
    )
