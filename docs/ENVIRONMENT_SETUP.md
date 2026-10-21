# CoffeePulse Local Environment Setup Guide

This guide details runtime prerequisites, Windows-specific configuration, and startup instructions.

## 1. Prerequisites

| Component | Minimum Version | Verified Version on this Host |
| :--- | :--- | :--- |
| **Operating System** | Windows 10/11, macOS, Linux | Windows 11 (64-bit) |
| **Python** | 3.10+ | Python 3.15.0 |
| **Java Runtime** | Java 17 LTS or Java 21 LTS | Java 21.0.12.1 LTS |
| **Node.js** | 18+ | Node.js v24.22.0 |
| **npm** | 9+ | npm 11.19.1 |

---

## 2. Windows-Specific Configuration

### Java Home (`JAVA_HOME`)
PySpark requires a valid Java Development Kit (JDK 17 or 21) installed. On Windows, ensure `JAVA_HOME` points to the actual JDK directory rather than a missing or stale path.

To verify or set manually in PowerShell:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12.1"
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-21.0.12.1", "User")
```

The CoffeePulse Spark session builder (`spark/session.py`) and backend manager (`backend/app/services/spark_manager.py`) automatically detect and configure this fallback path if `$env:JAVA_HOME` is unset or invalid.

### Hadoop `winutils.exe` on Windows
When PySpark runs on Windows, you may notice a warning:
```
WARN Shell: Did not find winutils.exe: HADOOP_HOME and hadoop.home.dir are unset.
```
- **Does this break local execution?** No. Local Spark sessions (`local[*]`) perform memory-based RDD/DataFrame operations and standard Parquet/CSV file I/O normally without Hadoop native binaries.
- **To eliminate the warning (Optional):** Download Hadoop 3.x `winutils.exe` and `hadoop.dll`, place them in `C:\hadoop\bin`, and set:
  ```powershell
  $env:HADOOP_HOME = "C:\hadoop"
  $env:PATH += ";C:\hadoop\bin"
  ```

---

## 3. Python Virtual Environment Setup

From the project root:

```powershell
# 1. Create virtual environment
python -m venv .venv

# 2. Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# 3. Upgrade pip and install dependencies
python -m pip install -r requirements.txt
```

---

## 4. Frontend Setup (JavaScript)

From the project root:

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Build verification
npm run build
```

---

## 5. Running the Application

### Start the FastAPI Backend
```powershell
# From project root with virtual environment activated:
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Swagger UI / API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### Start the React Frontend
```powershell
# In a separate terminal from frontend directory:
cd frontend
npm run dev
```
Interactive dashboard will be available at: [http://localhost:5173](http://localhost:5173)

---

## 6. Validating the Setup

Run the automated test suite:
```powershell
# Run backend and integration smoke tests
.\.venv\Scripts\python.exe -m pytest backend\tests tests
```

Run the standalone Spark smoke test:
```powershell
.\.venv\Scripts\python.exe spark\smoke_test.py
```
