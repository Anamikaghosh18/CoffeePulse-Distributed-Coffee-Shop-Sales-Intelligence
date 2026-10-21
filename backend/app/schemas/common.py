"""Common reusable API schema definitions."""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Detailed error structure."""

    message: str = Field(..., description="Human-readable error description")
    status_code: int = Field(..., description="HTTP status code")
    details: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Diagnostic context"
    )


class ErrorResponse(BaseModel):
    """Standardized error envelope."""

    error: ErrorDetail


class MessageResponse(BaseModel):
    """Simple confirmation or message payload."""

    message: str = Field(..., description="Status or information message")
