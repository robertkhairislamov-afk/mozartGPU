from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.billing import InvoiceStatus


class DepositRequest(BaseModel):
    package_id: str = Field(description="GPU package key, e.g. 'h100_10h'")
    email: str | None = None


class InvoiceResponse(BaseModel):
    id: UUID
    user_id: UUID
    btcpay_invoice_id: str
    amount_usd: Decimal
    status: InvoiceStatus
    package_id: str
    created_at: datetime
    settled_at: datetime | None

    model_config = {"from_attributes": True}


class BalanceItem(BaseModel):
    gpu_short_name: str
    hours_purchased: int
    hours_used: Decimal
    hours_remaining: Decimal


class BalanceResponse(BaseModel):
    items: list[BalanceItem]
    total_spent_usd: Decimal


class DepositResponse(BaseModel):
    invoice_id: str
    checkout_url: str
    amount_usd: Decimal
    package_id: str
    expires_at: datetime | None
