"""Spark MLlib Linear Regression pipeline for daily revenue prediction.

Tasks:
  1. Load processed daily sales from Parquet.
  2. Encode categorical variables (store_location, weather, promotion, day_of_week).
  3. Train LinearRegression model to predict daily_revenue.
  4. Evaluate using RMSE and R².
  5. Export actual vs predicted table as JSON for dashboard visualization.
"""

import csv
import json
import os
import sys
from pathlib import Path
from pyspark.ml import Pipeline
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml.feature import OneHotEncoder, StringIndexer, VectorAssembler
from pyspark.ml.regression import LinearRegression
from pyspark.sql.functions import col, round as _round

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from spark.session import configure_java_environment, get_spark_session


def run_training(
    input_parquet: str = "data/processed/daily_sales.parquet",
    predictions_json: str = "artifacts/metrics/predictions.json",
    metrics_json: str = "artifacts/metrics/model_metrics.json",
) -> dict:
    """Train Linear Regression model and export predictions for visualization.

    Returns:
        dict with rmse, r2, mae, and prediction count.
    """
    configure_java_environment()
    spark = get_spark_session(app_name="CoffeePulse-MLTraining", log_level="ERROR")

    print("[*] Loading processed daily sales from Parquet...")
    df = spark.read.parquet(input_parquet)
    df = df.withColumn("daily_revenue", _round(col("daily_revenue"), 2))

    # ── Feature encoding ──────────────────────────────────────────────────────
    cat_cols = ["store_location", "weather", "promotion", "day_of_week"]
    idx_stages = [
        StringIndexer(inputCol=c, outputCol=f"{c}_idx", handleInvalid="keep")
        for c in cat_cols
    ]
    enc_stage = OneHotEncoder(
        inputCols=[f"{c}_idx" for c in cat_cols],
        outputCols=[f"{c}_vec" for c in cat_cols],
    )
    assembler = VectorAssembler(
        inputCols=[f"{c}_vec" for c in cat_cols] + ["is_weekend", "total_transactions"],
        outputCol="features",
    )
    lr = LinearRegression(
        featuresCol="features",
        labelCol="daily_revenue",
        maxIter=100,
        regParam=0.05,
        elasticNetParam=0.0,
    )
    pipeline = Pipeline(stages=idx_stages + [enc_stage, assembler, lr])

    # ── Train / test split (80/20) ─────────────────────────────────────────
    train_df, test_df = df.randomSplit([0.8, 0.2], seed=42)
    print(f"[*] Training on {train_df.count()} records, testing on {test_df.count()} records...")

    model = pipeline.fit(train_df)
    preds = model.transform(test_df)

    # ── Evaluation metrics ─────────────────────────────────────────────────
    def metric(name):
        return RegressionEvaluator(
            labelCol="daily_revenue", predictionCol="prediction", metricName=name
        ).evaluate(preds)

    rmse = round(metric("rmse"), 2)
    r2   = round(metric("r2"), 4)
    mae  = round(metric("mae"), 2)
    print(f"[+] RMSE : {rmse}")
    print(f"[+] R²   : {r2}")
    print(f"[+] MAE  : {mae}")

    # ── Export actual vs predicted for chart ───────────────────────────────
    pred_rows = (
        preds.select("date", "store_location", "daily_revenue", _round("prediction", 2).alias("prediction"))
        .orderBy("date", "store_location")
        .collect()
    )

    pred_list = [
        {
            "date": str(r["date"]),
            "store": r["store_location"],
            "actual": round(float(r["daily_revenue"]), 2),
            "predicted": round(float(r["prediction"]), 2),
        }
        for r in pred_rows
    ]

    os.makedirs(os.path.dirname(predictions_json), exist_ok=True)
    with open(predictions_json, "w", encoding="utf-8") as f:
        json.dump(pred_list, f, indent=2)
    print(f"[+] Predictions saved to: {predictions_json}")

    metrics = {"rmse": rmse, "r2": r2, "mae": mae, "test_records": len(pred_list)}
    with open(metrics_json, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"[+] Metrics saved to: {metrics_json}")

    spark.stop()
    return metrics


if __name__ == "__main__":
    result = run_training()
    print(f"\nModel training complete: RMSE={result['rmse']}, R²={result['r2']}, MAE={result['mae']}")
