"""Application configuration using Pydantic Settings."""

import os
from pathlib import Path
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable loading."""

    # Project metadata
    PROJECT_NAME: str = "Coffiko API"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Server configuration
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    API_V1_PREFIX: str = "/api/v1"

    # CORS configuration
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Storage paths (relative to workspace root or absolute)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    DATA_RAW_DIR: str = "./data/raw"
    DATA_PROCESSED_DIR: str = "./data/processed"
    ARTIFACTS_MODELS_DIR: str = "./artifacts/models"

    # Spark cluster execution mode (Local default for college dev environment)
    SPARK_APP_NAME: str = "CoffeePulseBackend"
    SPARK_MASTER: str = "local[*]"
    SPARK_DRIVER_MEMORY: str = "2g"
    SPARK_LOG_LEVEL: str = "WARN"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                # JSON list format
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
