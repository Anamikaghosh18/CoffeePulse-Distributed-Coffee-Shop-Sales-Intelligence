"""Test to verify Spark local execution environment."""

from spark.smoke_test import run_smoke_test


def test_spark_local_smoke() -> None:
    """Validate that PySpark initializes, evaluates a test DataFrame, and shuts down."""
    success = run_smoke_test()
    assert success is True
