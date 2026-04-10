"""
MOZART GPU Rental — Auto-Provision Webhook
FastAPI service: receives BTCPay webhooks, provisions GPU on vast.ai,
notifies admin via Telegram.
"""

import asyncio
import hashlib
import hmac
import json
import logging
import os
import threading
from typing import Any

import asyncpg
import httpx
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status

load_dotenv()

logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

VAST_API_KEY           = os.getenv("VAST_API_KEY")
TELEGRAM_BOT_TOKEN     = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_ADMIN_CHAT_ID = os.getenv("TELEGRAM_ADMIN_CHAT_ID")
BTCPAY_WEBHOOK_SECRET  = os.getenv("BTCPAY_WEBHOOK_SECRET")
DATABASE_URL           = os.getenv("DATABASE_URL", "").replace("+asyncpg", "")
PORT = int(os.getenv("PROVISION_WEBHOOK_PORT", "8081"))

# Database connection pool (initialized on startup)
_db_pool: asyncpg.Pool | None = None

VAST_BASE          = "https://cloud.vast.ai/api/v0"
TELEGRAM_API_BASE  = "https://api.telegram.org"
POLL_INTERVAL_SEC  = 5
POLL_MAX_ATTEMPTS  = 60   # 5 minutes total
PYTORCH_IMAGE      = "pytorch/pytorch:2.3.0-cuda12.4-cudnn9-runtime"

# ---------------------------------------------------------------------------
# GPU package definitions
# ---------------------------------------------------------------------------

GPU_PACKAGES: dict[str, dict[str, Any]] = {
    "rtx4090_10h": {
        "gpu_name": "RTX 4090",
        "hours": 10,
        "filter": {"gpu_name": {"eq": "RTX 4090"}},
        "disk": 50,
    },
    "rtx4090_50h": {
        "gpu_name": "RTX 4090",
        "hours": 50,
        "filter": {"gpu_name": {"eq": "RTX 4090"}},
        "disk": 50,
    },
    "a100_10h": {
        "gpu_name": "A100 80GB",
        "hours": 10,
        "filter": {"gpu_name": {"eq": "A100_80GB"}},
        "disk": 100,
    },
    "a100_50h": {
        "gpu_name": "A100 80GB",
        "hours": 50,
        "filter": {"gpu_name": {"eq": "A100_80GB"}},
        "disk": 100,
    },
    "h100_10h": {
        "gpu_name": "H100 SXM5",
        "hours": 10,
        "filter": {"gpu_name": {"eq": "H100_SXM5"}},
        "disk": 100,
    },
    "h100_50h": {
        "gpu_name": "H100 SXM5",
        "hours": 50,
        "filter": {"gpu_name": {"eq": "H100_SXM5"}},
        "disk": 200,
    },
}

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="MOZART Auto-Provision", version="1.0.0")


@app.on_event("startup")
async def _init_db_pool() -> None:
    global _db_pool
    if DATABASE_URL:
        try:
            _db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
            logger.info("Database pool created for shared DB")
        except Exception as exc:
            logger.warning("Could not connect to shared DB: %s — idempotency falls back to in-memory", exc)
            _db_pool = None


@app.on_event("shutdown")
async def _close_db_pool() -> None:
    global _db_pool
    if _db_pool:
        await _db_pool.close()


async def _check_and_mark_processed(invoice_id: str) -> bool:
    """Check if invoice was already processed. Returns True if duplicate."""
    if _db_pool:
        try:
            row = await _db_pool.fetchrow(
                "SELECT status FROM invoices WHERE btcpay_invoice_id = $1", invoice_id
            )
            if row and row["status"] == "settled":
                return True
            if row:
                await _db_pool.execute(
                    "UPDATE invoices SET status = 'settled', settled_at = NOW() WHERE btcpay_invoice_id = $1",
                    invoice_id,
                )
            return False
        except Exception as exc:
            logger.warning("DB idempotency check failed: %s — falling back to in-memory", exc)

    # Fallback to in-memory set
    with _invoice_lock:
        if invoice_id in _processed_invoices:
            return True
        _processed_invoices.add(invoice_id)
        return False


