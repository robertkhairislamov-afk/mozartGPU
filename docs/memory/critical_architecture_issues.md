---
name: Критические архитектурные проблемы
description: Статус 16 багов от QA аудита — 13 закрыто в сессии 4, 3 осталось
type: project
originSessionId: f5216b3d-6abb-494f-ac61-8b9438b6067d
---
## Дата последнего обновления: 2026-04-10, сессия 4.

## ГЛАВНАЯ ПРОБЛЕМА: РЕШЕНА
MVP-1 и MVP-2 объединены через shared Postgres (asyncpg в auto_provision.py + SQLAlchemy в FastAPI). Единый docker-compose с 8 сервисами. BTCPay webhook в обоих.

## ЗАКРЫТЫЕ БАГИ (13/16):

| # | Баг | Фикс |
|---|-----|------|
| 1 | Кнопки → Telegram | → /console/#/new-instance |
| 2 | MVP-2 не в compose | +fastapi-app + console сервисы |
| 3 | Нет webhook в FastAPI | POST /api/v1/billing/webhook/btcpay |
| 4 | Нет background worker | worker.py: poll_vast_loop + hours_tracking_loop |
| 5 | hours_used = 0 | worker.py: тикер каждые 60с + auto-terminate |
| 6 | Цены в 4 местах | gpu_models таблица с seed data, _resolve_package_price() |
| 7 | create_instance no return | +return instance + db.commit() + db.refresh() |
| 8 | /pricing → 404 | smooth scroll к #packages |
| 11 | CLI/SDK не существуют | секция переписана на Dashboard/Telegram/Crypto |
| 12 | L40S/RTX3090 нет в backend | добавлены в seed data (is_available=False) |
| 13 | Invoice ↔ Instance нет FK | Instance.invoice_id FK |
| 15 | SSH → только admin | vast.ai poll заполняет ssh_host/ssh_port в worker |
| 16 | Contact form alert() | fetch POST /api/v1/contact |

## ОСТАВШИЕСЯ БАГИ (3):

### #9 Template selection — cosmetic
Wizard передаёт только gpu_model_id, ssh_key_id, hours. selectedTemplate не в payload.

### #10 Disk slider — cosmetic
disk_gb=50 захардкожен в instances.py. Слайдер в UI декоративный.

### #14 Instance без проверки оплаты
create_instance не проверяет наличие settled Invoice. Любой auth пользователь может создать инстанс.
**Fix:** Проверить наличие settled invoice с достаточным балансом перед провижинингом.
