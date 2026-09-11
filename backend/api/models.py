"""
Sagar Setu — SQLAlchemy ORM Models
All 14 tables from docs/05_Schema_Document.md
"""

import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Integer, Boolean, Text, Date, DateTime,
    Numeric, Enum, ForeignKey, BigInteger, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from api.database import Base
import enum


# ──────────────────────────────────────────────
# Python Enums (mirror DB ENUM types)
# ──────────────────────────────────────────────

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CHARTERING_OFFICER = "chartering_officer"
    PROCUREMENT_PLANNER = "procurement_planner"
    VIEWER = "viewer"


class VesselType(str, enum.Enum):
    CAPESIZE = "capesize"
    PANAMAX = "panamax"
    SUPRAMAX = "supramax"
    HANDYSIZE = "handysize"


class VesselStatus(str, enum.Enum):
    AVAILABLE = "available"
    ON_CHARTER = "on_charter"
    UNDER_MAINTENANCE = "under_maintenance"


class CargoOrderStatus(str, enum.Enum):
    PENDING = "pending"
    RECOMMENDED = "recommended"
    CONTRACTED = "contracted"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    DELAYED = "delayed"
    CLOSED = "closed"


class CharterTypeEnum(str, enum.Enum):
    VOYAGE = "voyage"
    TIME_CHARTER = "time_charter"
    COA = "coa"


class CharterContractStatus(str, enum.Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    LAYCAN_ACTIVE = "laycan_active"
    LOADING = "loading"
    IN_TRANSIT = "in_transit"
    DISCHARGED = "discharged"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class FuelType(str, enum.Enum):
    IFO380 = "ifo380"
    VLSFO = "vlsfo"


class AlertTypeEnum(str, enum.Enum):
    RATE_MOVE = "rate_move"
    LAYCAN_RISK = "laycan_risk"
    CONGESTION_SPIKE = "congestion_spike"
    SYSTEM = "system"


class AlertSeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class WeatherSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# ──────────────────────────────────────────────
# 1. Users
# ──────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("admin", "chartering_officer", "procurement_planner", "viewer",
                       name="user_role", create_type=False), nullable=False, default="viewer")
    organization = Column(String(120))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    cargo_orders = relationship("CargoOrder", back_populates="creator", foreign_keys="CargoOrder.created_by")
    charter_contracts = relationship("CharterContract", back_populates="creator", foreign_keys="CharterContract.created_by")
    alerts = relationship("Alert", back_populates="user")


# ──────────────────────────────────────────────
# 2. Plants
# ──────────────────────────────────────────────

class Plant(Base):
    __tablename__ = "plants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    organization = Column(String(120), nullable=False)
    location = Column(String(120))
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))

    # Relationships
    cargo_orders = relationship("CargoOrder", back_populates="plant")
    procurement_plans = relationship("ProcurementPlan", back_populates="plant")


# ──────────────────────────────────────────────
# 3. Commodities
# ──────────────────────────────────────────────

class Commodity(Base):
    __tablename__ = "commodities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(80), nullable=False)
    category = Column(String(60))
    unit = Column(String(20), nullable=False, default="metric tons")

    # Relationships
    cargo_orders = relationship("CargoOrder", back_populates="commodity")
    procurement_plans = relationship("ProcurementPlan", back_populates="commodity")


# ──────────────────────────────────────────────
# 4. Ports
# ──────────────────────────────────────────────

class Port(Base):
    __tablename__ = "ports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    country = Column(String(80), nullable=False)
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    max_draft_m = Column(Numeric(5, 2))
    berth_capacity_per_week = Column(Integer)
    avg_congestion_days = Column(Numeric(5, 2), default=0)

    # Relationships
    origin_routes = relationship("Route", back_populates="origin_port", foreign_keys="Route.origin_port_id")
    destination_routes = relationship("Route", back_populates="destination_port", foreign_keys="Route.destination_port_id")
    bunker_prices = relationship("BunkerPrice", back_populates="port")


