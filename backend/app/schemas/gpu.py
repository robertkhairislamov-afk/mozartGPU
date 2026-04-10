from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class GpuModelBase(BaseModel):
    name: str
    short_name: str
    vram_gb: int
    tflops_fp16: float
    price_per_hour: Decimal
    vast_filter: dict
    is_available: bool = True


class GpuModelCreate(GpuModelBase):
    pass


class GpuModelUpdate(BaseModel):
    name: str | None = None
    short_name: str | None = None
    vram_gb: int | None = None
    tflops_fp16: float | None = None
    price_per_hour: Decimal | None = None
    vast_filter: dict | None = None
    is_available: bool | None = None


class GpuModelResponse(GpuModelBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
