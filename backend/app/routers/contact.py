"""
POST /api/v1/contact — receive contact form submissions and forward to Telegram admin.
"""

import logging

import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

TELEGRAM_API = "https://api.telegram.org/bot{token}/sendMessage"


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    company: str | None = None
    gpu_type: str | None = None
    message: str | None = None


class ContactResponse(BaseModel):
    status: str


@router.post(
    "/contact",
    response_model=ContactResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit contact form",
)
async def submit_contact(body: ContactRequest) -> ContactResponse:
    """
    Accept a contact form submission and forward it to the Telegram admin chat.
    Returns {"status": "ok"} whether or not Telegram delivery succeeded,
    so the frontend never shows a backend error to the visitor.
    """
    text = (
        "*MOZART: New Contact*\n"
        f"Name: {body.name}\n"
        f"Email: {body.email}\n"
        f"Company: {body.company or '—'}\n"
        f"GPU: {body.gpu_type or '—'}\n"
        f"Message: {body.message or '—'}"
    )

    if settings.telegram_bot_token and settings.telegram_admin_chat_id:
        url = TELEGRAM_API.format(token=settings.telegram_bot_token)
        payload = {
            "chat_id": settings.telegram_admin_chat_id,
            "text": text,
            "parse_mode": "Markdown",
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if not resp.is_success:
                    logger.error(
                        "Telegram notification failed: %s %s",
                        resp.status_code,
                        resp.text,
                    )
                else:
                    logger.info(
                        "Contact form from %s forwarded to Telegram admin.", body.email
                    )
        except httpx.RequestError as exc:
            logger.error("Telegram request error: %s", exc)
    else:
        logger.warning(
            "Telegram credentials not configured — contact form message not forwarded. "
            "Set TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID."
        )

    return ContactResponse(status="ok")
