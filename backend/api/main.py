"""
Sagar Setu — FastAPI Application Gateway
Intelligent Freight Forecasting & Vessel Chartering Optimization Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, cargo_orders, charter_contracts, reference_data, forecasts, optimization

app = FastAPI(
    title="Sagar Setu API",
    description="Intelligent Freight Forecasting & Vessel Chartering Optimization Platform",
    version="0.1.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://frontend:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cargo_orders.router)
app.include_router(charter_contracts.router)
app.include_router(reference_data.router)
app.include_router(forecasts.router)
app.include_router(optimization.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "sagar-setu-api"}

@app.get("/")
async def root():
    return {
        "message": "Sagar Setu API — Intelligent Freight Forecasting & Vessel Chartering Optimization",
        "docs": "/docs",
        "health": "/health",
    }
