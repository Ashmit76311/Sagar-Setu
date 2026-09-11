"""
Sagar Setu — Plants, Ports, Vessels, Commodities Routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from api.database import get_db
from api.models import Plant, Port, Vessel, Commodity
from api.schemas import PlantResponse, PortResponse, VesselResponse, CommodityResponse
from api.auth import get_current_user

router = APIRouter(tags=["reference-data"])

@router.get("/api/plants", response_model=List[PlantResponse])
async def get_plants(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(select(Plant))
    return result.scalars().all()

@router.get("/api/ports", response_model=List[PortResponse])
async def get_ports(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(select(Port))
    return result.scalars().all()

@router.get("/api/vessels", response_model=List[VesselResponse])
async def get_vessels(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(select(Vessel))
    return result.scalars().all()

@router.get("/api/commodities", response_model=List[CommodityResponse])
async def get_commodities(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(select(Commodity))
    return result.scalars().all()
