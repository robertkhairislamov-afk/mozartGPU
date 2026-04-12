---
name: Vast.ai Security & Auth анализ
description: Модель безопасности и auth flow vast.ai — gaps, наши преимущества, приоритеты для MOZART
type: reference
originSessionId: f5216b3d-6abb-494f-ac61-8b9438b6067d
---
## Дата: 2026-04-10

## Security gaps vast.ai (наши возможности):
- Нет GPU VRAM wipe между арендаторами → мы: CUDA memset scrub
- Только Docker (нет VM) → мы: QEMU/KVM для enterprise
- Нет шифрования at rest → мы: LUKS encrypted volumes
- Нет Confidential Computing → мы: AMD SEV / Intel TDX
- Нет default-deny firewall → мы: WireGuard mesh
- Нет hardware attestation → мы: TPM 2.0
- Нет ISO 27001 у компании (только у партнёров)
- VDP без гарантий выплат (не bug bounty)
- Rate limiting не документирован

## Auth — vast.ai:
- Email + Google/GitHub OAuth + 2FA/TOTP
- 1 API key/аккаунт, unscoped, hex ~64 chars, Bearer header
- CLI: `~/.vast_api_key` plain text
- Host daemon с отдельным API key
- Pre-paid balance (Stripe + Coinbase)
- Team RBAC: owner/admin/member

## Auth gaps MOZART (P0):
- Email verification — нет
- API keys endpoint — модель есть, роутера нет
- Admin role (is_admin) — нет
- Rate limiting на /auth/login — нет
- Баг #14 проверка оплаты — нет

## Наши преимущества (уже в схеме):
- Multiple scoped API keys (vast.ai: 1 unscoped)
- Prefix mzk_ (vast.ai: нет prefix)
- HMAC webhooks (vast.ai: нет)
- Refresh tokens с rotation (vast.ai: нет)

**Why:** Понимание security/auth vast.ai определяет наши дифференциаторы для B2B/enterprise.
**How to apply:** P0 auth фиксы перед деплоем, security premium features для маркетинга.
