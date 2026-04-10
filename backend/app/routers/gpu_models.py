"""
GPU models public catalog — GET /api/v1/gpu-models
Seed data upserted at application startup — single source of truth for pricing.
"""
import logging
from decimal import Decimal
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import AsyncSessionLocal
from app.models.gpu import GpuModel

logger = logging.getLogger(__name__)

router = APIRouter()

# -----------------------------------------------------------------------
# Seed data — single source of truth for GPU pricing
# -----------------------------------------------------------------------
_GPU_SEED: list[dict[str, Any]] = [
    {
        "slug": "rtx4090",
        "name": "NVIDIA GeForce RTX 4090",
        "short_name": "RTX 4090",
        "vram_gb": 24,
        "tflops_fp16": 82.6,
        "price_per_hour": Decimal("0.80"),
        "packages": [
            {"hours": 10, "price_usd": "8.00"},
            {"hours": 50, "price_usd": "38.00"},
        ],
        "vast_filter": {"gpu_name": {"eq": "RTX 4090"}},
        "is_available": True,
    },
    {
        "slug": "a100",
        "name": "NVIDIA A100 SXM4 80GB",
        "short_name": "A100",
        "vram_gb": 80,
        "tflops_fp16": 312.0,
        "price_per_hour": Decimal("1.80"),
        "packages": [
            {"hours": 10, "price_usd": "18.00"},
            {"hours": 50, "price_usd": "85.00"},
        ],
        "vast_filter": {"gpu_name": {"eq": "A100_SXM4"}},
        "is_available": True,
    },
    {
        "slug": "h100",
        "name": "NVIDIA H100 SXM5 80GB",
        "short_name": "H100",
        "vram_gb": 80,
        "tflops_fp16": 989.5,
        "price_per_hour": Decimal("2.50"),
        "packages": [
            {"hours": 10, "price_usd": "25.00"},
            {"hours": 50, "price_usd": "120.00"},
        ],
        "vast_filter": {"gpu_name": {"eq": "H100"}},
        "is_available": True,
    },
    {
        "slug": "l40s",
        "name": "NVIDIA L40S",
        "short_name": "L40S",
        "vram_gb": 48,
        "tflops_fp16": 362.0,
        "price_per_hour": Decimal("1.20"),
        "packages": [
            {"hours": 10, "price_usd": "12.00"},
            {"hours": 50, "price_usd": "57.00"},
        ],
        "vast_filter": {"gpu_name": {"eq": "L40S"}},
        "is_available": False,
    },
    {
        "slug": "rtx3090",
        "name": "NVIDIA GeForce RTX 3090",
        "short_name": "RTX 3090",
        "vram_gb": 24,
        "tflops_fp16": 35.6,
        "price_per_hour": Decimal("0.45"),
        "packages": [
            {"hours": 10, "price_usd": "4.50"},
            {"hours": 50, "price_usd": "21.00"},
        ],
        "vast_filter": {"gpu_name": {"eq": "RTX 3090"}},
        "is_available": False,
    },
]


async def seed_gpu_models() -> None:
    """Upsert GPU seed data on startup. Uses ON CONFLICT (slug) DO UPDATE."""
    async with AsyncSessionLocal() as session:
        try:
            for row in _GPU_SEED:
                stmt = (
                    pg_insert(GpuModel)
                    .values(
                        slug=row["slug"],
                        name=row["name"],
                        short_name=row["short_name"],
                        vram_gb=row["vram_gb"],
                        tflops_fp16=row["tflops_fp16"],
                        price_per_hour=row["price_per_hour"],
                        packages=row["packages"],
                        vast_filter=row["vast_filter"],
                        is_available=row["is_available"],
                    )
                    .on_conflict_do_update(
                        index_elements=["slug"],
                        set_={
                            "name": row["name"],
                            "short_name": row["short_name"],
                            "vram_gb": row["vram_gb"],
                            "tflops_fp16": row["tflops_fp16"],
                            "price_per_hour": row["price_per_hour"],
                            "packages": row["packages"],
                            "vast_filter": row["vast_filter"],
                            "is_available": row["is_available"],
                        },
                    )
                )
                await session.execute(stmt)
            await session.commit()
            logger.info("GPU seed data upserted (%d models)", len(_GPU_SEED))
        except Exception:
            await session.rollback()
            logger.exception("Failed to seed GPU models")
            raise


class PackageOut(BaseModel):
    hours: int
    price_usd: str


class GpuModelOut(BaseModel):
    id: str
    slug: str
    name: str
    short_name: str
    vram_gb: int
    tflops_fp16: float
    price_per_hour: str
    packages: list[PackageOut]
    is_available: bool

    model_config = {"from_attributes": True}


@router.get("/", response_model=list[GpuModelOut])
async def list_gpu_models() -> list[dict]:
    """Public catalog — returns all GPU models with package pricing. No auth required."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(GpuModel).order_by(GpuModel.price_per_hour)
        )
        gpus = result.scalars().all()

    return [
        {
            "id": str(g.id),
            "slug": g.slug,
            "name": g.name,
            "short_name": g.short_name,
            "vram_gb": g.vram_gb,
            "tflops_fp16": g.tflops_fp16,
            "price_per_hour": str(g.price_per_hour),
            "packages": g.packages,
            "is_available": g.is_available,
        }
        for g in gpus
    ]
