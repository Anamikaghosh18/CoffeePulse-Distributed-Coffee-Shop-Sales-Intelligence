"""FastAPI application entrypoint for CoffeePulse."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1.health import router as root_health_router
from backend.app.api.v1.router import api_v1_router
from backend.app.core.config import settings
from backend.app.core.exceptions import (
    AppException,
    app_exception_handler,
    generic_exception_handler,
)
from backend.app.core.logging import logger
from backend.app.services.spark_manager import spark_manager


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager for startup and shutdown routines."""
    logger.info(
        "Starting %s (v%s) in [%s] environment...",
        settings.PROJECT_NAME,
        settings.VERSION,
        settings.ENVIRONMENT,
    )
    yield
    logger.info("Shutting down %s...", settings.PROJECT_NAME)
    # Ensure Spark session is cleanly terminated if active
    if spark_manager.is_active():
        spark_manager.stop_session()
    logger.info("Application shutdown complete.")


def create_app() -> FastAPI:
    """Initialize and configure the FastAPI application."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Coffiko - Distributed Coffee Shop Sales Intelligence API",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register Exception Handlers
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    # Mount API v1 router
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    # Also mount direct /health for convenience and Docker / orchestrator probes
    app.include_router(root_health_router, prefix="")

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG,
    )
