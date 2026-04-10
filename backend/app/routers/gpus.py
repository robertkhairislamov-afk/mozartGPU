from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import DbDep
from app.models.gpu import GpuModel
from app.schemas.gpu import GpuModelResponse

router = APIRouter()


@router.get("/", response_model=list[GpuModelResponse])
async def list_gpus(db: DbDep) -> list[GpuModel]:
    """List all available GPU models (public, no auth required)."""
    result = await db.execute(
        select(GpuModel).where(GpuModel.is_available == True).order_by(GpuModel.price_per_hour)
    )
    return list(result.scalars().all())


@router.get("/{gpu_id}", response_model=GpuModelResponse)
async def get_gpu(gpu_id: UUID, db: DbDep) -> GpuModel:
    """Get a single GPU model by ID."""
    result = await db.execute(select(GpuModel).where(GpuModel.id == gpu_id))
    gpu: GpuModel | None = result.scalar_one_or_none()

    if gpu is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GPU model not found",
        )
    return gpu
