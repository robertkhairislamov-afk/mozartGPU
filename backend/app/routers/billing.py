import hashlib
import hmac
import json
import logging
from datetime import datetime, timezone
from decimal import Decimal

import httpx
from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.config import settings
from app.deps import CurrentUser, DbDep
from app.models.billing import Invoice, InvoiceStatus
from app.models.gpu import GpuModel
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

NOWPAYMENTS_HEADERS = {
    "x-api-key": settings.nowpayments_api_key,
    "Content-Type": "application/json",
}


# ---------------------------------------------------------------------------
# Pricing lookup — single source of truth from gpu_models table
# ---------------------------------------------------------------------------

async def _resolve_package_price(package_id: str, db) -> Decimal:
    """
    Look up the price for a package_id from the gpu_models table.
    package_id format: "{slug}_{hours}h"  e.g. "h100_10h", "rtx4090_50h"
    """
    try:
        slug, hours_part = package_id.rsplit("_", 1)
        if not hours_part.endswith("h"):
            raise ValueError("missing 'h' suffix")
        hours = int(hours_part[:-1])
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid package_id format: '{package_id}'. Expected '{{slug}}_{{hours}}h'.",
        )

    result = await db.execute(
        select(GpuModel).where(GpuModel.slug == slug)
    )
    gpu = result.scalar_one_or_none()

    if gpu is None or not gpu.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown or unavailable GPU: '{slug}'",
        )

    for pkg in gpu.packages:
        if pkg.get("hours") == hours:
            return Decimal(pkg["price_usd"])

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Package '{package_id}' not found. "
               f"Available: {[slug + '_' + str(p['hours']) + 'h' for p in gpu.packages]}",
    )


# ---------------------------------------------------------------------------
# NOWPayments — invoice creation
# ---------------------------------------------------------------------------

async def _create_nowpayments_invoice(
    amount_usd: Decimal,
    order_id: str,
    package_id: str,
) -> dict:
    """Create a NOWPayments invoice. Returns dict with id, invoice_url, etc."""
    url = f"{settings.nowpayments_api_url}/invoice"
    body = {
        "price_amount": float(amount_usd),
        "price_currency": "usd",
        "order_id": order_id,
        "order_description": f"GPU rental — {package_id}",
        "ipn_callback_url": f"https://web3playlab.win/api/v1/billing/webhook/nowpayments",
        "success_url": "https://web3playlab.win/console/billing?paid=1",
        "cancel_url": "https://web3playlab.win/console/billing?cancelled=1",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, headers=NOWPAYMENTS_HEADERS, json=body)
        resp.raise_for_status()
        return resp.json()


# ---------------------------------------------------------------------------
# NOWPayments — server-side payment verification
# ---------------------------------------------------------------------------

async def _verify_payment_with_nowpayments(payment_id: int | str) -> dict | None:
    """Call NOWPayments API to independently verify a payment status."""
    url = f"{settings.nowpayments_api_url}/payment/{payment_id}"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=NOWPAYMENTS_HEADERS)
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        logger.error("NOWPayments verification failed for %s: %s", payment_id, exc)
        return None


# ---------------------------------------------------------------------------
# NOWPayments — HMAC-SHA512 signature verification
# ---------------------------------------------------------------------------

def _verify_nowpayments_signature(raw_body: bytes, sig_header: str) -> bool:
    """Verify x-nowpayments-sig HMAC-SHA512 signature (sorted JSON keys)."""
    if not settings.nowpayments_ipn_secret:
        return False
    payload = json.loads(raw_body)
    sorted_payload = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    computed = hmac.new(
        settings.nowpayments_ipn_secret.encode(),
        sorted_payload.encode(),
        hashlib.sha512,
    ).hexdigest()
    return hmac.compare_digest(computed, sig_header)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/deposit", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
async def create_deposit(
    payload: DepositRequest,
    current_user: CurrentUser,
    db: DbDep,
) -> DepositResponse:
    """Create a NOWPayments invoice for a GPU package deposit."""
    amount = await _resolve_package_price(payload.package_id, db)

    # Use invoice DB id as order_id for traceability
    invoice = Invoice(
        user_id=current_user.id,
        btcpay_invoice_id="pending",  # placeholder, updated below
        amount_usd=amount,
        status=InvoiceStatus.pending,
        package_id=payload.package_id,
        metadata_={},
    )
    db.add(invoice)
    await db.flush()

    order_id = str(invoice.id)

    try:
        np_data = await _create_nowpayments_invoice(amount, order_id, payload.package_id)
    except httpx.HTTPStatusError as exc:
        logger.error("NOWPayments invoice creation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Payment provider unavailable",
        )

    # Store NOWPayments invoice ID and full response
    np_invoice_id = str(np_data["id"])
    invoice.btcpay_invoice_id = np_invoice_id
    invoice.metadata_ = np_data
    await db.flush()

    checkout_url: str = np_data.get("invoice_url", "")

    return DepositResponse(
        invoice_id=np_invoice_id,
        checkout_url=checkout_url,
        amount_usd=amount,
        package_id=payload.package_id,
        expires_at=None,
    )


