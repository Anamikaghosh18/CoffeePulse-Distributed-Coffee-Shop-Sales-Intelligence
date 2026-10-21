"""Analytics API endpoints — serve precomputed Spark SQL and ML metrics."""

from fastapi import APIRouter, HTTPException, Query
from backend.app.services.analytics_service import (
    get_kpi,
    get_time_series,
    get_store_summary,
    get_category_summary,
    get_top_products,
    get_hourly_traffic,
    get_monthly_trends,
    get_weather_summary,
    get_promotion_summary,
    get_dow_summary,
    get_predictions,
    get_model_metrics,
    simulate_revenue,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/kpi", summary="Overall KPI summary")
async def kpi():
    data = get_kpi()
    if not data:
        raise HTTPException(status_code=503, detail="Analytics not yet computed.")
    return data


@router.get("/time-series", summary="Daily revenue time series")
async def time_series():
    return get_time_series()


@router.get("/stores", summary="Revenue summary by store location")
async def stores():
    return get_store_summary()


@router.get("/categories", summary="Revenue breakdown by product category")
async def categories():
    return get_category_summary()


@router.get("/top-products", summary="Top selling coffee shop products")
async def top_products():
    return get_top_products()


@router.get("/hourly-traffic", summary="Foot-traffic and peak transaction hours")
async def hourly_traffic():
    return get_hourly_traffic()


@router.get("/monthly-trends", summary="Monthly revenue growth progression")
async def monthly_trends():
    return get_monthly_trends()


@router.get("/weather", summary="Revenue breakdown by weather condition")
async def weather():
    return get_weather_summary()


@router.get("/promotions", summary="Revenue and transactions by promotion type")
async def promotions():
    return get_promotion_summary()


@router.get("/day-of-week", summary="Average daily revenue by day of week")
async def day_of_week():
    return get_dow_summary()


@router.get("/predictions", summary="Actual vs predicted daily revenue (test set)")
async def predictions():
    return get_predictions()


@router.get("/model-metrics", summary="Linear Regression evaluation metrics")
async def model_metrics():
    data = get_model_metrics()
    if not data:
        raise HTTPException(status_code=503, detail="Model not yet trained.")
    return data


@router.get("/simulate", summary="Interactive what-if revenue simulation")
async def simulate(
    store: str = Query("Hell's Kitchen", description="Store Location"),
    weather: str = Query("Sunny", description="Weather Condition"),
    promotion: str = Query("Weekend Special", description="Promotion Type"),
    transactions: int = Query(275, ge=50, le=1000, description="Projected transaction count"),
):
    return simulate_revenue(store, weather, promotion, transactions)
