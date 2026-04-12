import hashlib
import hmac
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
# BTCPay invoice creation
# ---------------------------------------------------------------------------

async def _create_btcpay_invoice(
    amount_usd: Decimal,
    package_id: str,
    buyer_email: str,
) -> dict:
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


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/deposit", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
async def create_deposit(
    payload: DepositRequest,
    current_user: CurrentUser,
    db: DbDep,
) -> DepositResponse:
    """Create a BTCPay invoice for a GPU package deposit."""
    amount = await _resolve_package_price(payload.package_id, db)

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


# ---------------------------------------------------------------------------
# BTCPay webhook — receives InvoiceSettled events (баг #3)
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# BTCPay callback verification — confirm invoice status server-side
# ---------------------------------------------------------------------------

async def _verify_invoice_with_btcpay(btcpay_invoice_id: str) -> dict | None:
    """Call BTCPay API to independently verify an invoice's status and amount."""
    if not settings.btcpay_url or not settings.btcpay_api_key:
        return None
    url = f"{settings.btcpay_url}/api/v1/stores/{settings.btcpay_store_id}/invoices/{btcpay_invoice_id}"
    headers = {"Authorization": f"token {settings.btcpay_api_key}"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        logger.error("BTCPay verification call failed for %s: %s", btcpay_invoice_id, exc)
        return None


@router.post("/webhook/btcpay", status_code=status.HTTP_200_OK)
async def btcpay_webhook(request: Request, db: DbDep) -> dict:
    """Receive BTCPay Server webhook, verify HMAC, update Invoice status."""
    raw_body = await request.body()

    if len(raw_body) > 16384:
        raise HTTPException(status_code=413, detail="Payload too large")

    # Verify HMAC-SHA256 signature
    sig_header = request.headers.get("BTCPay-Sig")
    if not settings.btcpay_webhook_secret:
        logger.error("BTCPAY_WEBHOOK_SECRET not configured — rejecting")
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    if not sig_header or not sig_header.startswith("sha256="):
        raise HTTPException(status_code=401, detail="Missing or invalid signature")

    expected_hex = sig_header[len("sha256="):]
    computed = hmac.new(
        settings.btcpay_webhook_secret.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(computed, expected_hex):
        logger.warning("Webhook HMAC verification failed")
        raise HTTPException(status_code=401, detail="Invalid signature")

    import json
    payload = json.loads(raw_body)
    event_type = payload.get("type")
    invoice_id = payload.get("invoiceId")
    logger.info("BTCPay webhook: type=%s invoice=%s", event_type, invoice_id)

    if not invoice_id:
        return {"status": "error", "detail": "missing invoiceId"}

    # Handle expired / invalid invoices
    if event_type in ("InvoiceExpired", "InvoiceInvalid"):
        result = await db.execute(
            select(Invoice).where(Invoice.btcpay_invoice_id == invoice_id)
        )
        invoice = result.scalar_one_or_none()
        if invoice and invoice.status == InvoiceStatus.pending:
            invoice.status = (
                InvoiceStatus.expired if event_type == "InvoiceExpired"
                else InvoiceStatus.invalid
            )
            await db.commit()
            logger.info("Invoice %s marked as %s", invoice_id, invoice.status.value)
        return {"status": invoice.status.value if invoice else "not_found", "invoice": invoice_id}

    if event_type != "InvoiceSettled":
        return {"status": "ignored", "event": event_type}

    # Find invoice in DB with row-level lock (idempotency: protects against
    # parallel webhook deliveries double-crediting total_spent_usd).
    result = await db.execute(
        select(Invoice)
        .where(Invoice.btcpay_invoice_id == invoice_id)
        .with_for_update()
    )
    invoice = result.scalar_one_or_none()

    if invoice is None:
        logger.warning("Invoice %s not found in DB", invoice_id)
        return {"status": "not_found", "invoice": invoice_id}

    if invoice.status == InvoiceStatus.settled:
        return {"status": "duplicate", "invoice": invoice_id}

    # --- Bug #14 fix: server-side verification via BTCPay API ---
    btcpay_data = await _verify_invoice_with_btcpay(invoice_id)
    if btcpay_data:
        btcpay_status = btcpay_data.get("status", "").lower()
        # Greenfield v1 uses "Settled"; "complete" kept for legacy v1 APIs.
        if btcpay_status not in ("settled", "complete"):
            logger.warning(
                "Invoice %s: webhook says settled but BTCPay API says '%s' — rejecting",
                invoice_id, btcpay_status,
            )
            return {"status": "verification_failed", "invoice": invoice_id, "btcpay_status": btcpay_status}

        # Verify currency — reject if BTCPay returns non-USD (misconfig protection).
        btcpay_currency = btcpay_data.get("currency", "").upper()
        if btcpay_currency and btcpay_currency != "USD":
            logger.error(
                "Invoice %s: currency mismatch — expected USD, BTCPay says '%s'",
                invoice_id, btcpay_currency,
            )
            return {"status": "currency_mismatch", "invoice": invoice_id, "btcpay_currency": btcpay_currency}

        # Verify amount matches
        btcpay_amount = Decimal(str(btcpay_data.get("amount", "0")))
        if btcpay_amount > 0 and btcpay_amount != invoice.amount_usd:
            logger.error(
                "Invoice %s: amount mismatch — expected $%s, BTCPay says $%s",
                invoice_id, invoice.amount_usd, btcpay_amount,
            )
            return {"status": "amount_mismatch", "invoice": invoice_id}
    else:
        logger.warning("Invoice %s: BTCPay verification unavailable, proceeding with HMAC-only trust", invoice_id)

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
    logger.info("Invoice %s settled (amount=$%s, verified=%s)", invoice_id, invoice.amount_usd, btcpay_data is not None)

    return {"status": "settled", "invoice": invoice_id, "verified": btcpay_data is not None}


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
