import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
import turso_serverless
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(BASE_DIR / "laptop.pkl")))
FEATURES = ["Company", "TypeName", "Inches", "ScreenResolution", "Cpu", "Ram", "Memory", "Gpu"]
CATEGORICAL = ["Company", "TypeName", "ScreenResolution", "Cpu", "Ram", "Memory", "Gpu"]

model = None
model_error = None
try:
    model = joblib.load(MODEL_PATH)
except Exception as exc:
    model_error = f"{type(exc).__name__}: {exc}"

app = FastAPI(title="Laptop Price Prediction AI API", version="1.0.0",
              description="Predict laptop prices using the supplied fitted model.")
origins = [x.strip() for x in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,https://laptopwise.mhabibulie02.workers.dev").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False,
                   allow_methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type"])

def db_connection():
    url = os.getenv("TURSO_DATABASE_URL", "").strip()
    token = os.getenv("TURSO_AUTH_TOKEN", "").strip()
    if not url or not token:
        raise RuntimeError("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured.")
    return turso_serverless.connect(url, auth_token=token)

def init_table():
    conn = db_connection()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                inputs_json TEXT NOT NULL,
                predicted_price REAL NOT NULL
            )
        """)
        conn.commit()
    finally:
        conn.close()

def row_to_dict(row):
    keys = ["id", "created_at", "inputs_json", "predicted_price"]
    data = dict(zip(keys, row))
    try:
        data["inputs"] = json.loads(data.pop("inputs_json"))
    except Exception:
        data["inputs"] = {}
        data.pop("inputs_json", None)
    data["predicted_price"] = float(data["predicted_price"])
    return data

class PredictionRequest(BaseModel):
    Company: str = Field(min_length=1)
    TypeName: str = Field(min_length=1)
    Inches: float = Field(gt=0, le=30)
    ScreenResolution: str = Field(min_length=1)
    Cpu: str = Field(min_length=1)
    Ram: str = Field(min_length=1)
    Memory: str = Field(min_length=1)
    Gpu: str = Field(min_length=1)

@app.get("/")
def root():
    return {"name": "Laptop Price Prediction AI API", "docs": "/docs", "health": "/health"}

@app.get("/health")
def health():
    db_ok, db_error = False, None
    try:
        conn = db_connection()
        conn.execute("SELECT 1").fetchone()
        conn.close()
        db_ok = True
    except Exception as exc:
        db_error = str(exc)
    return {"status": "ok" if model is not None else "degraded",
            "model_loaded": model is not None, "model_error": model_error,
            "database_connected": db_ok, "database_error": db_error}

@app.get("/model-info")
def model_info():
    if model is None:
        raise HTTPException(status_code=503, detail=f"Model could not be loaded: {model_error}")
    model_features = getattr(model, "feature_names_in_", FEATURES)
    return {"model_loaded": True, "features": list(model_features), "target": "Price_euros",
            "units": "EUR", "task": "regression"}

@app.post("/predict")
def predict(payload: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail=f"Model could not be loaded. Check backend dependencies. {model_error}")
    values = payload.model_dump()
    values = {k: (str(v).strip() if k in CATEGORICAL else float(v)) for k, v in values.items()}
    row = pd.DataFrame([{k: values[k] for k in FEATURES}], columns=FEATURES)
    try:
        predicted_price = float(model.predict(row)[0])
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"The saved model could not process these inputs: {type(exc).__name__}: {exc}")
    if not pd.notna(predicted_price):
        raise HTTPException(status_code=500, detail="The model returned an invalid prediction.")
    prediction_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    conn = None
    try:
        conn = db_connection()
        conn.execute("INSERT INTO predictions (id, created_at, inputs_json, predicted_price) VALUES (?, ?, ?, ?)",
                     (prediction_id, created_at, json.dumps(values, ensure_ascii=False), predicted_price))
        conn.commit()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Price was predicted, but saving it to Turso failed. No saved-history confirmation was returned. Database error: {exc}")
    finally:
        if conn:
            conn.close()
    return {"id": prediction_id, "created_at": created_at, "predicted_price": predicted_price,
            "currency": "EUR", "inputs": values, "saved": True}

@app.get("/predictions")
def predictions(limit: int = Query(default=20, ge=1, le=100), offset: int = Query(default=0, ge=0)):
    try:
        conn = db_connection()
        rows = conn.execute("SELECT id, created_at, inputs_json, predicted_price FROM predictions ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, offset)).fetchall()
        total = conn.execute("SELECT COUNT(*) FROM predictions").fetchone()[0]
        conn.close()
        return {"items": [row_to_dict(row) for row in rows], "total": int(total), "limit": limit, "offset": offset}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Could not retrieve prediction history: {exc}")

@app.get("/predictions/{prediction_id}")
def prediction_detail(prediction_id: str):
    try:
        conn = db_connection()
        row = conn.execute("SELECT id, created_at, inputs_json, predicted_price FROM predictions WHERE id = ?", (prediction_id,)).fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="Prediction not found.")
        return row_to_dict(row)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Could not retrieve prediction: {exc}")

@app.get("/stats")
def stats():
    try:
        conn = db_connection()
        summary = conn.execute("SELECT COUNT(*), AVG(predicted_price), MIN(predicted_price), MAX(predicted_price) FROM predictions").fetchone()
        recent = conn.execute("SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM predictions GROUP BY day ORDER BY day DESC LIMIT 14").fetchall()
        bins = conn.execute("""
            SELECT CASE
              WHEN predicted_price < 500 THEN '< €500'
              WHEN predicted_price < 1000 THEN '€500–€999'
              WHEN predicted_price < 1500 THEN '€1,000–€1,499'
              WHEN predicted_price < 2000 THEN '€1,500–€1,999'
              ELSE '€2,000+'
            END AS price_band, COUNT(*) AS count
            FROM predictions GROUP BY price_band
        """).fetchall()
        conn.close()
        return {"total": int(summary[0] or 0), "average": summary[1], "minimum": summary[2], "maximum": summary[3],
                "activity": [{"date": r[0], "count": r[1]} for r in reversed(recent)],
                "distribution": [{"range": r[0], "count": r[1]} for r in bins]}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Could not calculate dashboard statistics: {exc}")

@app.post("/admin/init-db")
def initialize_database():
    try:
        init_table()
        return {"ok": True, "message": "Prediction table is ready."}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database initialization failed: {exc}")
