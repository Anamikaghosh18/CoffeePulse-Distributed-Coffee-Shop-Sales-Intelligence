"""Analytics service for loading precomputed metrics and insights JSON artifacts."""

import json
from pathlib import Path

METRICS_DIR = Path("artifacts/metrics")


def _load(filename: str):
    path = METRICS_DIR / filename
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def get_kpi() -> dict:
    return _load("kpi.json") or {}


def get_time_series() -> list:
    return _load("time_series.json") or []


def get_store_summary() -> list:
    return _load("store_summary.json") or []


def get_category_summary() -> list:
    return _load("category_summary.json") or []


def get_top_products() -> list:
    return _load("top_products.json") or []


def get_hourly_traffic() -> list:
    return _load("hourly_traffic.json") or []


def get_monthly_trends() -> list:
    return _load("monthly_trends.json") or []


def get_weather_summary() -> list:
    return _load("weather_summary.json") or []


def get_promotion_summary() -> list:
    return _load("promotion_summary.json") or []


def get_dow_summary() -> list:
    return _load("dow_summary.json") or []


def get_predictions() -> list:
    return _load("predictions.json") or []


def get_model_metrics() -> dict:
    return _load("model_metrics.json") or {}


def simulate_revenue(store: str, weather: str, promotion: str, transactions: int) -> dict:
    """Predict revenue for simulated inputs based on the trained model parameters."""
    base_price = 4.69
    base_rev = transactions * base_price

    # Location adjustment
    store_adj = {
        "Hell's Kitchen": 1.02,
        "Astoria": 1.00,
        "Lower Manhattan": 0.98,
    }.get(store, 1.0)

    # Weather impact
    weather_adj = {
        "Sunny": 1.05,
        "Cloudy": 1.00,
        "Rainy": 0.94,
        "Snowy": 0.88,
    }.get(weather, 1.0)

    # Promotion boost
    promo_adj = {
        "Weekend Special": 1.10,
        "Happy Hour": 1.06,
        "BOGO": 1.04,
        "None": 1.00,
    }.get(promotion, 1.0)

    predicted = round(base_rev * store_adj * weather_adj * promo_adj, 2)
    ci_low = round(predicted - 149.13, 2)  # 1x RMSE margin
    ci_high = round(predicted + 149.13, 2)

    return {
        "store": store,
        "weather": weather,
        "promotion": promotion,
        "estimated_transactions": transactions,
        "predicted_revenue": predicted,
        "confidence_interval": [max(0, ci_low), ci_high],
        "rmse_margin": 149.13,
    }
