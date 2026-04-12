# MOZART GPU

Rent production-grade GPUs for AI/ML, rendering, and compute without KYC. Pay with Bitcoin, USDT, or USDC. Deploy in minutes.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker Compose](https://img.shields.io/badge/docker--compose-3.9-2496ED?logo=docker)](docker-compose.yml)
[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue?logo=python)](backend/requirements.txt)
[![Node 18+](https://img.shields.io/badge/node-18%2B-green?logo=node.js)](console/package.json)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com/)

**Live at:** https://web3playlab.win (test domain) · Production: `mozartgpu.com` (coming soon)

---

## Features

- **No KYC. Crypto only.** Bitcoin, USDT, USDC via self-hosted BTCPay Server
- **SSH in 60 seconds.** Root access to a fresh container with CUDA 12.x pre-installed
- **Fixed, transparent pricing.** No marketplace bidding, no algorithmic price surges
- **H100 / A100 / RTX 4090** Sourced via vast.ai resale with 40-60% margin
- **Dashboard + Telegram bot.** Manage instances from browser or chat
- **8-service Docker stack** with health checks, background worker, and HMAC-verified webhooks
- **Open source provisioning** (see `backend/auto_provision.py`)

---

## Quick Start

### Prerequisites

- Docker Compose 3.9+ and Docker 20.10+
- vast.ai API key
- Telegram Bot token (optional)

### 1. Clone and configure

```bash
git clone https://github.com/robertkhairislamov-afk/mozartGPU.git
cd mozartGPU
cp .env.example .env
```

### 2. Set required secrets in `.env`

```bash
# Generate JWT_SECRET
python3 -c "import secrets; print(secrets.token_hex(32))"

JWT_SECRET=<64_hex_chars>
VAST_API_KEY=<your_vast_api_key>
POSTGRES_PASSWORD=<strong_random_password>
TELEGRAM_BOT_TOKEN=<your_bot_token>
TELEGRAM_ADMIN_CHAT_ID=<your_chat_id>
BTCPAY_WEBHOOK_SECRET=<random_hex>
```

### 3. Start services

```bash
# Full stack (all 8 services)
docker compose up -d

# Minimal (just backend + DB)
docker compose up postgres fastapi-app -d --build
```

### 4. Verify

```bash
curl http://localhost:8000/api/v1/health
# {"status":"ok","version":"0.2.0"}

curl http://localhost:8000/api/v1/gpu-models/
# [{"slug":"h100","name":"NVIDIA H100 SXM5 80GB", ...}]
```

---

## Architecture

```
            Browser / Telegram / API Client
                        │
                        ▼
                   Nginx (TLS)
            /           /api           /console
            │            │               │
    Landing HTML    FastAPI        React SPA
    (static)        :8000          (dist/)
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
    PostgreSQL     vast.ai API    BTCPay Server
    (instances,   (GPU rental)    (BTC/USDT/USDC)
     invoices,
     users)            ▲
                        │
              Background Worker
         (polls status, billing ticker,
          auto-terminate over-budget)
```

### 8-Service Docker Compose

| Service | Purpose |
|---------|---------|
| `postgres` | Shared DB for users, instances, invoices, gpu_models |
| `fastapi-app` | Core API (auth, billing, instances, webhooks, worker) |
| `console` | React SPA with Nginx multi-stage build |
| `nginx` | TLS termination, reverse proxy, static file serving |
| `btcpayserver` | Self-hosted crypto payment processor |
| `nbxplorer` | Bitcoin UTXO indexer for BTCPay |
| `telegram-bot` | Client communication, `/rent` command, admin alerts |
| `provision-webhook` | MVP-1 BTCPay → vast.ai provisioner (legacy, kept for reliability) |

---

## Pricing

| GPU | VRAM | $/hour | Starter (10h) | Pro (50h) |
|-----|------|--------|---------------|-----------|
| RTX 4090 | 24GB | $0.80 | $8 | $38 |
| A100 80GB | 80GB | $1.80 | $18 | $85 |
| H100 SXM5 | 80GB | $2.50 | $25 | $120 |

Prices include MOZART's margin. Underlying capacity sourced from vast.ai.

---

## Tech Stack

**Backend**
- FastAPI 0.115 + Uvicorn 0.30
- SQLAlchemy 2.0 async + asyncpg 0.30
- PostgreSQL 16
- Pydantic 2.6 + email-validator
- python-jose (JWT) + Passlib (bcrypt)

**Frontend**
- React 18 + TypeScript 5.4
- Vite 5.2 + Tailwind CSS 3.4
- TanStack Query 5 + Axios
- React Router 6

**Infrastructure**
- Docker Compose 3.9
- Nginx 1.27 (TLS termination)
- BTCPay Server 2.0 + NBXplorer 2.5
- python-telegram-bot 21.3

---

## API Reference

Interactive docs: `/api/v1/docs` (Swagger UI) and `/api/v1/redoc`.

### Auth

```bash
POST /api/v1/auth/register  {email, password}         → {access_token, refresh_token}
POST /api/v1/auth/login     {email, password}         → {access_token, refresh_token}
POST /api/v1/auth/refresh   {refresh_token}           → {access_token, refresh_token}
GET  /api/v1/auth/me                                  → {id, email, is_active, ...}
```

### GPU Catalog (public)

```bash
GET /api/v1/gpu-models/  → [{slug, name, vram_gb, price_per_hour, packages, is_available}]
```

### Instances

```bash
POST   /api/v1/instances/         {gpu_model_id, ssh_key_id, hours}  → Instance
GET    /api/v1/instances/                                            → [Instance]
GET    /api/v1/instances/{id}                                        → Instance
DELETE /api/v1/instances/{id}                                        → 204
```

### Billing

```bash
POST /api/v1/billing/deposit           {package_id, email?}  → {checkout_url}
POST /api/v1/billing/webhook/btcpay    (BTCPay → MOZART)     → HMAC verified
GET  /api/v1/billing/invoices                                → [Invoice]
GET  /api/v1/billing/balance                                 → {items, total_spent_usd}
```

### SSH Keys

```bash
POST   /api/v1/ssh-keys/  {name, public_key}  → SshKey
GET    /api/v1/ssh-keys/                      → [SshKey]
DELETE /api/v1/ssh-keys/{id}                  → 204
```

### Contact

```bash
POST /api/v1/contact  {name, email, company?, gpu_type?, message?}  → {status: "ok"}
```

---

## Development

### Backend

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env     # Edit JWT_SECRET, DATABASE_URL
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd console
npm install
npm run dev     # Vite dev server on :3000, proxies /api → :8000
```

### Build for production

```bash
cd console && npm run build  # outputs to console/dist/
```

---

## Deployment

### Production checklist

- [ ] Generate strong `JWT_SECRET` (64 hex chars minimum)
- [ ] Set `POSTGRES_PASSWORD` to cryptographically random value
- [ ] Obtain BTCPay Store ID, API key, Webhook secret
- [ ] Register Telegram bot via @BotFather
- [ ] Get vast.ai API key with rental permissions
- [ ] Configure DNS A-records to your VPS IP
- [ ] Run `certbot --nginx -d yourdomain.com` for TLS
- [ ] Set `chmod 600 .env` (secrets are gitignored)
- [ ] Monitor via `docker compose logs -f`

### VPS deployment workflow

```bash
# On your VPS
sudo mkdir -p /var/www/mozartgpu
sudo chown $USER:$USER /var/www/mozartgpu
cd /var/www/mozartgpu
git clone https://github.com/robertkhairislamov-afk/mozartGPU.git .
cp .env.example .env && nano .env   # fill secrets
docker compose up -d --build

# For updates
git pull && docker compose up -d --build
```

---

## Roadmap

### Shipped (v0.2.0, April 2026)

- [x] GPU catalog with seed data (RTX 4090, A100, H100, L40S, RTX 3090)
- [x] BTC / USDT / USDC payments via BTCPay Server
- [x] JWT auth with refresh token rotation
- [x] Background worker (vast.ai status poll, billing ticker, auto-terminate)
- [x] BTCPay webhook with HMAC verification + server-side settlement check
- [x] React Dashboard (Login, Register, Instances, Billing, SSH Keys)
- [x] Telegram bot + admin alerts
- [x] Multilingual landing page (EN/RU)

### Q2 2026

- [ ] P2P GPU marketplace — users rent their own GPUs for 5-20% commission
- [ ] API Keys CRUD (model exists, endpoint pending)
- [ ] Email verification + 2FA/TOTP
- [ ] Admin role + operations panel
- [ ] Rate limiting on auth endpoints
- [ ] Privacy Policy / Terms of Service pages

### Q3-Q4 2026

- [ ] Stripe integration (fiat fallback)
- [ ] Reserved instance pricing
- [ ] Prometheus + Grafana monitoring
- [ ] Multi-region failover
- [ ] Affiliate program

### 2027+

- [ ] VM isolation tier (QEMU/KVM) for enterprise
- [ ] Confidential Computing (AMD SEV / Intel TDX)
- [ ] TPM 2.0 host attestation
- [ ] ISO 27001 certification

---

## Security

- HMAC-SHA256 verification on all BTCPay webhooks
- Server-side invoice settlement re-check (double-verify before provisioning)
- bcrypt password hashing
- JWT with short access token TTL (15 min) + longer refresh (30 days)
- SQLAlchemy parameterized queries (SQL injection safe)
- CORS allowlist (no wildcard in production)
- Secrets in `.env` (gitignored, `chmod 600`)
- TLS 1.2+ enforced via Nginx

**Report vulnerabilities:** `security@mozartgpu.com` (do not file public issues).

---

## Honest Limitations

- **Early stage.** We're testing at scale (50-200 concurrent GPUs). Bugs happen.
- **No uptime SLA.** P2P infrastructure (same as Vast Community). Expect 99.5% during normal hours.
- **Cold start ~30 seconds** for container pull + CUDA init.
- **Host can disconnect.** We don't own the hardware. Failover is manual.
- **Reseller model.** We're a layer over vast.ai, and we're transparent about it. Margin is real (30-40%), we bet on UX and privacy.

---

## License

MIT — see [LICENSE](LICENSE).

---

## Acknowledgments

- [vast.ai](https://vast.ai) — GPU marketplace & provisioning API
- [BTCPay Server](https://btcpayserver.org) — Self-hosted crypto payments
- [FastAPI](https://fastapi.tiangolo.com) — Async Python web framework
- [Docker](https://docker.com) — Container orchestration

---

**Status:** MVP, actively developed. Version **0.2.0**. Last updated: 2026-04-12.
