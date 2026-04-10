"""
Async wrapper around the vast.ai v0 REST API.
All methods raise httpx.HTTPStatusError on non-2xx responses.
"""

import json
import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_VAST_BASE = "https://cloud.vast.ai/api/v0"
_PYTORCH_IMAGE = "pytorch/pytorch:2.3.0-cuda12.4-cudnn9-runtime"


def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {settings.vast_api_key}"}


async def search_offers(
    gpu_filter: dict[str, Any],
    min_reliability: float = 0.95,
    disk_gb: int = 50,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """Return cheapest datacenter offers matching the GPU filter."""
    query = {
        **gpu_filter,
        "reliability": {"gte": min_reliability},
        "datacenter": {"eq": True},
        "disk_space": {"gte": disk_gb},
        "rented": {"eq": False},
    }
    params = {
        "q": json.dumps(query),
        "order": "dph_total",
        "limit": limit,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{_VAST_BASE}/bundles/",
            headers=_headers(),
            params=params,
        )
        resp.raise_for_status()
        data = resp.json()
        offers: list[dict] = data.get("offers", [])
        logger.info("vast.ai search returned %d offers", len(offers))
        return offers


async def rent_instance(
    offer_id: int,
    image: str = _PYTORCH_IMAGE,
    disk_gb: int = 50,
    ssh_key: str | None = None,
) -> dict[str, Any]:
    """Rent an offer and return the raw response dict."""
    body: dict[str, Any] = {
        "client_id": "me",
        "image": image,
        "disk": disk_gb,
        "runtype": "ssh",
    }
    if ssh_key:
        body["ssh_key"] = ssh_key

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.put(
            f"{_VAST_BASE}/asks/{offer_id}/",
            headers=_headers(),
            json=body,
        )
        resp.raise_for_status()
        data: dict = resp.json()
        logger.info("Rented vast.ai offer %s → contract %s", offer_id, data.get("new_contract"))
        return data


async def get_instance(instance_id: int | str) -> dict[str, Any]:
    """Fetch a single instance by its vast.ai contract ID."""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{_VAST_BASE}/instances/{instance_id}/",
            headers=_headers(),
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("instance", data)


async def destroy_instance(instance_id: int | str) -> bool:
    """Destroy a running instance. Returns True on success."""
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.delete(
            f"{_VAST_BASE}/instances/{instance_id}/",
            headers=_headers(),
        )
        if resp.status_code == 404:
            logger.warning("vast.ai instance %s not found (already gone?)", instance_id)
            return True
        resp.raise_for_status()
        logger.info("Destroyed vast.ai instance %s", instance_id)
        return True
