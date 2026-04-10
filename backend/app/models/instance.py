import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.gpu import GpuModel


class InstanceStatus(str, enum.Enum):
    creating = "creating"
    running = "running"
    stopped = "stopped"
    error = "error"
    destroyed = "destroyed"


class Instance(Base):
    __tablename__ = "instances"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    gpu_model_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("gpu_models.id"), nullable=False
    )
    status: Mapped[InstanceStatus] = mapped_column(
        Enum(InstanceStatus), nullable=False, default=InstanceStatus.creating
    )
    vast_instance_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    ssh_host: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ssh_port: Mapped[int | None] = mapped_column(Integer, nullable=True)
    provider_cost_per_hour: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    client_cost_per_hour: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    hours_purchased: Mapped[int] = mapped_column(Integer, nullable=False)
    hours_used: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=Decimal("0.00")
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    stopped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="instances")
    gpu_model: Mapped["GpuModel"] = relationship(back_populates="instances")
