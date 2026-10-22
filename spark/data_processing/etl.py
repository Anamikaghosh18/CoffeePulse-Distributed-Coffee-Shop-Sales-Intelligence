"""PySpark ETL Pipeline for Coffee Shop Daily Sales.

Loads raw transactional sales data, computes daily revenue,
enriches with categorical weather and promotion attributes,
and exports clean daily datasets for MLlib regression and analytics.
"""

import csv
import os
import shutil
import sys
from pathlib import Path
import pyarrow as pa
import pyarrow.parquet as pq
from pyspark.sql.functions import (
    col,
    sum as _sum,
    countDistinct,
    to_date,
    to_timestamp,
    date_format,
    when,
    round as _round,
    desc,
)

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from spark.session import configure_java_environment, get_spark_session


def run_etl(
    input_file: str = "data/raw/coffee_sales_raw.csv",
    output_parquet: str = "data/processed/daily_sales.parquet",
    output_csv: str = "data/processed/daily_sales.csv",
    category_parquet: str = "data/processed/category_sales.parquet",
    category_csv: str = "data/processed/category_sales.csv",
    hourly_parquet: str = "data/processed/hourly_sales.parquet",
    hourly_csv: str = "data/processed/hourly_sales.csv",
) -> int:
    """Run PySpark daily sales aggregation and enrichment.

    Args:
        input_file: Path to raw transactions CSV.
        output_parquet: Destination path for Parquet output.
        output_csv: Destination path for summary CSV.
        category_parquet: Destination path for product-category Parquet output.
        category_csv: Destination path for product-category CSV output.
        hourly_parquet: Destination path for hour-of-day Parquet output.
        hourly_csv: Destination path for hour-of-day CSV output.

    Returns:
        Number of aggregated daily records produced.
    """
    configure_java_environment()
    spark = get_spark_session(app_name="CoffeePulse-DailySalesETL", log_level="ERROR")

    print(f"[*] Reading raw sales transactions with PySpark from: {input_file}")
    df = spark.read.csv(input_file, header=True, inferSchema=True)

    # 1. Calculate transaction revenue using Spark transformations
    df = df.withColumn("revenue", col("transaction_qty") * col("unit_price"))
    df = df.withColumn("date", to_date(col("transaction_date")))
    df = df.withColumn("day_of_week", date_format(col("date"), "EEEE"))
    df = df.withColumn(
        "is_weekend",
        when(col("day_of_week").isin("Saturday", "Sunday"), 1.0).otherwise(0.0),
    )

    # 2. Daily store-level aggregation in Spark
    daily = df.groupBy("date", "store_location", "day_of_week", "is_weekend").agg(
        _round(_sum("revenue"), 2).alias("daily_revenue"),
        countDistinct("transaction_id").alias("total_transactions"),
        _sum("transaction_qty").alias("total_qty"),
    )

    # 3. Enrich with categorical variables: Weather and Promotions
    daily = daily.withColumn("day_of_year", date_format(col("date"), "D").cast("int"))
    daily = daily.withColumn(
        "weather",
        when(col("day_of_year") % 7 == 0, "Rainy")
        .when(col("day_of_year") % 11 == 0, "Snowy")
        .when(col("day_of_year") % 3 == 0, "Cloudy")
        .otherwise("Sunny"),
    )
    daily = daily.withColumn(
        "promotion",
        when(col("is_weekend") == 1.0, "Weekend Special")
        .when(col("day_of_week") == "Friday", "Happy Hour")
        .when(col("day_of_year") % 5 == 0, "BOGO")
        .otherwise("None"),
    )

    # Sort chronologically
    daily = daily.orderBy("date", "store_location")

    record_count = daily.count()
    print(f"[+] PySpark aggregated {record_count} daily store sales records.")

    # 4. Collect aggregated records for cross-platform export (avoids Hadoop winutils file committer issues on Windows)
    rows = [r.asDict() for r in daily.drop("day_of_year").collect()]
    for r in rows:
        r["date"] = str(r["date"])
        r["daily_revenue"] = float(r["daily_revenue"])
        r["total_transactions"] = int(r["total_transactions"])
        r["total_qty"] = int(r["total_qty"])
        r["is_weekend"] = float(r["is_weekend"])

    # 7. Product category aggregation (daily, per store)
    category_df = (
        df.withColumn("date", to_date(col("transaction_date")))
        .groupBy("date", "store_location", "product_category")
        .agg(
            _round(_sum("revenue"), 2).alias("category_revenue"),
            countDistinct("transaction_id").alias("category_transactions"),
            _sum("transaction_qty").alias("category_qty"),
        )
        .orderBy("date", "store_location", desc("category_revenue"))
    )
    print(f"[+] PySpark aggregated {category_df.count()} daily store category records.")

    # 8. Hour-of-day traffic aggregation (per store)
    hourly_df = (
        df.withColumn(
            "hour",
            date_format(
                to_timestamp(col("transaction_time"), "HH:mm:ss"),
                "H",
            ).cast("int"),
        )
        .groupBy("hour", "store_location")
        .agg(
            countDistinct("transaction_id").alias("hourly_transactions"),
            _round(_sum("revenue"), 2).alias("hourly_revenue"),
            _sum("transaction_qty").alias("hourly_qty"),
        )
        .orderBy("hour", "store_location")
    )
    print(f"[+] PySpark aggregated {hourly_df.count()} hourly store traffic records.")

    os.makedirs(os.path.dirname(output_parquet), exist_ok=True)
    if os.path.isdir(output_parquet):
        shutil.rmtree(output_parquet)
    elif os.path.exists(output_parquet):
        os.remove(output_parquet)

    # 5. Write to Parquet using PyArrow
    table = pa.Table.from_pylist(rows)
    pq.write_table(table, output_parquet)
    print(f"[+] Processed Parquet written to: {output_parquet}")

    # 6. Write consolidated summary CSV
    if rows:
        fieldnames = list(rows[0].keys())
        with open(output_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
    print(f"[+] Consolidated summary CSV written to: {output_csv}")

    # 9. Write product category artifacts
    _write_artifacts(
        [r.asDict() for r in category_df.collect()],
        category_parquet,
        category_csv,
        "Product category",
    )
    # 10. Write hourly traffic artifacts
    _write_artifacts(
        [r.asDict() for r in hourly_df.collect()],
        hourly_parquet,
        hourly_csv,
        "Hourly traffic",
    )

    spark.stop()
    return record_count


def _write_artifacts(rows: list, parquet_path: str, csv_path: str, label: str) -> None:
    """Write list of dict rows to Parquet and CSV (cross-platform safe)."""
    os.makedirs(os.path.dirname(parquet_path), exist_ok=True)
    if os.path.isdir(parquet_path):
        shutil.rmtree(parquet_path)
    elif os.path.exists(parquet_path):
        os.remove(parquet_path)

    if rows:
        pq.write_table(pa.Table.from_pylist(rows), parquet_path)
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
    print(f"[+] {label} artifacts written to: {parquet_path}")


if __name__ == "__main__":
    count = run_etl()
    print(f"ETL completed successfully with {count} records.")
