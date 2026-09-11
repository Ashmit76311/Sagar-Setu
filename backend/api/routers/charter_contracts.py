"""
Sagar Setu — Charter Contracts Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from api.database import get_db
from api.models import CharterContract, User, UserRole
from api.schemas import CharterContractCreate, CharterContractResponse
from api.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/charter-contracts", tags=["charter-contracts"])

@router.get("", response_model=List[CharterContractResponse])
async def get_charter_contracts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(CharterContract)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=CharterContractResponse, status_code=status.HTTP_201_CREATED)
async def create_charter_contract(
    contract_in: CharterContractCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.CHARTERING_OFFICER, UserRole.ADMIN]))
):
    contract = CharterContract(**contract_in.model_dump(), created_by=current_user.id)
    db.add(contract)
    await db.commit()
    await db.refresh(contract)
    return contract

@router.get("/{contract_id}", response_model=CharterContractResponse)
async def get_charter_contract(
    contract_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(CharterContract).where(CharterContract.id == contract_id))
    contract = result.scalar_one_or_none()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Charter contract not found")
    return contract
