import base64
import hashlib
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import CurrentUser, DbDep
from app.models.ssh_key import SshKey
from app.schemas.ssh_key import SshKeyCreate, SshKeyResponse

router = APIRouter()


def _compute_fingerprint(public_key: str) -> str:
    """Compute SHA-256 fingerprint of an SSH public key (OpenSSH format)."""
    try:
        parts = public_key.strip().split()
        if len(parts) < 2:
            raise ValueError("Invalid public key format")
        key_bytes = base64.b64decode(parts[1])
        digest = hashlib.sha256(key_bytes).digest()
        return "SHA256:" + base64.b64encode(digest).decode().rstrip("=")
    except Exception:
        # Fallback: hash the whole string
        return "SHA256:" + hashlib.sha256(public_key.encode()).hexdigest()[:43]


@router.post("/", response_model=SshKeyResponse, status_code=status.HTTP_201_CREATED)
async def add_ssh_key(
    payload: SshKeyCreate,
    current_user: CurrentUser,
    db: DbDep,
) -> SshKey:
    """Add a new SSH public key for the authenticated user."""
    fingerprint = _compute_fingerprint(payload.public_key)

    # Check for duplicate key for this user
    existing = await db.execute(
        select(SshKey).where(
            SshKey.user_id == current_user.id,
            SshKey.fingerprint == fingerprint,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="SSH key already exists",
        )

    ssh_key = SshKey(
        user_id=current_user.id,
        name=payload.name,
        public_key=payload.public_key.strip(),
        fingerprint=fingerprint,
    )
    db.add(ssh_key)
    await db.flush()
    return ssh_key


@router.get("/", response_model=list[SshKeyResponse])
async def list_ssh_keys(current_user: CurrentUser, db: DbDep) -> list[SshKey]:
    """List all SSH keys for the authenticated user."""
    result = await db.execute(
        select(SshKey)
        .where(SshKey.user_id == current_user.id)
        .order_by(SshKey.created_at.desc())
    )
    return list(result.scalars().all())


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ssh_key(key_id: UUID, current_user: CurrentUser, db: DbDep) -> None:
    """Delete an SSH key (must belong to the authenticated user)."""
    result = await db.execute(
        select(SshKey).where(SshKey.id == key_id, SshKey.user_id == current_user.id)
    )
    ssh_key: SshKey | None = result.scalar_one_or_none()
    if ssh_key is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SSH key not found",
        )
    await db.delete(ssh_key)
