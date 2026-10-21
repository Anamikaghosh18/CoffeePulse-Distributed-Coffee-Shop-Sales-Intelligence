"""API v1 Central Router."""

from fastapi import APIRouter
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.analytics import router as analytics_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router, prefix="")
api_v1_router.include_router(analytics_router)
