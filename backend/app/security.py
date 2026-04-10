from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_ALGORITHM = settings.jwt_algorithm
_ACCESS_TYPE = "access"
_REFRESH_TYPE = "refresh"


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def _build_token(user_id: UUID, token_type: str, expire: datetime) -> str:
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "type": token_type,
        "exp": expire,
        "iat": datetime.now(UTC),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=_ALGORITHM)


def create_access_token(user_id: UUID) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.jwt_expire_minutes)
    return _build_token(user_id, _ACCESS_TYPE, expire)


def create_refresh_token(user_id: UUID) -> str:
    expire = datetime.now(UTC) + timedelta(days=settings.jwt_refresh_days)
    return _build_token(user_id, _REFRESH_TYPE, expire)


def verify_token(token: str, expected_type: str = _ACCESS_TYPE) -> UUID:
    """Decode and validate a JWT. Returns user UUID or raises ValueError."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[_ALGORITHM],
            options={"require": ["exp", "sub"]},
        )
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc

    if payload.get("type") != expected_type:
        raise ValueError(f"Expected token type '{expected_type}'")

    sub = payload.get("sub")
    if not sub:
        raise ValueError("Token missing subject claim")

    try:
        return UUID(sub)
    except ValueError as exc:
        raise ValueError("Invalid user ID in token") from exc
