"""Exception classes and FastAPI error handlers."""

from typing import Any, Dict, Optional
from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class SparkNotInitializedException(AppException):
    """Raised when an operation requests Spark before it is initialized."""

    def __init__(self, message: str = "Spark session has not been initialized."):
        super().__init__(message=message, status_code=503)


class ResourceNotFoundException(AppException):
    """Raised when a requested resource, dataset, or model is not found."""

    def __init__(self, message: str = "Resource not found."):
        super().__init__(message=message, status_code=404)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle custom application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.message,
                "status_code": exc.status_code,
                "details": exc.details,
            }
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unhandled system exceptions."""
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "message": "Internal server error occurred.",
                "status_code": 500,
                "details": {"type": type(exc).__name__, "description": str(exc)},
            }
        },
    )
