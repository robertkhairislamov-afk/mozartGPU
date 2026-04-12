---
name: Бухгалтерия и финансы MOZART
description: Биллинг (prepaid + Stripe), двойной учёт, налоги (VAT OSS, US LLC), P&L структура, инструменты
type: project
---

## Финансовый стек MVP (~$100/мес):
- **Stripe Billing** — prepaid wallet, auto top-up при balance < threshold
- **Stripe Tax** ($0.50% от taxable volume) — автоматический VAT/Sales Tax
- **Xero** ($42/мес) — бухгалтерия с нативным Stripe sync
- Минимальное пополнение: $10, рекомендуемые суммы: $10/$25/$50/$100/$500

## Revenue Recognition (критично):
- Выручка при ИСПОЛЬЗОВАНИИ GPU, НЕ при пополнении баланса
- Пополнение = Deferred Revenue (Liability), расход GPU = Revenue

## Dual Ledger — двойной учёт каждой сессии:
- provider_cost (что мы платим vast.ai) → COGS
- client_revenue (что платят нам) → Revenue
- gross_margin = автоматически

## Reconciliation Pipeline (BullMQ):
- Каждые 15 мин: fetch provider API → compare → auto-reconcile если <$0.01
- Ежедневно: финальная сверка
- Ежемесячно: P&L по GPU типу, провайдеру, клиенту

## Налоги:
- Estonia OÜ: 0% на реинвестированную прибыль
- EU VAT OSS: обязателен при B2C >€10K/год, Stripe Tax решает автоматически
- US Sales Tax: Stripe Tax
- РФ НДС: enforcement минимален для EU entity, но формально 20% обязателен

## KPI трекать:
- MRR, ARPU, Churn, LTV:CAC (target >3:1), Gross Margin (target 40-60%)
- GPU Utilization Rate, Mean Time to GPU (<3 min), Reconciliation Discrepancy (<0.1%)

## Break-even: $1,205/мес выручки (~1,600 GPU-часов)

**Why:** Prepaid + dual ledger = ноль кредитного риска + точный margin tracking.
**How to apply:** Stripe Tax включить с первого дня. Xero sync автоматизировать. Reconciliation — 3-4 дня разработки.
