"""Health check API endpoints."""

from pathlib import Path
from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.schemas.health import HealthCheckResponse, ServiceHealthStatus
from backend.app.services.spark_manager import spark_manager

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Application Health Check",
    description="Returns system operational status across backend, Spark runtime state, and storage accessibility.",
)
async def get_health_status() -> HealthCheckResponse:
    """Perform non-blocking health check.

    Verifies API availability and directory paths without spinning up PySpark.
    """
    # 1. API status
    api_status = ServiceHealthStatus(
        status="healthy", details="FastAPI runtime active and accepting requests"
    )

    # 2. Spark lazy status
    spark_info = spark_manager.get_status()
    spark_status = ServiceHealthStatus(
        status=spark_info["status"],
        details=f"State: {spark_info['state']} ({spark_info.get('details', 'Engine ready')})",
    )

    # 3. Storage checks
    raw_path = Path(settings.DATA_RAW_DIR)
    processed_path = Path(settings.DATA_PROCESSED_DIR)
    storage_accessible = raw_path.exists() and processed_path.exists()

    storage_status = ServiceHealthStatus(
        status="healthy" if storage_accessible else "degraded",
        details="Data directories accessible"
        if storage_accessible
        else "One or more data directories missing",
    )

    overall_status = "healthy"
    if storage_status.status == "degraded":
        overall_status = "degraded"

    return HealthCheckResponse(
        status=overall_status,
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        services={
            "api": api_status,
            "spark": spark_status,
            "storage": storage_status,
        },
    )
