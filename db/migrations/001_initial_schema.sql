-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Sagar Setu — Database Schema Migration                        ║
-- ║  PostgreSQL 15 + TimescaleDB                                   ║
-- ║  Generated from: docs/05_Schema_Document.md                    ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- ENUM Types
-- ──────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
    'admin',
    'chartering_officer',
    'procurement_planner',
    'viewer'
);

CREATE TYPE vessel_type_enum AS ENUM (
    'capesize',
    'panamax',
    'supramax',
    'handysize'
);

CREATE TYPE vessel_status AS ENUM (
    'available',
    'on_charter',
    'under_maintenance'
);

CREATE TYPE cargo_order_status AS ENUM (
    'pending',
    'recommended',
    'contracted',
    'in_transit',
    'delivered',
    'delayed',
    'closed'
);

CREATE TYPE charter_type AS ENUM (
    'voyage',
    'time_charter',
    'coa'
);

CREATE TYPE charter_contract_status AS ENUM (
    'draft',
    'confirmed',
    'laycan_active',
    'loading',
    'in_transit',
    'discharged',
    'completed',
    'cancelled'
);

CREATE TYPE fuel_type AS ENUM (
    'ifo380',
    'vlsfo'
);

CREATE TYPE alert_type AS ENUM (
    'rate_move',
    'laycan_risk',
    'congestion_spike',
    'system'
);

CREATE TYPE alert_severity AS ENUM (
    'info',
    'warning',
    'critical'
);

CREATE TYPE weather_severity AS ENUM (
    'low',
    'medium',
    'high'
);

-- ──────────────────────────────────────────────
-- 1. users
-- ──────────────────────────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    organization VARCHAR(120),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ──────────────────────────────────────────────
-- 2. plants
-- ──────────────────────────────────────────────
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    organization VARCHAR(120) NOT NULL,
    location VARCHAR(120),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7)
);

-- ──────────────────────────────────────────────
-- 3. commodities
-- ──────────────────────────────────────────────
CREATE TABLE commodities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(80) NOT NULL,
    category VARCHAR(60),
    unit VARCHAR(20) NOT NULL DEFAULT 'metric tons'
);

-- ──────────────────────────────────────────────
-- 4. ports
-- ──────────────────────────────────────────────
CREATE TABLE ports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    country VARCHAR(80) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    max_draft_m DECIMAL(5, 2),
    berth_capacity_per_week INT,
    avg_congestion_days DECIMAL(5, 2) DEFAULT 0
);

-- ──────────────────────────────────────────────
-- 5. vessels
-- ──────────────────────────────────────────────
CREATE TABLE vessels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    imo_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    vessel_type vessel_type_enum NOT NULL,
    dwt_capacity INT NOT NULL,
    current_position_lat DECIMAL(10, 7),
    current_position_lon DECIMAL(10, 7),
    status vessel_status NOT NULL DEFAULT 'available'
);

CREATE INDEX idx_vessels_type ON vessels(vessel_type);
CREATE INDEX idx_vessels_status ON vessels(status);

-- ──────────────────────────────────────────────
-- 6. routes
-- ──────────────────────────────────────────────
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_port_id UUID NOT NULL REFERENCES ports(id) ON DELETE CASCADE,
    destination_port_id UUID NOT NULL REFERENCES ports(id) ON DELETE CASCADE,
    distance_nm INT,
    typical_transit_days DECIMAL(5, 1)
);

CREATE INDEX idx_routes_origin ON routes(origin_port_id);
CREATE INDEX idx_routes_destination ON routes(destination_port_id);

-- ──────────────────────────────────────────────
-- 7. freight_rates_historical (TimescaleDB hypertable)
-- ──────────────────────────────────────────────
CREATE TABLE freight_rates_historical (
    id BIGSERIAL,
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    vessel_type vessel_type_enum NOT NULL,
    date DATE NOT NULL,
    rate_usd_per_ton DECIMAL(10, 2) NOT NULL,
    source VARCHAR(60) DEFAULT 'synthetic',
    PRIMARY KEY (id, date)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('freight_rates_historical', 'date');

-- Composite index: primary query pattern
CREATE INDEX idx_freight_rates_route_type_date
    ON freight_rates_historical(route_id, vessel_type, date DESC);

-- ──────────────────────────────────────────────
-- 8. freight_forecasts
-- ──────────────────────────────────────────────
CREATE TABLE freight_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    vessel_type vessel_type_enum NOT NULL,
    forecast_generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    horizon_days INT NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_rate DECIMAL(10, 2) NOT NULL,
    confidence_lower DECIMAL(10, 2),
    confidence_upper DECIMAL(10, 2),
    model_version VARCHAR(40) DEFAULT 'ensemble_v1'
);

CREATE INDEX idx_forecasts_route_type
    ON freight_forecasts(route_id, vessel_type, forecast_date);

-- ──────────────────────────────────────────────
-- 9. bunker_prices (TimescaleDB hypertable)
-- ──────────────────────────────────────────────
CREATE TABLE bunker_prices (
    id BIGSERIAL,
    port_id UUID NOT NULL REFERENCES ports(id) ON DELETE CASCADE,
    fuel_type fuel_type NOT NULL,
    date DATE NOT NULL,
    price_usd_per_ton DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id, date)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('bunker_prices', 'date');

-- Composite index
CREATE INDEX idx_bunker_prices_port_fuel_date
    ON bunker_prices(port_id, fuel_type, date DESC);

-- ──────────────────────────────────────────────
-- 10. cargo_orders
-- ──────────────────────────────────────────────
CREATE TABLE cargo_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
    quantity_tons INT NOT NULL,
    origin_country VARCHAR(80) NOT NULL,
    required_by_date DATE NOT NULL,
    status cargo_order_status NOT NULL DEFAULT 'pending',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cargo_orders_status ON cargo_orders(status);
CREATE INDEX idx_cargo_orders_plant ON cargo_orders(plant_id);

-- ──────────────────────────────────────────────
-- 11. charter_contracts
-- ──────────────────────────────────────────────
CREATE TABLE charter_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cargo_order_id UUID REFERENCES cargo_orders(id) ON DELETE SET NULL,
    vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL,
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    charter_type charter_type NOT NULL,
    rate_agreed_usd_per_ton DECIMAL(10, 2) NOT NULL,
    laycan_start DATE,
    laycan_end DATE,
    status charter_contract_status NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_charter_contracts_status ON charter_contracts(status);
CREATE INDEX idx_charter_contracts_cargo ON charter_contracts(cargo_order_id);

-- ──────────────────────────────────────────────
-- 12. procurement_plans
-- ──────────────────────────────────────────────
CREATE TABLE procurement_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
    planning_horizon_start DATE NOT NULL,
    planning_horizon_end DATE NOT NULL,
    recommended_schedule_json JSONB,
    baseline_cost_usd DECIMAL(15, 2),
    optimized_cost_usd DECIMAL(15, 2),
    savings_pct DECIMAL(5, 2),
    generated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 13. weather_events
-- ──────────────────────────────────────────────
CREATE TABLE weather_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region VARCHAR(120) NOT NULL,
    event_type VARCHAR(60) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    severity weather_severity NOT NULL DEFAULT 'low'
);

-- ──────────────────────────────────────────────
-- 14. alerts
-- ──────────────────────────────────────────────
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type alert_type NOT NULL,
    related_route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    related_contract_id UUID REFERENCES charter_contracts(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_read ON alerts(user_id, is_read);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- ──────────────────────────────────────────────
-- Done! Schema created successfully.
-- ──────────────────────────────────────────────
