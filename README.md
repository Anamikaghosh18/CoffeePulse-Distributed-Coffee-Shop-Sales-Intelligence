# Coffiko — Coffee Shop Sales Prediction & Analytics

Coffiko is an end-to-end sales intelligence and daily revenue forecasting system built for a **Cluster Computing** course. The platform leverages distributed data processing with **Apache Spark (PySpark)** and machine learning via **Spark MLlib** to analyze real-world coffee shop transactions, examine consumer buying patterns, and predict future daily sales.

---

## What the Project Is About

Predicting daily sales is essential for retail coffee shops to optimize inventory, staff allocation, and promotional campaigns. Using a dataset of **149,116 point-of-sale transactions** spanning three New York City branches (Astoria, Hell's Kitchen, and Lower Manhattan) across a 6-month period (January – June 2023), Coffiko answers critical operational questions:

1. **Revenue Forecasting**: Can daily sales be accurately predicted using weather, promotions, day of the week, and transaction volume?
2. **Peak Foot-Traffic**: When do retail rush hours occur, and how do customer purchasing patterns vary throughout the day?
3. **Product Performance**: Which beverages and product categories drive the majority of store revenue?
4. **Promotion & Environmental Impact**: How significantly do weather conditions and discount campaigns affect daily store performance?

---

## Machine Learning & Prediction Approach

The forecasting pipeline is built using **Apache Spark MLlib**:

- **Feature Engineering & Encoding**: Categorical variables (`store_location`, `weather`, `promotion`, `day_of_week`) are transformed into indexed and one-hot encoded sparse vectors using `StringIndexer` and `OneHotEncoder`.
- **Feature Assembly**: Encoded vectors are concatenated with numerical transaction counts and weekend indicators via `VectorAssembler`.
- **Model Training**: A `LinearRegression` model is trained on an 80% sample split (460 daily store records) and evaluated against a 20% holdout test set (83 records).

### Model Performance

| Metric | Value | Interpretation |
| :--- | :--- | :--- |
| **R² Score** | **0.8589** | Explains **85.9%** of the variance in daily coffee shop sales |
| **RMSE** | **$149.13** | Average prediction error standard deviation |
| **MAE** | **$93.83** | Mean absolute daily variance across holdout test records |

---

## Key Insights Discovered

- **Morning Rush Dominance**: Peak customer footfall occurs sharply between **8:00 AM and 10:00 AM** (accounting for over 36,000 orders), with a secondary rush during lunch hours (**12:00 PM – 1:00 PM**).
- **Core Beverage Share**: **Coffee (38.6%)** and **Tea (28.1%)** collectively account for over **66% of gross revenue** ($466k+), while Bakery items contribute 11.8%.
- **Top-Selling Items**: *Sustainably Grown Organic Lg* ($21,151) and *Dark Chocolate Lg* ($21,006) are the top revenue-generating individual menu items.
- **Consistent Business Growth**: Total monthly revenue more than doubled across the first half of the year, expanding from **$81.6k in January to $166.4k in June**.
- **Location Balance**: Revenue is evenly distributed across branches, led by Hell's Kitchen ($236.5k), Astoria ($232.2k), and Lower Manhattan ($230.1k).

---

## Dashboard Features

The web interface is built as a clean, light-mode product dashboard:

1. **Executive Overview**: High-level KPIs (Total Revenue, Transactions, Avg Ticket, Rush Hours), 6-month revenue growth curve, and hourly foot-traffic distribution.
2. **Sales Analytics**: Product category share donut chart, top-selling product leaderboard, day-of-week purchasing trends, and weather/promotion comparisons.
3. **ML Predictions & Actual vs. Predicted Plots**: Time-series overlay of actual versus predicted sales, goodness-of-fit scatter plot with an ideal $x = y$ line, and individual location filters.
4. **Interactive Revenue Simulator**: A what-if scenario calculator allowing users to select a store, weather condition, promotion, and projected order volume to immediately generate estimated revenue with a 95% confidence interval.

---

## Tech Stack

- **Distributed Data Processing**: Apache Spark (PySpark 4.x), Spark SQL, PyArrow, Parquet
- **Machine Learning**: Spark MLlib (`LinearRegression`, `VectorAssembler`, `OneHotEncoder`, `RegressionEvaluator`)
- **Backend API**: Python 3.10+, FastAPI, Uvicorn
- **Frontend Dashboard**: React 19, JavaScript (JSX), Vite, Tailwind CSS, Recharts

---

## Quickstart

### 1. Run the Backend API
```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Run the Frontend Dashboard
```powershell
cd frontend
npm run dev
```
Dashboard: [http://localhost:5173](http://localhost:5173)
