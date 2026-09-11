"""
Sagar Setu — Optimization API Routes
Exposes Vessel Matcher, Procurement Scheduler, and Scenario Simulator.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Dict
import datetime
from uuid import UUID

from api.database import get_db
from api.models import CargoOrder, Port, Route, FreightForecast, Plant
from api.schemas import (
    VesselRecommendationRequest, VesselRecommendationResponse,
    OptimizationRequest, OptimizationResponse,
    ScenarioRequest, ScenarioResponse
)
from api.auth import get_current_user, User
from optimization.vessel_matcher import VesselMatcher
from optimization.scheduler import ProcurementOptimizer

router = APIRouter(prefix="/api", tags=["optimization"])


async def get_latest_forecasts(db: AsyncSession) -> Dict[str, float]:
    """Helper to fetch the latest predicted rates per vessel type (simplified average across routes)."""
    # For a real implementation, this would filter by the specific route.
    # Here we average all routes for the demo to get a baseline rate per vessel type.
    query = select(FreightForecast).where(
        FreightForecast.forecast_generated_at >= datetime.datetime.utcnow().date()
    )
    result = await db.execute(query)
    forecasts = result.scalars().all()
    
    rates = {}
    counts = {}
    for f in forecasts:
        rates[f.vessel_type] = rates.get(f.vessel_type, 0) + float(f.predicted_rate)
        counts[f.vessel_type] = counts.get(f.vessel_type, 0) + 1
        
    for k in rates:
        rates[k] /= counts[k]
        
    # Default fallbacks if no forecasts generated yet
    if not rates:
        rates = {
            'capesize': 8.50,
            'panamax': 12.00,
            'supramax': 16.50,
            'handysize': 20.00
        }
    return rates


@router.post("/vessels/recommend", response_model=VesselRecommendationResponse)
async def recommend_vessel(
    request: VesselRecommendationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch Cargo Order
    result = await db.execute(select(CargoOrder).where(CargoOrder.id == request.cargo_order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Cargo Order not found")
        
    # Fetch a default destination port (e.g., Paradip) for draft checks
    port_result = await db.execute(select(Port).where(Port.name.ilike("%Paradip%")))
    dest_port = port_result.scalar_one_or_none()
    
    if not dest_port:
        # Fallback port data if seed data differs
        dest_port = Port(max_draft_m=14.5)
        
    rates = await get_latest_forecasts(db)
    
    matcher = VesselMatcher(current_freight_rates=rates)
    recommendations = matcher.recommend(cargo_order=order, destination_port=dest_port, distance_nm=4000)
    
    return VesselRecommendationResponse(
        cargo_order_id=order.id,
        recommendations=recommendations
    )


@router.post("/procurement/optimize", response_model=OptimizationResponse)
async def optimize_procurement(
    request: OptimizationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch orders for the requested plants
    query = select(CargoOrder).options(selectinload(CargoOrder.commodity)).where(
        CargoOrder.plant_id.in_(request.plant_ids),
        CargoOrder.status == 'pending'
    )
    result = await db.execute(query)
    orders = result.scalars().all()
    
    # Fetch plants
    plant_result = await db.execute(select(Plant).where(Plant.id.in_(request.plant_ids)))
    plants = plant_result.scalars().all()
    
    rates = await get_latest_forecasts(db)
    
    optimizer = ProcurementOptimizer(orders=orders, plants=plants, freight_rates=rates, horizon_days=request.horizon_days)
    opt_result = optimizer.optimize()
    
    return OptimizationResponse(
        plant_ids=request.plant_ids,
        horizon_days=request.horizon_days,
        schedule=opt_result["schedule"],
        baseline_cost_usd=opt_result["baseline_cost_usd"],
        optimized_cost_usd=opt_result["optimized_cost_usd"],
        savings_pct=opt_result["savings_pct"],
        generated_at=datetime.datetime.utcnow()
    )


@router.post("/scenarios/simulate", response_model=ScenarioResponse)
async def simulate_scenario(
    request: ScenarioRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # We will run the optimizer twice: once with baseline rates, once with scenario overrides.
    
    # Fetch orders and plants (if none specified, use all pending)
    if request.plant_ids:
        query = select(CargoOrder).options(selectinload(CargoOrder.commodity)).where(
            CargoOrder.plant_id.in_(request.plant_ids),
            CargoOrder.status == 'pending'
        )
        plant_query = select(Plant).where(Plant.id.in_(request.plant_ids))
    else:
        query = select(CargoOrder).options(selectinload(CargoOrder.commodity)).where(
            CargoOrder.status == 'pending'
        )
        plant_query = select(Plant)
        
    orders = (await db.execute(query)).scalars().all()
    plants = (await db.execute(plant_query)).scalars().all()
    plant_ids = [p.id for p in plants]
    
    baseline_rates = await get_latest_forecasts(db)
    
    # Scenario rates: apply rate_shock_pct and bunker_price_delta_pct
    scenario_rates = {}
    for vt, rate in baseline_rates.items():
        # A simple linear combination for demo purposes
        impact = (1 + (request.rate_shock_pct / 100)) * (1 + (request.bunker_price_delta_pct / 100 * 0.2)) # Bunker is ~20% of cost
        scenario_rates[vt] = rate * impact
        
    baseline_opt = ProcurementOptimizer(orders=orders, plants=plants, freight_rates=baseline_rates, horizon_days=request.horizon_days)
    scenario_opt = ProcurementOptimizer(orders=orders, plants=plants, freight_rates=scenario_rates, horizon_days=request.horizon_days)
    
    base_res = baseline_opt.optimize()
    scen_res = scenario_opt.optimize()
    
    base_response = OptimizationResponse(
        plant_ids=plant_ids, horizon_days=request.horizon_days,
        schedule=base_res["schedule"], baseline_cost_usd=base_res["baseline_cost_usd"],
        optimized_cost_usd=base_res["optimized_cost_usd"], savings_pct=base_res["savings_pct"],
        generated_at=datetime.datetime.utcnow()
    )
    
    scen_response = OptimizationResponse(
        plant_ids=plant_ids, horizon_days=request.horizon_days,
        schedule=scen_res["schedule"], baseline_cost_usd=scen_res["baseline_cost_usd"],
        optimized_cost_usd=scen_res["optimized_cost_usd"], savings_pct=scen_res["savings_pct"],
        generated_at=datetime.datetime.utcnow()
    )
    
    cost_delta_usd = scen_res["optimized_cost_usd"] - base_res["optimized_cost_usd"]
    cost_delta_pct = (cost_delta_usd / base_res["optimized_cost_usd"] * 100) if base_res["optimized_cost_usd"] > 0 else 0
    
    return ScenarioResponse(
        baseline=base_response,
        scenario=scen_response,
        cost_delta_usd=cost_delta_usd,
        cost_delta_pct=cost_delta_pct,
        schedule_changes=0 # Simplified for demo
    )
