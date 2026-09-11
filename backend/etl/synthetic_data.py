"""
Sagar Setu — Synthetic Data Generator
Generates realistic dummy data for the SIH demo.
"""

import random
import uuid
from datetime import datetime, date, timedelta
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession
from api.models import (
    User, Plant, Commodity, Port, Vessel, Route, FreightRateHistorical,
    BunkerPrice, CargoOrder, UserRole, VesselType, FuelType
)
from api.auth import hash_password

fake = Faker()

# ──────────────────────────────────────────────
# Static Seed Data Definitions
# ──────────────────────────────────────────────

DEMO_USERS = [
    {"name": "Admin User", "email": "admin@sagarsetu.gov.in", "role": UserRole.ADMIN, "org": "Ministry of Steel"},
    {"name": "Chartering Officer", "email": "charter@sail.gov.in", "role": UserRole.CHARTERING_OFFICER, "org": "SAIL"},
    {"name": "Procurement Planner", "email": "planner@sail.gov.in", "role": UserRole.PROCUREMENT_PLANNER, "org": "SAIL"},
    {"name": "Ministry Viewer", "email": "viewer@steel.gov.in", "role": UserRole.VIEWER, "org": "Ministry of Steel"},
]

PLANTS = [
    {"name": "Bhilai Steel Plant (BSP)", "org": "SAIL", "loc": "Chhattisgarh", "lat": 21.19, "lon": 81.38},
    {"name": "Rourkela Steel Plant (RSP)", "org": "SAIL", "loc": "Odisha", "lat": 22.21, "lon": 84.88},
    {"name": "Durgapur Steel Plant (DSP)", "org": "SAIL", "loc": "West Bengal", "lat": 23.55, "lon": 87.31},
    {"name": "Visakhapatnam Steel Plant", "org": "RINL", "loc": "Andhra Pradesh", "lat": 17.62, "lon": 83.16},
]

COMMODITIES = [
    {"name": "Coking Coal", "cat": "Raw Material"},
    {"name": "Thermal Coal", "cat": "Fuel"},
    {"name": "Limestone", "cat": "Raw Material"},
    {"name": "Dolomite", "cat": "Raw Material"},
]

INDIAN_PORTS = [
    {"name": "Paradip Port", "country": "India", "draft": 14.5, "cap": 5, "lat": 20.26, "lon": 86.67},
    {"name": "Visakhapatnam Port", "country": "India", "draft": 14.0, "cap": 4, "lat": 17.69, "lon": 83.27},
    {"name": "Gangavaram Port", "country": "India", "draft": 21.0, "cap": 3, "lat": 17.61, "lon": 83.23},
    {"name": "Dhamra Port", "country": "India", "draft": 18.0, "cap": 3, "lat": 20.82, "lon": 86.96},
    {"name": "Haldia Dock Complex", "country": "India", "draft": 7.5, "cap": 4, "lat": 22.02, "lon": 88.06},
]

OVERSEAS_PORTS = [
    {"name": "Hay Point", "country": "Australia", "draft": 16.5, "cap": 5, "lat": -21.27, "lon": 149.29},
    {"name": "Gladstone", "country": "Australia", "draft": 16.0, "cap": 5, "lat": -23.83, "lon": 151.25},
    {"name": "Richards Bay", "country": "South Africa", "draft": 17.5, "cap": 6, "lat": -28.79, "lon": 32.09},
    {"name": "Samarinda", "country": "Indonesia", "draft": 12.0, "cap": 4, "lat": -0.52, "lon": 117.15},
    {"name": "Maputo", "country": "Mozambique", "draft": 11.0, "cap": 2, "lat": -25.97, "lon": 32.56},
]


