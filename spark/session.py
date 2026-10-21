"""Spark Session Configuration and Factory.

Configures a local Apache Spark session for CoffeePulse development.
Handles Windows-specific Java environment setup and lazy lifecycle.
"""

import os
import sys
from pathlib import Path
from typing import Optional
from pyspark.sql import SparkSession


def configure_java_environment() -> Optional[str]:
    java_home = os.environ.get("JAVA_HOME", "")
    if java_home and Path(java_home).exists():
        return java_home

    if sys.platform == "win32":
        candidates = [
            Path("C:/Program Files/Java/jdk-21.0.12.1"),
            Path("C:/Program Files/Java/latest"),
            Path("C:/Program Files/Java/jdk-21"),
            Path("C:/Program Files/Java/jdk-17"),
        ]
        for candidate in candidates:
            if candidate.exists():
                os.environ["JAVA_HOME"] = str(candidate)
                return str(candidate)

    return None


def get_spark_session(
    app_name: str = "CoffeePulseLocal",
    master: str = "local[*]",
    driver_memory: str = "2g",
    log_level: str = "WARN",
) -> SparkSession:
    
    configure_java_environment()

    builder = (
        SparkSession.builder.appName(app_name)
        .master(master)
        .config("spark.driver.memory", driver_memory)
        .config("spark.sql.execution.arrow.pyspark.enabled", "true")
        .config("spark.sql.session.timeZone", "UTC")
    )

    spark = builder.getOrCreate()
    spark.sparkContext.setLogLevel(log_level)
    return spark
