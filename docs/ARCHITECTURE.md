# CoffeePulse Architecture Specification

## 1. System Overview

**CoffeePulse** is a distributed coffee shop sales intelligence and daily revenue prediction system designed for a Cluster Computing course. The architecture balances real-world distributed data processing paradigms with the simplicity required for reliable local execution on a college development workstation.

```mermaid
flowchart TD
    subgraph Storage ["Storage Tier"]
        Excel["Excel Sales Data (.xlsx)<br/>& Raw CSV (data/raw/)"]
        Parquet["Processed Parquet Store<br/>(data/processed/)"]
        Models["Trained MLlib Models<br/>(artifacts/models/)"]
    end

    subgraph SparkTier ["Distributed Processing (PySpark & MLlib)"]
        ETL["Data Ingestion & Cleaning<br/>(spark/data_processing/)"]
        SQL["Spark SQL Analytics<br/>(spark/sql_analytics/)"]
        ML["ML Pipeline & Regressor<br/>(spark/ml/)"]
    end

    subgraph BackendTier ["FastAPI Application Backend"]
        Mgr["Lazy Spark Session Manager<br/>(backend/app/services/)"]
        API["FastAPI REST Endpoints<br/>(backend/app/api/v1/)"]
    end

    subgraph FrontendTier ["Interactive Dashboard (JavaScript)"]
        ReactJS["React 19 + JavaScript + Vite"]
        Tailwind["Tailwind CSS UI"]
        Recharts["Recharts Visualizations"]
    end

    Excel --> ETL
    ETL --> Parquet
    Parquet --> SQL
    Parquet --> ML
    ML --> Models

    Parquet -.-> Mgr
    Models -.-> Mgr
    Mgr --> API
    API <-->|REST / JSON| ReactJS
    ReactJS --> Tailwind
    ReactJS --> Recharts
```

## 2. Component Decoupling & Lazy Spark Architecture

A common pitfall in data engineering applications is spinning up a heavyweight Spark JVM session during every API import, test run, or health check. CoffeePulse employs a **Lazy Spark Session Manager** pattern:

- **FastAPI Startup**: FastAPI boots in milliseconds. Health checks (`/health`) probe file system paths and service availability immediately without invoking the JVM.
- **On-Demand Processing**: Spark is only initialized when batch ETL or ML training jobs are explicitly requested.
- **Graceful Shutdown**: The FastAPI lifespan context automatically halts any active SparkSession upon server termination.

## 3. Storage Hierarchy

- `data/raw/`: Original transactional Excel workbooks (`.xlsx`) and CSV logs from point-of-sale systems.
- `data/processed/`: Snappy-compressed, columnar Parquet files partitioned for distributed Spark SQL querying.
- `artifacts/models/`: Serialized MLlib PipelineModels ready for offline evaluation and revenue inference.
