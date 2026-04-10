from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database — must be set via environment variable; no default to prevent silent misconfiguration
    database_url: str  # e.g. postgresql+asyncpg://user:pass@host:5432/dbname

    # JWT — JWT_SECRET is mandatory; app will refuse to start without it.
    # Generate with: python -c "import secrets; print(secrets.token_hex(32))"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 15
    jwt_refresh_days: int = 30

    # Vast.ai
    vast_api_key: str = ""

    # BTCPay
    btcpay_url: str = ""
    btcpay_store_id: str = ""
    btcpay_api_key: str = ""
    btcpay_webhook_secret: str = ""

    # Telegram
    telegram_bot_token: str = ""
    telegram_admin_chat_id: str = ""

    # App
    provision_webhook_port: int = 8081

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
