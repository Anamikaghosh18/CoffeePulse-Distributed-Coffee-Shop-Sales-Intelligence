# Data Directory Structure

This directory organizes data files for the CoffeePulse distributed sales intelligence system.

## Directory Layout

- `raw/`: Place original sales data here (Excel `.xlsx` workbooks or CSV transaction logs). Files in this folder are ignored by Git.
- `processed/`: Output directory for Spark ETL jobs (partitioned Parquet format). Ignored by Git.
- `sample/`: Contains sample dataset (`sample_sales.csv`) used exclusively for schema validation and local smoke tests.

## Storage Formats

- **Raw Ingestion**: Excel (`.xlsx`) and CSV formats (`transaction_id, transaction_date, transaction_time, store_id, store_location, product_category, product_detail, unit_price, transaction_qty`).
- **Distributed Analytics / ML**: Parquet format with Snappy compression for columnar storage efficiency in Apache Spark.