async def generate_synthetic_data(db: AsyncSession):
    """Populates the database with realistic synthetic data."""
    print("Seeding Users...")
    users = []
    for u in DEMO_USERS:
        user = User(
            name=u["name"],
            email=u["email"],
            password_hash=hash_password(u["email"].split("@")[0] + "123"), # password = email_prefix + 123
            role=u["role"],
            organization=u["org"]
        )
        db.add(user)
        users.append(user)
    await db.flush()

    print("Seeding Plants & Commodities...")
    plants = []
    for p in PLANTS:
        plant = Plant(name=p["name"], organization=p["org"], location=p["loc"], latitude=p["lat"], longitude=p["lon"])
        db.add(plant)
        plants.append(plant)
    
    commodities = []
    for c in COMMODITIES:
        comm = Commodity(name=c["name"], category=c["cat"])
        db.add(comm)
        commodities.append(comm)
    await db.flush()

    print("Seeding Ports...")
    indian_ports = []
    for p in INDIAN_PORTS:
        port = Port(name=p["name"], country=p["country"], max_draft_m=p["draft"], 
                    berth_capacity_per_week=p["cap"], latitude=p["lat"], longitude=p["lon"])
        db.add(port)
        indian_ports.append(port)
        
    overseas_ports = []
    for p in OVERSEAS_PORTS:
        port = Port(name=p["name"], country=p["country"], max_draft_m=p["draft"], 
                    berth_capacity_per_week=p["cap"], latitude=p["lat"], longitude=p["lon"])
        db.add(port)
        overseas_ports.append(port)
    await db.flush()

    print("Seeding Routes...")
    routes = []
    for o_port in overseas_ports:
        for d_port in indian_ports:
            # Fake distance between 2000 and 6000 NM based on geography roughly
            dist = random.randint(2500, 5500) if o_port.country == "Australia" else random.randint(1500, 3500)
            transit_days = dist / (12 * 24) # assuming 12 knots average speed
            route = Route(origin_port_id=o_port.id, destination_port_id=d_port.id, distance_nm=dist, typical_transit_days=transit_days)
            db.add(route)
            routes.append(route)
    await db.flush()

    print("Seeding Vessels...")
    vessels = []
    vessel_types = [(VesselType.CAPESIZE, 150000, 180000), (VesselType.PANAMAX, 65000, 85000), 
                    (VesselType.SUPRAMAX, 50000, 60000), (VesselType.HANDYSIZE, 25000, 40000)]
    for i in range(30):
        v_type, min_dwt, max_dwt = random.choice(vessel_types)
        vessel = Vessel(
            imo_number=str(fake.unique.random_number(digits=7, fix_len=True)),
            name=f"MV {fake.last_name()}",
            vessel_type=v_type,
            dwt_capacity=random.randint(min_dwt, max_dwt)
        )
        db.add(vessel)
        vessels.append(vessel)
    await db.flush()

    print("Seeding Historical Freight Rates (2 years)...")
    end_date = date.today()
    start_date = end_date - timedelta(days=730)
    
    for route in routes:
        for v_type in [VesselType.CAPESIZE, VesselType.PANAMAX, VesselType.SUPRAMAX]:
            # Base rate varies by distance and vessel size (bigger vessel = cheaper per ton usually)
            base_rate = (route.distance_nm / 1000) * random.uniform(2.5, 4.0)
            if v_type == VesselType.CAPESIZE: base_rate *= 0.8
            if v_type == VesselType.SUPRAMAX: base_rate *= 1.2
            
            curr_date = start_date
            curr_rate = base_rate
            
            rates = []
            # Weekly data to save DB size, but pretend it's daily patterns
            while curr_date <= end_date:
                # Random walk with mean reversion
                curr_rate += random.uniform(-0.5, 0.5)
                curr_rate = max(curr_rate, base_rate * 0.5) # floor
                curr_rate = min(curr_rate, base_rate * 2.0) # ceiling
                
                rates.append(FreightRateHistorical(
                    route_id=route.id,
                    vessel_type=v_type,
                    date=curr_date,
                    rate_usd_per_ton=round(curr_rate, 2)
                ))
                curr_date += timedelta(days=7)
            db.add_all(rates)
    await db.flush()

    print("Seeding Cargo Orders...")
    orders = []
    for _ in range(25):
        plant = random.choice(plants)
        commodity = random.choice(commodities)
        origin = random.choice(["Australia", "Indonesia", "South Africa", "Mozambique"])
        qty = random.choice([40000, 60000, 80000, 150000])
        req_date = date.today() + timedelta(days=random.randint(15, 90))
        
        order = CargoOrder(
            plant_id=plant.id,
            commodity_id=commodity.id,
            quantity_tons=qty,
            origin_country=origin,
            required_by_date=req_date,
            created_by=users[2].id # Procurement Planner
        )
        db.add(order)
        orders.append(order)
        
    await db.commit()
    print("Synthetic data generation complete!")
