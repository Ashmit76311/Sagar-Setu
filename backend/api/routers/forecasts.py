"""
Sagar Setu — Forecast API Routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import pandas as pd
from datetime import datetime, date

from api.database import get_db
from api.models import FreightRateHistorical, FreightForecast, Route, Port
from api.schemas import ForecastRequest, ForecastResponse, ForecastPointResponse
from api.auth import get_current_user
from forecasting.engine import FreightForecaster

router = APIRouter(prefix="/api/forecast", tags=["forecast"])

@router.get("/freight-rate", response_model=ForecastResponse)
async def get_freight_forecast(
    route_id: str,
    vessel_type: str,
    horizon: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Fetch historical data
    query = select(FreightRateHistorical).where(
        FreightRateHistorical.route_id == route_id,
        FreightRateHistorical.vessel_type == vessel_type
    ).order_by(FreightRateHistorical.date)
    
    result = await db.execute(query)
    history_records = result.scalars().all()
    
    if not history_records:
        raise HTTPException(status_code=404, detail="No historical data found for this route and vessel type.")
        
    df_history = pd.DataFrame([
        {"date": r.date, "rate_usd_per_ton": float(r.rate_usd_per_ton)} 
        for r in history_records
    ])
    
    current_rate = float(history_records[-1].rate_usd_per_ton)
    
    # 2. Check if a recent forecast exists (caching)
    # To keep it simple, we run the forecast live if not found.
    # In a real scenario we'd use Redis or DB to cache.
    forecast_query = select(FreightForecast).where(
        FreightForecast.route_id == route_id,
        FreightForecast.vessel_type == vessel_type,
        FreightForecast.horizon_days == horizon,
        FreightForecast.forecast_generated_at >= datetime.utcnow().date() # Generated today
    ).order_by(FreightForecast.forecast_date)
    
    forecast_result = await db.execute(forecast_query)
    cached_forecasts = forecast_result.scalars().all()
    
    if cached_forecasts and len(cached_forecasts) == horizon:
        points = [
            ForecastPointResponse(
                forecast_date=f.forecast_date,
                predicted_rate=float(f.predicted_rate),
                confidence_lower=float(f.confidence_lower) if f.confidence_lower else None,
                confidence_upper=float(f.confidence_upper) if f.confidence_upper else None
            )
            for f in cached_forecasts
        ]
        return ForecastResponse(
            route_id=route_id,
            vessel_type=vessel_type,
            horizon_days=horizon,
            model_version=cached_forecasts[0].model_version,
            generated_at=cached_forecasts[0].forecast_generated_at,
            current_rate=current_rate,
            forecast_points=points
        )

    # 3. Generate new forecast
    try:
        engine = FreightForecaster(df_history)
        predictions = engine.ensemble_forecast(horizon)
        mape = engine.backtest()
        print(f"Model MAPE for route {route_id}: {mape:.2%}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting engine error: {str(e)}")

    # 4. Save to DB
    new_forecasts = []
    generated_time = datetime.utcnow()
    for p in predictions:
        f = FreightForecast(
            route_id=route_id,
            vessel_type=vessel_type,
            forecast_generated_at=generated_time,
            horizon_days=horizon,
            forecast_date=p["forecast_date"],
            predicted_rate=p["predicted_rate"],
            confidence_lower=p["confidence_lower"],
            confidence_upper=p["confidence_upper"],
            model_version="ensemble_v1"
        )
        db.add(f)
        new_forecasts.append(f)
        
    await db.commit()
    
    # 5. Return response
    points = [
        ForecastPointResponse(
            forecast_date=p["forecast_date"],
            predicted_rate=p["predicted_rate"],
            confidence_lower=p["confidence_lower"],
            confidence_upper=p["confidence_upper"]
        ) for p in predictions
    ]
    
    return ForecastResponse(
        route_id=route_id,
        vessel_type=vessel_type,
        horizon_days=horizon,
        model_version="ensemble_v1",
        generated_at=generated_time,
        current_rate=current_rate,
        forecast_points=points
    )
