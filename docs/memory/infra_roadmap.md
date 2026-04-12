---
name: Infrastructure Roadmap (3 фазы)
description: Полный план инфраструктуры MOZART — MVP за 7 дней, Growth, Enterprise + build vs buy решения
type: project
---

## Фаза 1 — MVP (1-2 месяца, ~$3-8K/мес)

- **Backend**: Python FastAPI monolith
- **БД**: PostgreSQL + Redis + Celery
- **GPU изоляция**: Docker `--gpus device=N`
- **Templates**: 5 штук (PyTorch, TF, vLLM, Jupyter, base CUDA)
- **Платежи**: Stripe, prepaid balance
- **Железо**: Bare-metal от Hetzner (4-8 GPU) ИЛИ ресейл через vast.ai
- **Мониторинг**: Prometheus + Grafana + DCGM Exporter
- **Dashboard**: React + TypeScript + shadcn/ui
- **CLI**: Python, ~500 LOC, обёртка над REST API
- **MVP за 7 дней реально**: 1 bare-metal + FastAPI + Stripe → первый клиент по SSH

## Фаза 2 — Growth (3-6 мес, ~$20-50K/мес)

- 3 сервиса: API, Provisioner, Billing
- Kubernetes + NVIDIA GPU Operator
- Serverless endpoints, network volumes, Teams/RBAC
- Colocation 20-50 GPU

## Фаза 3 — Enterprise (6-12 мес, ~$100-300K/мес)

- 9 микросервисов, multi-node clusters + InfiniBand
- Multi-region (EU + US), SOC 2, SSO
- 100-300 GPU

## Build vs Buy

- **Build**: API (FastAPI), Auth (JWT), Dashboard (React+shadcn), Provisioning (Docker→K8s), Billing engine, CLI/SDK
- **Buy**: Stripe (payments), Resend→SES (email), Cloudflare (CDN), Vanta (SOC2 фаза 3)
- **Self-host**: Prometheus+Grafana (мониторинг)

**Why:** Managed model (не marketplace) — проще архитектура, предсказуемый SLA, но требует capex на железо или ресейл для старта.
**How to apply:** Не over-engineer MVP enterprise-паттернами. Начинать с monolith, разбивать на сервисы по мере роста.
