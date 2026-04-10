from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Float, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSON, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.instance import Instance


class GpuModel(Base):
    __tablename__ = "gpu_models"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    short_name: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    vram_gb: Mapped[int] = mapped_column(Integer, nullable=False)
    tflops_fp16: Mapped[float] = mapped_column(Float, nullable=False)
    # Our selling price to the client
    price_per_hour: Mapped[Decimal] = mapped_column(
        Numeric(10, 4), nullable=False
    )
    # Filter dict used when searching vast.ai offers
    vast_filter: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    instances: Mapped[list["Instance"]] = relationship(back_populates="gpu_model")
