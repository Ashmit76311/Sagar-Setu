"""
Sagar Setu — Cargo Orders Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from api.database import get_db
from api.models import CargoOrder, User, UserRole
from api.schemas import CargoOrderCreate, CargoOrderResponse, CargoOrderUpdate
from api.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/cargo-orders", tags=["cargo-orders"])

@router.get("", response_model=List[CargoOrderResponse])
async def get_cargo_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(CargoOrder).options(selectinload(CargoOrder.plant), selectinload(CargoOrder.commodity))
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=CargoOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_cargo_order(
    order_in: CargoOrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.PROCUREMENT_PLANNER, UserRole.ADMIN]))
):
    order = CargoOrder(**order_in.model_dump(), created_by=current_user.id)
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    # Reload with relations for the response
    query = select(CargoOrder).options(selectinload(CargoOrder.plant), selectinload(CargoOrder.commodity)).where(CargoOrder.id == order.id)
    result = await db.execute(query)
    return result.scalar_one()

@router.get("/{order_id}", response_model=CargoOrderResponse)
async def get_cargo_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(CargoOrder).options(selectinload(CargoOrder.plant), selectinload(CargoOrder.commodity)).where(CargoOrder.id == order_id)
    result = await db.execute(query)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Cargo order not found")
    return order
