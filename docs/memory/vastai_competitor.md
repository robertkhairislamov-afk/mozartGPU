---
name: Vast.ai — конкурентный анализ
description: Полный разбор vast.ai — архитектура, pricing, API, масштаб, сравнение с MOZART
type: reference
---

## Vast.ai — ключевые цифры (2026)

- 17,000+ GPU, 40+ дата-центров, 350+ хостов, 120K+ разработчиков
- Рост 310% за 2024, ~40 сотрудников
- Офисы: LA + SF, основана 2016
- SOC 2 Type I certified
- Миссия: "Organize, optimize, and orient the world's computation"

## Бизнес-модель
- **Marketplace** (P2P): хосты сдают GPU, клиенты арендуют
- 3 типа: On-Demand, Interruptible (-50%), Reserved (-50%)
- 68+ типов GPU (RTX 3060 → B200)
- Хосты получают 100% установленной цены (vast зарабатывает на марже)
- Vast Finance — финансирование оборудования для хостов

## 3 продукта
1. **GPU Cloud** — Docker контейнеры + VM с GPU
2. **Serverless** — PyWorker, autoscaling, zero-downtime updates
3. **Clusters** — InfiniBand, multi-node training

## MOZART vs Vast.ai — positioning
- **Vast.ai** = дешёвый marketplace (P2P, сдай своё железо)
- **MOZART** = premium managed service (как Heroku для AWS — проще, надёжнее)
- Не копировать marketplace модель, акцент на managed experience

## Документация vast.ai
Полная docs на docs.vast.ai: GPU Instances, Templates, Storage (volumes + network volumes + cloud sync), Serverless (endpoints, workergroups, deployments, @remote), Teams/RBAC, Billing, CLI + Python SDK, OpenAPI spec.

**How to apply:** Использовать как reference при проектировании MOZART. Наш API должен быть проще (managed, не marketplace), но покрывать основные use cases vast.ai.
