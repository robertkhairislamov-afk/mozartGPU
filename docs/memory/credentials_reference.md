---
name: Credentials и сервисы
description: Prod домен web3playlab.win, VPS 217.217.250.84, GitHub, Telegram, Vast.ai — всё активно
type: reference
originSessionId: f5216b3d-6abb-494f-ac61-8b9438b6067d
---
## Production (LIVE с 2026-04-11)
- **Домен:** https://web3playlab.win (тестовый, рабочий)
- **VPS:** 217.217.250.84, user btcb, path /var/www/mozartgpu
- **Docker:** postgres + fastapi-app запущены
- **API Health:** https://web3playlab.win/api/v1/health → ok
- **GPU Catalog:** https://web3playlab.win/api/v1/gpu-models/ → 5 GPU
- **Console:** https://web3playlab.win/console/

## Целевой домен
- mozartgpu.com — ещё не куплен

## GitHub
- Repo: https://github.com/robertkhairislamov-afk/mozartGPU

## Telegram Bot
- Username: @mozartgpu_bot
- Token: обновлён 2026-04-10 (в .env на VPS)
- ADMIN_CHAT_ID: 430182182

## Vast.ai
- API Key: обновлён 2026-04-10 (в .env на VPS)

## BTCPay Server
- НЕ настроен (STORE_ID, API_KEY, WEBHOOK_SECRET пусты)

## Деплой workflow
Windows → git push → VPS: git pull && docker compose up -d --build
