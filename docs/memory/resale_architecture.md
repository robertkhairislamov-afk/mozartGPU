---
name: GPU Resale Architecture
description: Архитектура ресейла — покупаем GPU у vast.ai/Lambda дёшево, продаём как managed service с наценкой 40-60%
type: project
---

## Бизнес-модель ресейла

Покупаем GPU capacity у провайдеров (vast.ai spot, Lambda, CoreWeave) → перепродаём под брендом MOZART как premium managed service.

### P&L

- **Break-even**: ~1,600 GPU-часов/мес (≈3 GPU 24/7)
- **Маржа**: H100 43%, A100 44%, L40S 50%, RTX 4090 54%
- **При 10K часов/мес**: $4,170 чистой прибыли
- **Инфра costs**: ~$830/мес fixed

### Клиент получает за наценку:
- Managed service (не надо разбираться в vast.ai)
- Автоматический failover при прерывании spot
- Единый dashboard + CLI + API
- Поддержку, простой биллинг

## Техническая архитектура

### Ключевые компоненты:
1. **Provider Abstraction Layer** — единый интерфейс для vast.ai/Lambda/CoreWeave
2. **Smart Routing / Orchestrator** — автовыбор лучшего провайдера по цене/reliability
3. **Instance Lifecycle Manager** — health monitoring 30s, auto-failover, SSH proxy через bastion
4. **Pricing Engine** — dynamic markup 25-150%, demand factor, floor price
5. **Billing** — двойной учёт: provider_billing (что мы платим) + client_billing (что платят нам)

### БД (10 таблиц):
providers, provider_credentials, provider_gpu_offers, mozart_instances, instance_events, provider_billing, client_billing, pricing_rules, price_snapshots, margin_ledger

### Vast.ai API (ключевые endpoints):
- `GET /bundles/` — поиск GPU по фильтрам
- `POST /asks/{offer_id}/` — аренда инстанса
- `GET /instances/{id}/` — статус (polling каждые 30s)
- `DELETE /instances/{id}/` — уничтожение
- Auth: `Authorization: Bearer {API_KEY}`
- Vast НЕ даёт webhook на interruption — только polling

### Failover flow:
Health check fail → pause client billing → snapshot state → create new instance on another provider → restore → update SSH proxy → resume billing → notify client

**Why:** Ресейл позволяет запуститься БЕЗ покупки GPU. Минимальные вложения, быстрый старт, масштабирование по мере роста.
**How to apply:** Начинать с vast.ai как единственного провайдера, добавлять Lambda/CoreWeave по мере роста для диверсификации и failover.
