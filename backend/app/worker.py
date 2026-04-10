"""
Background worker — runs alongside FastAPI via asyncio.create_task().

Task A (every 60s): Poll vast.ai for instances in "creating" or "running"
  state — sync ssh_host, ssh_port, status.

Task B (every 60s): Update hours_used for running instances.
  Terminate (destroy on vast.ai + mark destroyed) when budget exhausted.
"""
import asyncio
import logging
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.instance import Instance, InstanceStatus
from app.services import vast_client

logger = logging.getLogger(__name__)

_POLL_INTERVAL_SECONDS = 60


# ---------------------------------------------------------------------------
# Task A — sync vast.ai status into our DB
# ---------------------------------------------------------------------------

async def _sync_vast_status() -> None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Instance).where(
                Instance.status.in_([InstanceStatus.creating, InstanceStatus.running])
            )
        )
        instances = list(result.scalars().all())

    if not instances:
        return

    logger.debug("_sync_vast_status: checking %d instance(s)", len(instances))

    for inst in instances:
        if inst.vast_instance_id is None:
            continue

        try:
            data = await vast_client.get_instance(inst.vast_instance_id)
        except Exception as exc:
            logger.warning("vast.ai get_instance(%s) failed: %s", inst.vast_instance_id, exc)
            continue

        async with AsyncSessionLocal() as session:
            refreshed = await session.get(Instance, inst.id)
            if refreshed is None:
                continue

            vast_status = data.get("actual_status", "")

            if vast_status in ("running", "exited"):
                refreshed.ssh_host = data.get("ssh_host") or data.get("public_ipaddr")
                refreshed.ssh_port = data.get("ssh_port")

            if vast_status == "running" and refreshed.status == InstanceStatus.creating:
                refreshed.status = InstanceStatus.running
                if refreshed.started_at is None:
                    refreshed.started_at = datetime.now(timezone.utc)
                logger.info("Instance %s transitioned creating -> running", refreshed.id)

            elif vast_status in ("destroyed", "exited", "stopped"):
                if refreshed.status not in (InstanceStatus.stopped, InstanceStatus.destroyed):
                    refreshed.status = InstanceStatus.destroyed
                    refreshed.stopped_at = datetime.now(timezone.utc)
                    logger.info("Instance %s marked destroyed (vast: %s)", refreshed.id, vast_status)

            await session.commit()


async def poll_vast_loop() -> None:
    logger.info("Worker: poll_vast_loop started (interval=%ds)", _POLL_INTERVAL_SECONDS)
    while True:
        try:
            await _sync_vast_status()
        except asyncio.CancelledError:
            logger.info("poll_vast_loop cancelled")
            return
        except Exception:
            logger.exception("poll_vast_loop: unexpected error (will retry)")
        await asyncio.sleep(_POLL_INTERVAL_SECONDS)


# ---------------------------------------------------------------------------
# Task B — track hours_used and auto-terminate when budget exhausted
# ---------------------------------------------------------------------------

async def _tick_hours_used() -> None:
    now = datetime.now(timezone.utc)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Instance).where(
                Instance.status == InstanceStatus.running,
                Instance.started_at.is_not(None),
            )
        )
        instances = list(result.scalars().all())

    if not instances:
        return

    for inst in instances:
        elapsed_seconds = (now - inst.started_at).total_seconds()
        hours_used = Decimal(str(round(elapsed_seconds / 3600, 4)))
        over_budget = hours_used >= Decimal(str(inst.hours_purchased))

        async with AsyncSessionLocal() as session:
            refreshed = await session.get(Instance, inst.id)
            if refreshed is None or refreshed.status != InstanceStatus.running:
                continue

            refreshed.hours_used = hours_used

            if over_budget:
                logger.info(
                    "Instance %s budget exhausted (%.2f / %d hrs) — terminating",
                    refreshed.id, float(hours_used), refreshed.hours_purchased,
                )
                try:
                    if refreshed.vast_instance_id:
                        await vast_client.destroy_instance(refreshed.vast_instance_id)
                except Exception as exc:
                    logger.warning("destroy_instance(%s) failed: %s", refreshed.vast_instance_id, exc)
                refreshed.status = InstanceStatus.destroyed
                refreshed.stopped_at = now

            await session.commit()


async def hours_tracking_loop() -> None:
    logger.info("Worker: hours_tracking_loop started (interval=%ds)", _POLL_INTERVAL_SECONDS)
    while True:
        try:
            await _tick_hours_used()
        except asyncio.CancelledError:
            logger.info("hours_tracking_loop cancelled")
            return
        except Exception:
            logger.exception("hours_tracking_loop: unexpected error (will retry)")
        await asyncio.sleep(_POLL_INTERVAL_SECONDS)


# ---------------------------------------------------------------------------
# Entry point — called from main.py startup event
# ---------------------------------------------------------------------------

def start_background_workers() -> list[asyncio.Task]:
    tasks = [
        asyncio.create_task(poll_vast_loop(), name="worker:poll_vast"),
        asyncio.create_task(hours_tracking_loop(), name="worker:hours_tracking"),
    ]
    logger.info("Background workers started: %s", [t.get_name() for t in tasks])
    return tasks
