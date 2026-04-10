from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.instance import InstanceStatus


class InstanceCreate(BaseModel):
    gpu_model_id: UUID
    ssh_key_id: UUID
    hours: int = Field(ge=1, le=720)


class InstanceUpdate(BaseModel):
    status: InstanceStatus | None = None
    vast_instance_id: str | None = None
    ssh_host: str | None = None
    ssh_port: int | None = None
    hours_used: Decimal | None = None


class InstanceResponse(BaseModel):
    id: UUID
    user_id: UUID
    gpu_model_id: UUID
    status: InstanceStatus
    vast_instance_id: str | None
    ssh_host: str | None
    ssh_port: int | None
    provider_cost_per_hour: Decimal
    client_cost_per_hour: Decimal
    hours_purchased: int
    hours_used: Decimal
    started_at: datetime | None
    stopped_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
