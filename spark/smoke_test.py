"""Minimal Spark environment smoke test.

Verifies that PySpark, Java, and local multi-threaded execution
function as expected on this system.
"""

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from spark.session import configure_java_environment, get_spark_session


def run_smoke_test() -> bool:
    """Execute minimal PySpark DataFrame creation and computation."""
    print("=" * 60)
    print("CoffeePulse PySpark Environment Smoke Test")
    print("=" * 60)

    java_home = configure_java_environment()
    print(f"[*] Python Version : {sys.version.split()[0]}")
    print(f"[*] JAVA_HOME      : {java_home}")

    try:
        print("[*] Initializing local Spark session...")
        spark = get_spark_session(app_name="CoffeePulse-SmokeTest", master="local[2]")
        print(f"[+] Spark Version  : {spark.version}")
        print(f"[+] Spark Master   : {spark.sparkContext.master}")

        # Minimal test data
        test_data = [(1, "Espresso", 3.5), (2, "Latte", 4.75), (3, "Cappuccino", 4.5)]
        columns = ["id", "item", "price"]

        df = spark.createDataFrame(test_data, columns)
        record_count = df.count()
        print(f"[+] Test DataFrame created successfully. Row count: {record_count}")

        spark.stop()
        print("[+] Spark session stopped cleanly.")
        print("[+] Smoke test: SUCCESSFUL")
        return True
    except Exception as exc:
        print(f"[-] Smoke test FAILED with error: {exc}")
        return False


if __name__ == "__main__":
    success = run_smoke_test()
    sys.exit(0 if success else 1)
