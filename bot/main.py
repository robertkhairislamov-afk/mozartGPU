"""
MOZART GPU Rental — Telegram Bot
python-telegram-bot v21.x (async)
"""

import html
import logging
import os
from dotenv import load_dotenv
from telegram import (
    Update,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
)
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)

load_dotenv()

logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_ADMIN_CHAT_ID = os.getenv("TELEGRAM_ADMIN_CHAT_ID")

PRICING_TABLE = [
    ("Starter",      "RTX 4090",  10, "$8"),
    ("Pro",          "RTX 4090",  50, "$35"),
    ("ML Basic",     "A100 80GB", 10, "$18"),
    ("ML Pro",       "A100 80GB", 50, "$80"),
    ("Enterprise",   "H100 80GB", 10, "$25"),
    ("Enterprise+",  "H100 80GB", 50, "$110"),
]

WEBSITE_URL = "https://mozartgpu.com"
BTCPAY_URL  = "https://btcpay.mozartgpu.com"
SUPPORT_HANDLE = "@mozartgpu"


# ---------------------------------------------------------------------------
# /start
# ---------------------------------------------------------------------------

async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = [
        [
            InlineKeyboardButton("Prices",   callback_data="prices"),
            InlineKeyboardButton("Rent GPU", url=f"{WEBSITE_URL}/pricing"),
        ],
        [
            InlineKeyboardButton("Support",  url=f"https://t.me/{SUPPORT_HANDLE.lstrip('@')}"),
            InlineKeyboardButton("Website",  url=WEBSITE_URL),
        ],
    ]
    text = (
        "*Welcome to MOZART GPU Rental*\n\n"
        "We provide on-demand GPU access — rent by the hour, pay with crypto.\n\n"
        "*What we offer:*\n"
        "• RTX 4090, A100 80GB, H100 80GB\n"
        "• Packages from 10 to 50 hours\n"
        "• SSH access delivered instantly\n"
        "• Crypto payment via BTCPay\n\n"
        "Use the buttons below or type /help to see all commands."
    )
    await update.message.reply_text(
        text,
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


# ---------------------------------------------------------------------------
# /prices
# ---------------------------------------------------------------------------

async def cmd_prices(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    header = "*MOZART GPU Pricing*\n\n"
    row_fmt = "`{:<14} {:<12} {:>5}h  {:>6}`\n"
    table = (
        header
        + "`Package        GPU          Hours   Price`\n"
        + "`" + "-" * 43 + "`\n"
    )
    for name, gpu, hours, price in PRICING_TABLE:
        table += row_fmt.format(name, gpu, hours, price)

    table += (
        "\n_All prices in USD, paid in crypto._\n"
        f"Order at: {WEBSITE_URL}/pricing"
    )
    await update.message.reply_text(table, parse_mode=ParseMode.MARKDOWN)


# ---------------------------------------------------------------------------
# /rent
# ---------------------------------------------------------------------------

async def cmd_rent(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = (
        "*How to rent a GPU on MOZART*\n\n"
        "1. Visit our pricing page and choose a package.\n"
        f"   {WEBSITE_URL}/pricing\n\n"
        "2. Click *Pay with Crypto* — you will be redirected to BTCPay Server.\n\n"
        "3. Pay the invoice in BTC, LTC, or USDT.\n\n"
        "4. Within 5 minutes your SSH credentials will be sent to this chat "
        "by our admin.\n\n"
        "5. Connect with: `ssh -p <port> root@<host>`\n\n"
        f"Questions? Contact {SUPPORT_HANDLE}"
    )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


# ---------------------------------------------------------------------------
# /status
# ---------------------------------------------------------------------------

async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Instance status tracking is coming soon.\n"
        f"For current status, contact {SUPPORT_HANDLE}",
        parse_mode=ParseMode.MARKDOWN,
    )


# ---------------------------------------------------------------------------
# /support <message>
# ---------------------------------------------------------------------------

async def cmd_support(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.message.reply_text(
            "Usage: `/support <your message>`\n"
            "Example: `/support I need help with my instance`",
            parse_mode=ParseMode.MARKDOWN,
        )
        return

    user = update.effective_user
    support_text = " ".join(context.args)

    forward_msg = (
        f"<b>Support request</b>\n"
        f"User ID: <code>{user.id}</code>\n"
        f"Username: @{html.escape(user.username or 'none')}\n"
        f"Name: {html.escape(user.full_name)}\n\n"
        f"Message:\n{html.escape(support_text)}"
    )

    try:
        await context.bot.send_message(
            chat_id=TELEGRAM_ADMIN_CHAT_ID,
            text=forward_msg,
            parse_mode=ParseMode.HTML,
        )
        await update.message.reply_text(
            "Your message has been forwarded to our support team. "
            "We will respond shortly."
        )
        logger.info("Support request from user %s forwarded to admin.", user.id)
    except Exception as exc:
        logger.error("Failed to forward support message: %s", exc)
        await update.message.reply_text(
            f"Could not forward your message right now. Please contact {SUPPORT_HANDLE} directly."
        )


# ---------------------------------------------------------------------------
# /help
# ---------------------------------------------------------------------------

async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = (
        "*MOZART Bot — Available Commands*\n\n"
        "/start — Welcome message and quick actions\n"
        "/prices — Show GPU rental packages and pricing\n"
        "/rent — Step-by-step rental instructions\n"
        "/status — Check instance status (coming soon)\n"
        "/support `<message>` — Send a message to our support team\n"
        "/help — Show this list\n\n"
        f"Need immediate help? Reach us at {SUPPORT_HANDLE}"
    )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


# ---------------------------------------------------------------------------
# Admin: /ssh <client_telegram_id> <ssh_command...>
# ---------------------------------------------------------------------------

async def cmd_ssh(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Admin-only: forward SSH credentials to a client by Telegram ID."""
    sender_id = str(update.effective_user.id)

    if sender_id != str(TELEGRAM_ADMIN_CHAT_ID):
        await update.message.reply_text("This command is restricted to admins.")
        logger.warning(
            "Unauthorized /ssh attempt from chat_id=%s", sender_id
        )
        return

    if not context.args or len(context.args) < 2:
        await update.message.reply_text(
            "Usage: `/ssh <client_telegram_id> <ssh_command>`\n"
            "Example: `/ssh 123456789 ssh -p 22123 root@45.77.10.5`",
            parse_mode=ParseMode.MARKDOWN,
        )
        return

    client_id = context.args[0]
    ssh_command = " ".join(context.args[1:])

    credential_msg = (
        "<b>Your MOZART GPU is ready!</b>\n\n"
        "Connect with:\n"
        f"<code>{html.escape(ssh_command)}</code>\n\n"
        "<i>This credential is for your use only. Do not share it.</i>\n"
        f"Need help? Contact {html.escape(SUPPORT_HANDLE)}"
    )

    try:
        await context.bot.send_message(
            chat_id=client_id,
            text=credential_msg,
            parse_mode=ParseMode.HTML,
        )
        await update.message.reply_text(
            f"SSH credentials sent to client `{client_id}`.",
            parse_mode=ParseMode.MARKDOWN,
        )
        logger.info("SSH credentials delivered to client %s by admin.", client_id)
    except Exception as exc:
        logger.error("Failed to send SSH credentials to %s: %s", client_id, exc)
        await update.message.reply_text(
            f"Failed to deliver credentials to `{client_id}`: {exc}",
            parse_mode=ParseMode.MARKDOWN,
        )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    if not TELEGRAM_BOT_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set in environment.")
    if not TELEGRAM_ADMIN_CHAT_ID:
        raise RuntimeError("TELEGRAM_ADMIN_CHAT_ID is not set in environment.")

    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    app.add_handler(CommandHandler("start",   cmd_start))
    app.add_handler(CommandHandler("prices",  cmd_prices))
    app.add_handler(CommandHandler("rent",    cmd_rent))
    app.add_handler(CommandHandler("status",  cmd_status))
    app.add_handler(CommandHandler("support", cmd_support))
    app.add_handler(CommandHandler("help",    cmd_help))
    app.add_handler(CommandHandler("ssh",     cmd_ssh))

    logger.info("MOZART Telegram bot starting (polling)...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