# ──────────────────────────────────────────────
# 5. Vessels
# ──────────────────────────────────────────────

class Vessel(Base):
    __tablename__ = "vessels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    imo_number = Column(String(20), unique=True, nullable=False)
    name = Column(String(120), nullable=False)
    vessel_type = Column(Enum("capesize", "panamax", "supramax", "handysize",
                              name="vessel_type_enum", create_type=False), nullable=False)
    dwt_capacity = Column(Integer, nullable=False)
    current_position_lat = Column(Numeric(10, 7))
    current_position_lon = Column(Numeric(10, 7))
    status = Column(Enum("available", "on_charter", "under_maintenance",
                         name="vessel_status", create_type=False), nullable=False, default="available")

    # Relationships
    charter_contracts = relationship("CharterContract", back_populates="vessel")


# ──────────────────────────────────────────────
# 6. Routes
# ──────────────────────────────────────────────

class Route(Base):
    __tablename__ = "routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    origin_port_id = Column(UUID(as_uuid=True), ForeignKey("ports.id", ondelete="CASCADE"), nullable=False)
    destination_port_id = Column(UUID(as_uuid=True), ForeignKey("ports.id", ondelete="CASCADE"), nullable=False)
    distance_nm = Column(Integer)
    typical_transit_days = Column(Numeric(5, 1))

    # Relationships
    origin_port = relationship("Port", back_populates="origin_routes", foreign_keys=[origin_port_id])
    destination_port = relationship("Port", back_populates="destination_routes", foreign_keys=[destination_port_id])
    freight_rates = relationship("FreightRateHistorical", back_populates="route")
    freight_forecasts = relationship("FreightForecast", back_populates="route")


# ──────────────────────────────────────────────
# 7. FreightRateHistorical (hypertable)
# ──────────────────────────────────────────────

class FreightRateHistorical(Base):
    __tablename__ = "freight_rates_historical"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    vessel_type = Column(Enum("capesize", "panamax", "supramax", "handysize",
                              name="vessel_type_enum", create_type=False), nullable=False)
    date = Column(Date, nullable=False, primary_key=True)
    rate_usd_per_ton = Column(Numeric(10, 2), nullable=False)
    source = Column(String(60), default="synthetic")

    # Relationships
    route = relationship("Route", back_populates="freight_rates")


# ──────────────────────────────────────────────
# 8. FreightForecast
# ──────────────────────────────────────────────

class FreightForecast(Base):
    __tablename__ = "freight_forecasts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    vessel_type = Column(Enum("capesize", "panamax", "supramax", "handysize",
                              name="vessel_type_enum", create_type=False), nullable=False)
    forecast_generated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    horizon_days = Column(Integer, nullable=False)
    forecast_date = Column(Date, nullable=False)
    predicted_rate = Column(Numeric(10, 2), nullable=False)
    confidence_lower = Column(Numeric(10, 2))
    confidence_upper = Column(Numeric(10, 2))
    model_version = Column(String(40), default="ensemble_v1")

    # Relationships
    route = relationship("Route", back_populates="freight_forecasts")


# ──────────────────────────────────────────────
# 9. BunkerPrice (hypertable)
# ──────────────────────────────────────────────

class BunkerPrice(Base):
    __tablename__ = "bunker_prices"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    port_id = Column(UUID(as_uuid=True), ForeignKey("ports.id", ondelete="CASCADE"), nullable=False)
    fuel_type = Column(Enum("ifo380", "vlsfo", name="fuel_type", create_type=False), nullable=False)
    date = Column(Date, nullable=False, primary_key=True)
    price_usd_per_ton = Column(Numeric(10, 2), nullable=False)

    # Relationships
    port = relationship("Port", back_populates="bunker_prices")


# ──────────────────────────────────────────────
# 10. CargoOrder
# ──────────────────────────────────────────────

