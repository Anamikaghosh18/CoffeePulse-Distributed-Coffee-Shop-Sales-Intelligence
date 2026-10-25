# Coffiko: Distributed Coffee Shop Sales Intelligence

Coffiko is a coffee shop sales intelligence and daily revenue prediction system developed for a Cluster Computing course. The project combines distributed data processing with Apache Spark (PySpark), machine learning via Spark MLlib, a FastAPI backend, and an elevated, professional React dashboard.

---

## 1. Project Architecture

```text
coffeePulse/
├── data/
│   ├── raw/                  ← Source Excel (.xlsx) / CSV transactional data (149k rows)
│   └── processed/            ← PySpark-aggregated daily store sales (Parquet + CSV)
├── artifacts/
│   └── metrics/              ← Precomputed Spark SQL analytics & ML evaluation JSONs
├── spark/
│   ├── data_processing/etl.py   ← Step 1: PySpark daily aggregation & categorical enrichment
│   ├── sql_analytics/analytics.py← Step 2: Extended business insights & aggregations
│   └── ml/pipeline.py           ← Step 3: Spark MLlib feature encoding & regression
├── backend/                  ← FastAPI REST API serving analytics, metrics & simulator
└── frontend/                 ← React 19 + Tailwind CSS + Recharts dashboard
```

---

## 2. Running the Complete System

### Step 1: Run PySpark Processing & ML Training (One-time or on data refresh)
```powershell
# 1. Run PySpark ETL (aggregates 149k rows into 543 daily store records)
.\.venv\Scripts\python.exe spark\data_processing\etl.py

# 2. Compute comprehensive Spark SQL analytics & insights
.\.venv\Scripts\python.exe spark\sql_analytics\analytics.py

# 3. Train Spark MLlib Linear Regression pipeline & evaluate RMSE
.\.venv\Scripts\python.exe spark\ml\pipeline.py
```

### Step 2: Launch Application Servers

**Terminal 1 — Backend (FastAPI)**
```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

**Terminal 2 — Frontend (React Vite)**
```powershell
cd frontend
npm run dev
```
- Dashboard: [http://localhost:5173](http://localhost:5173)

---

## 3. High-Value Dashboard Insights Included

1. **Overview Dashboard**:
   - Total Gross Revenue ($698,812), Transactions (149,116), Avg Ticket Size ($4.69), and Peak Rush Hours.
   - **Monthly Growth Trajectory Area Chart** displaying revenue progression from Jan to Jun 2023.
   - **Hourly Foot-Traffic Distribution** highlighting the morning commute spike (8 AM - 10 AM) and lunch rush (12 PM - 1 PM).
   - **Store Location Breakdown** with elevated cards and visual progress bars showing market share across Astoria, Hell's Kitchen, and Lower Manhattan.

2. **Sales Analytics Page**:
   - **Category Share Donut Chart** showing that Coffee & Tea account for over 66% of gross revenue.
   - **Top 8 Best-Selling Products Leaderboard** (Units sold, gross revenue, and category tags).
   - **Day-of-Week Purchasing Patterns** comparing weekday averages against weekend volume.
   - **Weather Impact Analysis** evaluating foot traffic variations across Sunny, Cloudy, Rainy, and Snowy days.
   - **Promotional Campaign Performance** measuring the uplift of Weekend Specials, Happy Hours, and BOGO deals.

3. **Machine Learning & Revenue Predictions Page**:
   - **Spark MLlib Evaluation Metrics**: RMSE ($149.13), R² Score (0.8589), and MAE ($93.83).
   - **Actual vs. Predicted Revenue Line Chart** with store filtering.
   - **Residuals & Goodness-of-Fit Scatter Plot** plotted against the ideal $x = y$ line.
   - **Interactive Revenue Simulator / What-If Scenario Estimator**:
     Allows professors and users to select Store, Weather, Promotion, and Order Count to instantly estimate predicted revenue with a ±$149.13 RMSE confidence interval.
