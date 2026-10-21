"""Lazy Spark session manager for FastAPI backend.

Ensures Spark is NOT started during module import or routine health checks,
preventing slow API boots and unnecessary memory consumption.
"""

import os
import sys
from pathlib import Path
from typing import Any, Dict, Optional
from backend.app.core.config import settings
from backend.app.core.logging import logger

# PySpark imports are deferred to avoid import overhead if not used


class SparkManager:
    """Manages the lifecycle of a PySpark session lazily."""

    def __init__(self) -> None:
        self._spark_session: Optional[Any] = None
        self._initialization_error: Optional[str] = None

    def is_active(self) -> bool:
        """Check if SparkSession is currently active without initiating one."""
        return self._spark_session is not None

    def get_status(self) -> Dict[str, Any]:
        """Return high-level Spark status without starting the engine."""
        if self._spark_session is not None:
            return {
                "status": "healthy",
                "state": "active",
                "app_name": self._spark_session.sparkContext.appName,
                "master": self._spark_session.sparkContext.master,
                "version": self._spark_session.version,
            }
        elif self._initialization_error:
            return {
                "status": "degraded",
                "state": "failed_previously",
                "details": self._initialization_error,
            }
        else:
            return {
                "status": "idle",
                "state": "not_initialized",
                "details": "Spark will be initialized lazily upon first batch processing job",
            }

    def _ensure_windows_java_environment(self) -> None:
        """Verify and set JAVA_HOME fallback on Windows if default is unset or invalid."""
        if sys.platform == "win32":
            current_java = os.environ.get("JAVA_HOME", "")
            if not current_java or not Path(current_java).exists():
                candidates = [
                    Path("C:/Program Files/Java/jdk-21.0.12.1"),
                    Path("C:/Program Files/Java/latest"),
                    Path("C:/Program Files/Java/jdk-21"),
                    Path("C:/Program Files/Java/jdk-17"),
                ]
                for candidate in candidates:
                    if candidate.exists():
                        os.environ["JAVA_HOME"] = str(candidate)
                        logger.info("Auto-configured JAVA_HOME to %s", candidate)
                        break

    def get_or_create_session(self) -> Any:
        """Lazily initialize and return the SparkSession.

        Raises:
            RuntimeError: If Spark cannot be initialized.
        """
        if self._spark_session is not None:
            return self._spark_session

        self._ensure_windows_java_environment()

        try:
            logger.info(
                "Starting local Spark session (app=%s, master=%s)...",
                settings.SPARK_APP_NAME,
                settings.SPARK_MASTER,
            )
            from pyspark.sql import SparkSession

            builder = (
                SparkSession.builder.appName(settings.SPARK_APP_NAME)
                .master(settings.SPARK_MASTER)
                .config("spark.driver.memory", settings.SPARK_DRIVER_MEMORY)
                .config("spark.sql.execution.arrow.pyspark.enabled", "true")
            )

            session = builder.getOrCreate()
            session.sparkContext.setLogLevel(settings.SPARK_LOG_LEVEL)
            self._spark_session = session
            logger.info("Spark session initialized successfully (version %s).", session.version)
            return self._spark_session
        except Exception as exc:
            self._initialization_error = str(exc)
            logger.error("Failed to initialize Spark session: %s", exc)
            raise RuntimeError(f"Could not create Spark session: {exc}") from exc

    def stop_session(self) -> None:
        """Safely terminate the SparkSession if running."""
        if self._spark_session is not None:
            try:
                logger.info("Stopping active Spark session...")
                self._spark_session.stop()
                logger.info("Spark session stopped.")
            except Exception as exc:
                logger.warning("Error stopping Spark session: %s", exc)
            finally:
                self._spark_session = None


# Global singleton instance
spark_manager = SparkManager()