class CargoOrder(Base):
    __tablename__ = "cargo_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id = Column(UUID(as_uuid=True), ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    commodity_id = Column(UUID(as_uuid=True), ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False)
    quantity_tons = Column(Integer, nullable=False)
    origin_country = Column(String(80), nullable=False)
    required_by_date = Column(Date, nullable=False)
    status = Column(Enum("pending", "recommended", "contracted", "in_transit",
                         "delivered", "delayed", "closed",
                         name="cargo_order_status", create_type=False), nullable=False, default="pending")
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    plant = relationship("Plant", back_populates="cargo_orders")
    commodity = relationship("Commodity", back_populates="cargo_orders")
    creator = relationship("User", back_populates="cargo_orders", foreign_keys=[created_by])
    charter_contract = relationship("CharterContract", back_populates="cargo_order", uselist=False)


# ──────────────────────────────────────────────
# 11. CharterContract
# ──────────────────────────────────────────────

class CharterContract(Base):
    __tablename__ = "charter_contracts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cargo_order_id = Column(UUID(as_uuid=True), ForeignKey("cargo_orders.id", ondelete="SET NULL"))
    vessel_id = Column(UUID(as_uuid=True), ForeignKey("vessels.id", ondelete="SET NULL"))
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id", ondelete="SET NULL"))
    charter_type = Column(Enum("voyage", "time_charter", "coa",
                               name="charter_type", create_type=False), nullable=False)
    rate_agreed_usd_per_ton = Column(Numeric(10, 2), nullable=False)
    laycan_start = Column(Date)
    laycan_end = Column(Date)
    status = Column(Enum("draft", "confirmed", "laycan_active", "loading", "in_transit",
                         "discharged", "completed", "cancelled",
                         name="charter_contract_status", create_type=False), nullable=False, default="draft")
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    cargo_order = relationship("CargoOrder", back_populates="charter_contract")
    vessel = relationship("Vessel", back_populates="charter_contracts")
    route = relationship("Route")
    creator = relationship("User", back_populates="charter_contracts", foreign_keys=[created_by])


# ──────────────────────────────────────────────
# 12. ProcurementPlan
# ──────────────────────────────────────────────

class ProcurementPlan(Base):
    __tablename__ = "procurement_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id = Column(UUID(as_uuid=True), ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    commodity_id = Column(UUID(as_uuid=True), ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False)
    planning_horizon_start = Column(Date, nullable=False)
    planning_horizon_end = Column(Date, nullable=False)
    recommended_schedule_json = Column(JSON)
    baseline_cost_usd = Column(Numeric(15, 2))
    optimized_cost_usd = Column(Numeric(15, 2))
    savings_pct = Column(Numeric(5, 2))
    generated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    plant = relationship("Plant", back_populates="procurement_plans")
    commodity = relationship("Commodity", back_populates="procurement_plans")


# ──────────────────────────────────────────────
# 13. WeatherEvent
# ──────────────────────────────────────────────

class WeatherEvent(Base):
    __tablename__ = "weather_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    region = Column(String(120), nullable=False)
    event_type = Column(String(60), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    severity = Column(Enum("low", "medium", "high",
                           name="weather_severity", create_type=False), nullable=False, default="low")


# ──────────────────────────────────────────────
# 14. Alert
# ──────────────────────────────────────────────

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum("rate_move", "laycan_risk", "congestion_spike", "system",
                       name="alert_type", create_type=False), nullable=False)
    related_route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id", ondelete="SET NULL"))
    related_contract_id = Column(UUID(as_uuid=True), ForeignKey("charter_contracts.id", ondelete="SET NULL"))
    message = Column(Text, nullable=False)
    severity = Column(Enum("info", "warning", "critical",
                           name="alert_severity", create_type=False), nullable=False, default="info")
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="alerts")
    related_route = relationship("Route")
    related_contract = relationship("CharterContract")
