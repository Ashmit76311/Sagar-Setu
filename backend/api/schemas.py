"""
Sagar Setu — Pydantic Schemas (Request/Response Models)
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, List, Any
from uuid import UUID


# ──────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., max_length=160)
    password: str = Field(..., min_length=6)
    role: str = "viewer"
    organization: Optional[str] = None


# ──────────────────────────────────────────────
# Users
# ──────────────────────────────────────────────

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    organization: Optional[str] = None
    created_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    organization: Optional[str] = None
    is_active: Optional[bool] = None


# ──────────────────────────────────────────────
# Plants
# ──────────────────────────────────────────────

class PlantResponse(BaseModel):
    id: UUID
    name: str
    organization: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Commodities
# ──────────────────────────────────────────────

class CommodityResponse(BaseModel):
    id: UUID
    name: str
    category: Optional[str] = None
    unit: str

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Ports
# ──────────────────────────────────────────────

class PortResponse(BaseModel):
    id: UUID
    name: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_draft_m: Optional[float] = None
    berth_capacity_per_week: Optional[int] = None
    avg_congestion_days: Optional[float] = None

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Vessels
# ──────────────────────────────────────────────

class VesselResponse(BaseModel):
    id: UUID
    imo_number: str
    name: str
    vessel_type: str
    dwt_capacity: int
    current_position_lat: Optional[float] = None
    current_position_lon: Optional[float] = None
    status: str

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

class RouteResponse(BaseModel):
    id: UUID
    origin_port_id: UUID
    destination_port_id: UUID
    distance_nm: Optional[int] = None
    typical_transit_days: Optional[float] = None
    origin_port: Optional[PortResponse] = None
    destination_port: Optional[PortResponse] = None

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Freight Rates
# ──────────────────────────────────────────────

class FreightRateResponse(BaseModel):
    id: int
    route_id: UUID
    vessel_type: str
    date: date
    rate_usd_per_ton: float
    source: Optional[str] = None

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Freight Forecasts
# ──────────────────────────────────────────────

class ForecastRequest(BaseModel):
    route_id: UUID
    vessel_type: str
    horizon: int = Field(30, description="Forecast horizon in days (7, 30, or 90)")


class ForecastPointResponse(BaseModel):
    forecast_date: date
    predicted_rate: float
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None

    model_config = {"from_attributes": True}


class ForecastResponse(BaseModel):
    route_id: UUID
    vessel_type: str
    horizon_days: int
    model_version: str
    generated_at: datetime
    current_rate: Optional[float] = None
    forecast_points: List[ForecastPointResponse]


# ──────────────────────────────────────────────
# Cargo Orders
# ──────────────────────────────────────────────

class CargoOrderCreate(BaseModel):
    plant_id: UUID
    commodity_id: UUID
    quantity_tons: int = Field(..., gt=0)
    origin_country: str
    required_by_date: date


class CargoOrderUpdate(BaseModel):
    quantity_tons: Optional[int] = None
    origin_country: Optional[str] = None
    required_by_date: Optional[date] = None
    status: Optional[str] = None


class CargoOrderResponse(BaseModel):
    id: UUID
    plant_id: UUID
    commodity_id: UUID
    quantity_tons: int
    origin_country: str
    required_by_date: date
    status: str
    created_by: Optional[UUID] = None
    created_at: datetime
    plant: Optional[PlantResponse] = None
    commodity: Optional[CommodityResponse] = None

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Charter Contracts
# ──────────────────────────────────────────────

class CharterContractCreate(BaseModel):
    cargo_order_id: Optional[UUID] = None
    vessel_id: Optional[UUID] = None
    route_id: Optional[UUID] = None
    charter_type: str
    rate_agreed_usd_per_ton: float = Field(..., gt=0)
    laycan_start: Optional[date] = None
    laycan_end: Optional[date] = None


class CharterContractUpdate(BaseModel):
    vessel_id: Optional[UUID] = None
    route_id: Optional[UUID] = None
    charter_type: Optional[str] = None
    rate_agreed_usd_per_ton: Optional[float] = None
    laycan_start: Optional[date] = None
    laycan_end: Optional[date] = None
    status: Optional[str] = None


class CharterContractResponse(BaseModel):
    id: UUID
    cargo_order_id: Optional[UUID] = None
    vessel_id: Optional[UUID] = None
    route_id: Optional[UUID] = None
    charter_type: str
    rate_agreed_usd_per_ton: float
    laycan_start: Optional[date] = None
    laycan_end: Optional[date] = None
    status: str
    created_by: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Vessel Recommendation
# ──────────────────────────────────────────────

class VesselRecommendationRequest(BaseModel):
    cargo_order_id: UUID


class VesselRecommendation(BaseModel):
    vessel_type: str
    charter_type: str
    projected_rate_usd_per_ton: float
    total_estimated_cost_usd: float
    confidence: float = Field(..., ge=0, le=1)
    reasoning: str
    is_best_value: bool = False


class VesselRecommendationResponse(BaseModel):
    cargo_order_id: UUID
    recommendations: List[VesselRecommendation]


# ──────────────────────────────────────────────
# Procurement Optimizer
# ──────────────────────────────────────────────

class OptimizationRequest(BaseModel):
    plant_ids: List[UUID]
    horizon_days: int = Field(90, ge=7, le=365)


class ScheduleItem(BaseModel):
    cargo_order_id: Optional[UUID] = None
    commodity: str
    quantity_tons: int
    vessel_type: str
    charter_type: str
    charter_window_start: date
    charter_window_end: date
    port: str
    eta: date
    estimated_cost_usd: float


class OptimizationResponse(BaseModel):
    plant_ids: List[UUID]
    horizon_days: int
    schedule: List[ScheduleItem]
    baseline_cost_usd: float
    optimized_cost_usd: float
    savings_pct: float
    generated_at: datetime


# ──────────────────────────────────────────────
# Scenario Simulator
# ──────────────────────────────────────────────

class ScenarioRequest(BaseModel):
    bunker_price_delta_pct: float = Field(0, ge=-50, le=100)
    congestion_delta_days: float = Field(0, ge=-10, le=30)
    rate_shock_pct: float = Field(0, ge=-50, le=100)
    plant_ids: Optional[List[UUID]] = None
    horizon_days: int = Field(90, ge=7, le=365)


class ScenarioResponse(BaseModel):
    baseline: OptimizationResponse
    scenario: OptimizationResponse
    cost_delta_usd: float
    cost_delta_pct: float
    schedule_changes: int


# ──────────────────────────────────────────────
# Alerts
# ──────────────────────────────────────────────

class AlertResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    related_route_id: Optional[UUID] = None
    related_contract_id: Optional[UUID] = None
    message: str
    severity: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertUpdate(BaseModel):
    is_read: Optional[bool] = None


# ──────────────────────────────────────────────
# Dashboard KPIs
# ──────────────────────────────────────────────

class DashboardKPIs(BaseModel):
    active_contracts: int
    avg_freight_trend_pct: float
    upcoming_laycans: int
    open_alerts: int
    total_cargo_orders: int
    pending_orders: int
    total_savings_usd: Optional[float] = None


# Fix forward references
TokenResponse.model_rebuild()
