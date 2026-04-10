import logging
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import CurrentUser, DbDep
from app.models.gpu import GpuModel
from app.models.instance import Instance, InstanceStatus
from app.models.ssh_key import SshKey
from app.schemas.instance import InstanceCreate, InstanceResponse
from app.services import vast_client

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=InstanceResponse, status_code=status.HTTP_201_CREATED)
async def create_instance(
    payload: InstanceCreate,
    current_user: CurrentUser,
    db: DbDep,
) -> Instance:
    """Provision a new GPU instance on vast.ai."""
    # Validate GPU model
    gpu_result = await db.execute(
        select(GpuModel).where(GpuModel.id == payload.gpu_model_id, GpuModel.is_available == True)
    )
    gpu: GpuModel | None = gpu_result.scalar_one_or_none()
    if gpu is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="GPU model not found or unavailable")

    # Validate SSH key belongs to user
    key_result = await db.execute(
        select(SshKey).where(SshKey.id == payload.ssh_key_id, SshKey.user_id == current_user.id)
    )
    ssh_key: SshKey | None = key_result.scalar_one_or_none()
    if ssh_key is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SSH key not found")

    # Search for best vast.ai offer
    try:
        offers = await vast_client.search_offers(
            gpu_filter=gpu.vast_filter,
            disk_gb=50,
        )
    except Exception as exc:
        logger.error("vast.ai search failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not reach vast.ai")

    if not offers:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No GPU offers available")

    best = offers[0]
    provider_cost = Decimal(str(best.get("dph_total", 0)))
    client_cost = Decimal(str(gpu.price_per_hour))

    # Create instance record
    instance = Instance(
        user_id=current_user.id,
        gpu_model_id=gpu.id,
        status=InstanceStatus.creating,
        provider_cost_per_hour=provider_cost,
        client_cost_per_hour=client_cost,
        hours_purchased=payload.hours,
    )
    db.add(instance)
    await db.flush()

    # Rent on vast.ai
    try:
        rent_resp = await vast_client.rent_instance(
            offer_id=best["id"],
            disk_gb=50,
            ssh_key=ssh_key.public_key,
        )
        contract_id = rent_resp.get("new_contract") or rent_resp.get("id")
        if contract_id:
            instance.vast_instance_id = str(contract_id)
    except Exception as exc:
        logger.error("vast.ai rent failed: %s", exc)
        instance.status = InstanceStatus.error
        await db.commit()
        raise HTTPException(status_code=502, detail=f"GPU provisioning failed: {exc}")

    await db.commit()
    await db.refresh(instance)
    return instance


@router.get("/", response_model=list[InstanceResponse])
async def list_instances(current_user: CurrentUser, db: DbDep) -> list[Instance]:
    """List all instances for the authenticated user."""
    result = await db.execute(
        select(Instance)
        .where(Instance.user_id == current_user.id)
        .order_by(Instance.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/{instance_id}", response_model=InstanceResponse)
async def get_instance(instance_id: UUID, current_user: CurrentUser, db: DbDep) -> Instance:
    """Get a single instance by ID (must belong to the authenticated user)."""
    result = await db.execute(
        select(Instance).where(Instance.id == instance_id, Instance.user_id == current_user.id)
    )
    instance: Instance | None = result.scalar_one_or_none()
    if instance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instance not found")
    return instance


@router.delete("/{instance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def destroy_instance(instance_id: UUID, current_user: CurrentUser, db: DbDep) -> None:
    """Destroy a GPU instance on vast.ai and mark it as destroyed."""
    result = await db.execute(
        select(Instance).where(Instance.id == instance_id, Instance.user_id == current_user.id)
    )
    instance: Instance | None = result.scalar_one_or_none()
    if instance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instance not found")

    if instance.status == InstanceStatus.destroyed:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Instance already destroyed")

    if instance.vast_instance_id:
        try:
            await vast_client.destroy_instance(instance.vast_instance_id)
        except Exception as exc:
            logger.error("vast.ai destroy failed for %s: %s", instance.vast_instance_id, exc)
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Failed to destroy on vast.ai")

    instance.status = InstanceStatus.destroyed