# In-memory fallback for idempotency
_processed_invoices: set[str] = set()
_invoice_lock = threading.Lock()

# ---------------------------------------------------------------------------
# Active task registry — Fix 3: track background tasks + error callbacks
# ---------------------------------------------------------------------------

_active_tasks: set[asyncio.Task] = set()


def _task_done(task: asyncio.Task) -> None:
    _active_tasks.discard(task)
    if task.exception():
        logger.critical(
            "provision_gpu failed: %s", task.exception(), exc_info=task.exception()
        )


# ---------------------------------------------------------------------------
# Helpers — Telegram
# ---------------------------------------------------------------------------

async def telegram_notify(client: httpx.AsyncClient, message: str) -> None:
    """Send a plain-text message to the admin chat."""
    url = f"{TELEGRAM_API_BASE}/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_ADMIN_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown",
    }
    try:
        resp = await client.post(url, json=payload, timeout=10)
        resp.raise_for_status()
        logger.info("Telegram notification sent to admin.")
    except Exception as exc:
        logger.error("Failed to send Telegram notification: %s", exc)


# ---------------------------------------------------------------------------
# Helpers — vast.ai
# ---------------------------------------------------------------------------

def _vast_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {VAST_API_KEY}"}


async def search_offers(
    client: httpx.AsyncClient,
    gpu_filter: dict,
    disk_gb: int,
) -> list[dict]:
    """Return up to 3 cheapest datacenter offers matching the GPU filter."""
    query = {
        **gpu_filter,
        "reliability": {"gte": 0.95},
        "datacenter": {"eq": True},
        "disk_space": {"gte": disk_gb},
        "rented": {"eq": False},
    }
    params = {
        "q": json.dumps(query),
        "order": "dph_total",
        "limit": 3,
    }
    try:
        resp = await client.get(
            f"{VAST_BASE}/bundles/",
            headers=_vast_headers(),
            params=params,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("offers", [])
    except Exception as exc:
        logger.error("vast.ai offer search failed: %s", exc)
        return []


async def rent_instance(
    client: httpx.AsyncClient,
    offer_id: int,
    disk_gb: int,
) -> dict | None:
    """Rent a vast.ai instance and return the response JSON."""
    body = {
        "client_id": "me",
        "image": PYTORCH_IMAGE,
        "disk": disk_gb,
        "runtype": "ssh",
    }
    try:
        resp = await client.put(
            f"{VAST_BASE}/asks/{offer_id}/",
            headers=_vast_headers(),
            json=body,
            timeout=20,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:
        logger.error("vast.ai rent call failed for offer %s: %s", offer_id, exc)
        return None


async def poll_instance_status(
    client: httpx.AsyncClient,
    contract_id: int,
) -> dict | None:
    """
    Poll instance status until it reaches 'running' or we exhaust retries.
    Returns the instance dict on success, None on timeout/error.
    """
    for attempt in range(1, POLL_MAX_ATTEMPTS + 1):
        try:
            resp = await client.get(
                f"{VAST_BASE}/instances/{contract_id}/",
                headers=_vast_headers(),
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
            instance = data.get("instance", data)
            current_status = instance.get("actual_status") or instance.get("status", "")
            logger.info(
                "Instance %s — attempt %d/%d — status: %s",
                contract_id, attempt, POLL_MAX_ATTEMPTS, current_status,
            )
            if current_status == "running":
                return instance
        except Exception as exc:
            logger.warning(
                "Poll attempt %d for instance %s failed: %s",
                attempt, contract_id, exc,
            )
        await asyncio.sleep(POLL_INTERVAL_SEC)

    logger.error("Instance %s did not reach 'running' within timeout.", contract_id)
    return None


# ---------------------------------------------------------------------------
# Core provisioning logic
# ---------------------------------------------------------------------------

async def provision_gpu(package_id: str, client_email: str) -> None:
    """Full provisioning flow: search → rent → poll → notify."""
    pkg = GPU_PACKAGES.get(package_id)
    if pkg is None:
        logger.error("Unknown package_id: %s", package_id)
        return

    gpu_name = pkg["gpu_name"]
    hours    = pkg["hours"]
    disk_gb  = pkg["disk"]

    logger.info(
        "Provisioning %s for %s (%dh, %dGB disk)...",
        gpu_name, client_email, hours, disk_gb,
    )

    async with httpx.AsyncClient() as client:
        # 1. Search for offers
        offers = await search_offers(client, pkg["filter"], disk_gb)
        if not offers:
            msg = (
                f"*MOZART: No GPU available*\n\n"
                f"Package: `{package_id}`\n"
                f"GPU: {gpu_name}\n"
                f"Client: {client_email}\n\n"
                f"No matching offers found on vast.ai. Manual intervention required."
            )
            await telegram_notify(client, msg)
            return

        best_offer = offers[0]
        offer_id   = best_offer["id"]
        dph        = best_offer.get("dph_total", "?")
        logger.info("Best offer: id=%s dph=%.4f", offer_id, dph if isinstance(dph, float) else 0)

        # 2. Rent the instance
        rent_resp = await rent_instance(client, offer_id, disk_gb)
        if not rent_resp:
            msg = (
                f"*MOZART: Rent failed*\n\n"
                f"Package: `{package_id}`\n"
                f"GPU: {gpu_name}\n"
                f"Client: {client_email}\n"
                f"Offer ID: `{offer_id}`\n\n"
                f"vast.ai rent call returned no data. Check API key and offer availability."
            )
            await telegram_notify(client, msg)
            return

        contract_id = rent_resp.get("new_contract") or rent_resp.get("id")
        logger.info("Rented instance contract_id=%s", contract_id)

        # Fix 4: guard against missing contract_id
        if contract_id is None:
            msg = (
                f"*MOZART: Missing contract_id*\n\n"
                f"Package: `{package_id}`\n"
                f"GPU: {gpu_name}\n"
                f"Client: {client_email}\n\n"
                f"vast.ai rent response contained no contract ID. Manual intervention required."
            )
            await telegram_notify(client, msg)
            return

        # 3. Poll until running
        instance = await poll_instance_status(client, contract_id)
        if instance is None:
            msg = (
                f"*MOZART: Provisioning timeout*\n\n"
                f"Package: `{package_id}`\n"
                f"GPU: {gpu_name}\n"
                f"Client: {client_email}\n"
                f"Contract ID: `{contract_id}`\n\n"
                f"Instance did not reach running state in 5 minutes. Check vast.ai dashboard."
            )
            await telegram_notify(client, msg)
            return

        # 4. Extract SSH info
        ssh_host = instance.get("ssh_host") or instance.get("public_ipaddr", "unknown")
        ssh_port = instance.get("ssh_port", 22)
        ssh_cmd  = f"ssh -p {ssh_port} root@{ssh_host}"

        # 5. Notify admin
        msg = (
            f"*MOZART: GPU Ready*\n\n"
            f"Client: `{client_email}`\n"
            f"Package: `{package_id}`\n"
            f"GPU: {gpu_name}\n"
            f"Hours: {hours}h\n"
            f"Contract ID: `{contract_id}`\n\n"
            f"*SSH Command:*\n"
            f"`{ssh_cmd}`\n\n"
            f"_Forward to client via /ssh command in bot._"
        )
        await telegram_notify(client, msg)
        logger.info("Provisioning complete for %s: %s", client_email, ssh_cmd)


# ---------------------------------------------------------------------------
# Webhook signature validation
# ---------------------------------------------------------------------------

def verify_btcpay_signature(body: bytes, signature_header: str | None) -> bool:
    """Validate BTCPay HMAC-SHA256 webhook signature."""
    if not BTCPAY_WEBHOOK_SECRET:
        logger.error("BTCPAY_WEBHOOK_SECRET not configured — rejecting request")
        return False
    if not signature_header:
        return False

    # BTCPay sends: "sha256=<hex_digest>"
    prefix = "sha256="
    if not signature_header.startswith(prefix):
        return False

    expected_hex = signature_header[len(prefix):]
    computed = hmac.new(
        BTCPAY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(computed, expected_hex)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "mozart-auto-provision"}


@app.post("/btcpay-webhook", status_code=status.HTTP_200_OK)
async def btcpay_webhook(request: Request) -> dict:
    raw_body = await request.body()

    # Fix 6: body size limit
    if len(raw_body) > 16384:
        raise HTTPException(status_code=413, detail="Payload too large")

    # Validate signature
    sig_header = request.headers.get("BTCPay-Sig")
    if not verify_btcpay_signature(raw_body, sig_header):
        logger.warning("Webhook signature validation failed.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature.",
        )

    # Parse payload
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse webhook payload: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload.",
        )

    event_type = payload.get("type")
    logger.info("BTCPay webhook received: type=%s", event_type)

    # Only act on settled invoices
    if event_type != "InvoiceSettled":
        return {"status": "ignored", "event": event_type}

    # Extract order details from metadata
    metadata     = payload.get("metadata", {})
    package_id   = metadata.get("packageId") or metadata.get("package_id")
    client_email = metadata.get("buyerEmail") or metadata.get("email", "unknown@unknown.com")
    invoice_id   = payload.get("invoiceId", "unknown")

    # Idempotency — check DB first, fall back to in-memory
    if await _check_and_mark_processed(invoice_id):
        logger.warning("Duplicate webhook for invoice %s — ignoring", invoice_id)
        return {"status": "duplicate", "invoice": invoice_id}

    logger.info(
        "InvoiceSettled — invoice=%s package=%s client=%s",
        invoice_id, package_id, client_email,
    )

    if not package_id:
        logger.error("No packageId in invoice metadata. Cannot provision.")
        async with httpx.AsyncClient() as hclient:
            await telegram_notify(
                hclient,
                f"*MOZART: Missing packageId*\n\n"
                f"Invoice `{invoice_id}` settled but metadata has no packageId.\n"
                f"Client email: `{client_email}`\n"
                f"Manual provisioning required.",
            )
        return {"status": "error", "detail": "missing packageId in metadata"}

    # Fix 5: validate packageId at the HTTP boundary
    if package_id not in GPU_PACKAGES:
        logger.error("Unknown packageId '%s' in invoice %s", package_id, invoice_id)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown packageId: {package_id}",
        )

    # Fix 3: store task reference + attach error callback
    # Provision in background so we return 200 to BTCPay immediately
    task = asyncio.create_task(provision_gpu(package_id, client_email))
    _active_tasks.add(task)
    task.add_done_callback(_task_done)

    return {"status": "accepted", "invoice": invoice_id, "package": package_id}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    missing = [
        name for name, val in {
            "VAST_API_KEY":           VAST_API_KEY,
            "TELEGRAM_BOT_TOKEN":     TELEGRAM_BOT_TOKEN,
            "TELEGRAM_ADMIN_CHAT_ID": TELEGRAM_ADMIN_CHAT_ID,
            "BTCPAY_WEBHOOK_SECRET":  BTCPAY_WEBHOOK_SECRET,
        }.items()
        if not val
    ]
    if missing:
        raise RuntimeError(
            f"Missing required environment variables: {', '.join(missing)}"
        )

    logger.info("Starting MOZART auto-provision service on port %d...", PORT)
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")


if __name__ == "__main__":
    main()
