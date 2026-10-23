# Artifacts Directory Structure

This directory stores generated models, evaluation checkpoints, and training metrics produced by Spark MLlib pipelines.

## Directory Layout

- `models/`: Serialized Spark MLlib models (e.g., `LinearRegressionModel` pipeline stages). Ignored by Git.
- `checkpoints/`: Spark streaming checkpoints and temporary state directories for fault-tolerant recovery. Ignored by Git.
- `metrics/`: Exported model evaluation summaries (e.g. RMSE, R2, MAE JSON summaries) for dashboard consumption.
