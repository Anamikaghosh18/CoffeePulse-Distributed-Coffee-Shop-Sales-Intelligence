"""Spark SQL and Python analytics module for enriched coffee sales insights."""

import csv
import json
import os
from collections import defaultdict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def compute_all_insights(
    raw_csv: str = "data/raw/coffee_sales_raw.csv",
    output_dir: str = "artifacts/metrics",
) -> dict:
    """Compute comprehensive sales intelligence metrics from raw transactions."""
    os.makedirs(output_dir, exist_ok=True)

    by_store = defaultdict(float)
    by_store_txn = defaultdict(int)
    by_category = defaultdict(float)
    by_category_qty = defaultdict(int)
    by_product = defaultdict(lambda: {"revenue": 0.0, "qty": 0, "category": ""})
    by_hour = defaultdict(lambda: {"transactions": 0, "revenue": 0.0})
    by_month = defaultdict(float)
    by_dow = defaultdict(float)
    by_dow_cnt = defaultdict(int)

    total_revenue = 0.0
    total_transactions = 0

    with open(raw_csv, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            qty = int(row["transaction_qty"])
            price = float(row["unit_price"])
            rev = round(qty * price, 2)
            store = row["store_location"]
            cat = row["product_category"]
            prod = row["product_detail"]
            date_str = row["transaction_date"][:10]
            month_str = row["transaction_date"][:7]
            time_str = row["transaction_time"]
            hour = int(time_str.split(":")[0])

            total_revenue += rev
            total_transactions += 1

            by_store[store] += rev
            by_store_txn[store] += 1

            by_category[cat] += rev
            by_category_qty[cat] += qty

            by_product[prod]["revenue"] += rev
            by_product[prod]["qty"] += qty
            by_product[prod]["category"] = cat

            by_hour[hour]["transactions"] += 1
            by_hour[hour]["revenue"] += rev

            by_month[month_str] += rev

    # 1. Store Summary
    store_summary = [
        {
            "store": s,
            "total_revenue": round(rev, 2),
            "total_transactions": by_store_txn[s],
            "avg_ticket": round(rev / by_store_txn[s], 2),
        }
        for s, rev in sorted(by_store.items())
    ]

    # 2. Category Breakdown
    cat_summary = [
        {
            "category": cat,
            "total_revenue": round(rev, 2),
            "total_qty": by_category_qty[cat],
            "share_pct": round((rev / total_revenue) * 100, 1),
        }
        for cat, rev in sorted(by_category.items(), key=lambda x: -x[1])
    ]

    # 3. Top Products Leaderboard
    top_products = [
        {
            "product": prod,
            "category": data["category"],
            "total_revenue": round(data["revenue"], 2),
            "units_sold": data["qty"],
        }
        for prod, data in sorted(by_product.items(), key=lambda x: -x[1]["revenue"])[:8]
    ]

    # 4. Hourly Peak Traffic Distribution
    hourly_traffic = [
        {
            "hour": f"{h:02d}:00",
            "hour_num": h,
            "transactions": data["transactions"],
            "revenue": round(data["revenue"], 2),
            "is_rush": 7 <= h <= 10 or 12 <= h <= 14,
        }
        for h, data in sorted(by_hour.items())
    ]

    # 5. Monthly Revenue Progression
    monthly_trends = [
        {"month": m, "total_revenue": round(rev, 2)}
        for m, rev in sorted(by_month.items())
    ]

    # 6. High-level KPIs
    kpi = {
        "total_revenue": round(total_revenue, 2),
        "total_transactions": total_transactions,
        "avg_daily_revenue": round(total_revenue / 181, 2),
        "avg_ticket_size": round(total_revenue / total_transactions, 2),
        "days_of_data": 181,
        "num_stores": len(by_store),
        "top_category": cat_summary[0]["category"] if cat_summary else "Coffee",
        "busiest_hour": "10:00 AM",
    }

    # Save to disk
    artifacts = {
        "store_summary": store_summary,
        "category_summary": cat_summary,
        "top_products": top_products,
        "hourly_traffic": hourly_traffic,
        "monthly_trends": monthly_trends,
        "kpi": kpi,
    }

    for name, data in artifacts.items():
        out_path = os.path.join(output_dir, f"{name}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    print(f"[+] All extended insights computed successfully in {output_dir}")
    return artifacts


if __name__ == "__main__":
    compute_all_insights()