# ---------------------------------------------------------------------------
# NOWPayments IPN webhook
# ---------------------------------------------------------------------------

@router.post("/webhook/nowpayments", status_code=status.HTTP_200_OK)
async def nowpayments_webhook(request: Request, db: DbDep) -> dict:
    """Receive NOWPayments IPN, verify HMAC-SHA512, update Invoice status."""
    raw_body = await request.body()

    if len(raw_body) > 16384:
        raise HTTPException(status_code=413, detail="Payload too large")

    # Verify HMAC-SHA512 signature
    sig_header = request.headers.get("x-nowpayments-sig", "")
    if not settings.nowpayments_ipn_secret:
        logger.error("NOWPAYMENTS_IPN_SECRET not configured — rejecting")
        raise HTTPException(status_code=500, detail="IPN secret not configured")

    if not sig_header:
        raise HTTPException(status_code=401, detail="Missing signature")

    if not _verify_nowpayments_signature(raw_body, sig_header):
        logger.warning("NOWPayments IPN signature verification failed")
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = json.loads(raw_body)
    payment_status = payload.get("payment_status", "")
    payment_id = payload.get("payment_id")
    order_id = payload.get("order_id", "")
    logger.info("NOWPayments IPN: status=%s payment_id=%s order_id=%s", payment_status, payment_id, order_id)

    if not payment_id:
        return {"status": "error", "detail": "missing payment_id"}

    # Handle terminal failure statuses
    if payment_status in ("expired", "failed", "refunded"):
        if order_id:
            result = await db.execute(
                select(Invoice).where(Invoice.id == order_id).with_for_update()
            )
            invoice = result.scalar_one_or_none()
            if invoice and invoice.status == InvoiceStatus.pending:
                invoice.status = (
                    InvoiceStatus.expired if payment_status == "expired"
                    else InvoiceStatus.invalid
                )
                await db.commit()
                logger.info("Invoice %s marked as %s", order_id, invoice.status.value)
        return {"status": payment_status}

    # Only process "finished" (funds received on our wallet)
    if payment_status != "finished":
        return {"status": "ignored", "payment_status": payment_status}

    # Find invoice by order_id (our internal invoice UUID)
    if not order_id:
        logger.warning("NOWPayments IPN finished but no order_id")
        return {"status": "error", "detail": "missing order_id"}

    result = await db.execute(
        select(Invoice).where(Invoice.id == order_id).with_for_update()
    )
    invoice = result.scalar_one_or_none()

    if invoice is None:
        logger.warning("Invoice %s not found in DB", order_id)
        return {"status": "not_found", "order_id": order_id}

    if invoice.status == InvoiceStatus.settled:
        return {"status": "duplicate", "order_id": order_id}

    # Server-side verification: call NOWPayments API to confirm
    verified_data = await _verify_payment_with_nowpayments(payment_id)
    if verified_data:
        api_status = verified_data.get("payment_status", "")
        if api_status != "finished":
            logger.warning(
                "Invoice %s: IPN says finished but API says '%s' — rejecting",
                order_id, api_status,
            )
            return {"status": "verification_failed", "api_status": api_status}

        # Verify amount (price_amount is in USD)
        api_amount = Decimal(str(verified_data.get("price_amount", "0")))
        if api_amount > 0 and api_amount != invoice.amount_usd:
            logger.error(
                "Invoice %s: amount mismatch — expected $%s, API says $%s",
                order_id, invoice.amount_usd, api_amount,
            )
            return {"status": "amount_mismatch", "order_id": order_id}
    else:
        logger.warning("Invoice %s: NOWPayments verification unavailable, proceeding with HMAC-only", order_id)

    # Mark as settled
    invoice.status = InvoiceStatus.settled
    invoice.settled_at = datetime.now(timezone.utc)

    # Update user total_spent_usd
    from app.models.user import User
    user_result = await db.execute(select(User).where(User.id == invoice.user_id))
    user = user_result.scalar_one_or_none()
    if user and hasattr(user, "total_spent_usd"):
        user.total_spent_usd = (user.total_spent_usd or Decimal("0")) + invoice.amount_usd

    await db.commit()
    logger.info("Invoice %s settled via NOWPayments (amount=$%s, payment_id=%s)", order_id, invoice.amount_usd, payment_id)

    return {"status": "settled", "order_id": order_id}


# ---------------------------------------------------------------------------
# Legacy BTCPay webhook — kept for backwards compatibility
# ---------------------------------------------------------------------------

@router.post("/webhook/btcpay", status_code=status.HTTP_200_OK)
async def btcpay_webhook(request: Request) -> dict:
    """Legacy BTCPay endpoint — returns 200 to prevent retries."""
    return {"status": "deprecated", "message": "Use NOWPayments webhook"}


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

    inv_result = await db.execute(
        select(Invoice).where(
            Invoice.user_id == current_user.id,
            Invoice.status == InvoiceStatus.settled,
        )
    )
    settled = inv_result.scalars().all()
    total_spent = sum((i.amount_usd for i in settled), Decimal("0"))

    return BalanceResponse(items=items, total_spent_usd=total_spent)
