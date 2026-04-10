import logging
from datetime import UTC, datetime, timezone
from decimal import Decimal

import httpx
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.config import settings
from app.deps import CurrentUser, DbDep
from app.models.billing import Invoice, InvoiceStatus
from app.models.instance import Instance, InstanceStatus
from app.schemas.billing import (
    BalanceItem,
    BalanceResponse,
    DepositRequest,
    DepositResponse,
    InvoiceResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# GPU_PACKAGES mirrors auto_provision.py — package_id → price in USD
_PACKAGE_PRICES: dict[str, Decimal] = {
    "rtx4090_10h": Decimal("8.00"),
    "rtx4090_50h": Decimal("38.00"),
    "a100_10h":    Decimal("18.00"),
    "a100_50h":    Decimal("85.00"),
    "h100_10h":    Decimal("25.00"),
    "h100_50h":    Decimal("120.00"),
}


async def _create_btcpay_invoice(
    amount_usd: Decimal,
    package_id: str,
    buyer_email: str,
) -> dict:
    """Call BTCPay Server to create a new invoice."""
    url = f"{settings.btcpay_url}/api/v1/stores/{settings.btcpay_store_id}/invoices"
    headers = {
        "Authorization": f"token {settings.btcpay_api_key}",
        "Content-Type": "application/json",
    }
    body = {
        "amount": str(amount_usd),
        "currency": "USD",
        "metadata": {
            "packageId": package_id,
            "buyerEmail": buyer_email,
        },
        "checkout": {"expirationMinutes": 60},
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, headers=headers, json=body)
        resp.raise_for_status()
        return resp.json()


@router.post("/deposit", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
async def create_deposit(
    payload: DepositRequest,
    current_user: CurrentUser,
    db: DbDep,
) -> DepositResponse:
    """Create a BTCPay invoice for a GPU package deposit."""
    amount = _PACKAGE_PRICES.get(payload.package_id)
    if amount is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown package_id: {payload.package_id}",
        )

    buyer_email = payload.email or current_user.email

    try:
        btcpay_data = await _create_btcpay_invoice(amount, payload.package_id, buyer_email)
    except httpx.HTTPStatusError as exc:
        logger.error("BTCPay invoice creation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Payment provider unavailable",
        )

    btcpay_id: str = btcpay_data["id"]

    invoice = Invoice(
        user_id=current_user.id,
        btcpay_invoice_id=btcpay_id,
        amount_usd=amount,
        status=InvoiceStatus.pending,
        package_id=payload.package_id,
        metadata_=btcpay_data,
    )
    db.add(invoice)
    await db.flush()

    checkout_link: str = btcpay_data.get("checkoutLink", "")
    expires_at_str = btcpay_data.get("expirationTime")
    expires_at = None
    if expires_at_str is not None:
        try:
            expires_at = datetime.fromtimestamp(int(expires_at_str), tz=timezone.utc)
        except (ValueError, TypeError):
            expires_at = None

    return DepositResponse(
        invoice_id=btcpay_id,
        checkout_url=checkout_link,
        amount_usd=amount,
        package_id=payload.package_id,
        expires_at=expires_at,
    )


@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_invoices(current_user: CurrentUser, db: DbDep) -> list[Invoice]:
    """List all invoices for the authenticated user."""
    result = await db.execute(
        select(Invoice)
        .where(Invoice.user_id == current_user.id)
        .order_by(Invoice.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/balance", response_model=BalanceResponse)
async def get_balance(current_user: CurrentUser, db: DbDep) -> BalanceResponse:
    """Return hours remaining per active/running instance and total spend."""
    # Fetch non-destroyed instances with their GPU model
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Instance)
        .options(selectinload(Instance.gpu_model))
        .where(
            Instance.user_id == current_user.id,
            Instance.status.in_([InstanceStatus.creating, InstanceStatus.running, InstanceStatus.stopped]),
        )
    )
    instances = result.scalars().all()

    items: list[BalanceItem] = []
    for inst in instances:
        remaining = Decimal(str(inst.hours_purchased)) - inst.hours_used
        items.append(
            BalanceItem(
                gpu_short_name=inst.gpu_model.short_name,
                hours_purchased=inst.hours_purchased,
                hours_used=inst.hours_used,
                hours_remaining=remaining,
            )
        )

    # Total spent = sum of settled invoices
    inv_result = await db.execute(
        select(Invoice).where(
            Invoice.user_id == current_user.id,
            Invoice.status == InvoiceStatus.settled,
        )
    )
    settled = inv_result.scalars().all()
    total_spent = sum((i.amount_usd for i in settled), Decimal("0"))

    return BalanceResponse(items=items, total_spent_usd=total_spent)
