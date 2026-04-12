---
name: P2P GPU Marketplace план
description: Архитектура двустороннего marketplace — хосты сдают GPU за комиссию 5-20%, host agent daemon, 5 новых таблиц БД
type: project
originSessionId: f5216b3d-6abb-494f-ac61-8b9438b6067d
---
## Дата: 2026-04-10

## Концепция
Расширение MOZART с чистого ресейла (vast.ai → клиенты) до двустороннего marketplace:
любой владелец GPU регистрирует машину, MOZART берёт комиссию 5-20% за каждую аренду.

## Комиссия (tier-based)
- Новичок: 20%, 10+ рентали: 15%, 100+ часов: 10%, 1000+ часов: 5%
- Минимальный payout: $20

## Новые таблицы БД
- hosts (user_id FK, status, verification_level, reputation, payout_address)
- host_machines (hostname, gpu_count, agent_status, last_heartbeat)
- host_gpus (gpu_type, vram, price_per_hour, benchmark_score, status)
- host_rentals (host_gpu_id, client_id, hourly_rate, commission%, rating)
- host_payouts (amount, destination_address, blockchain_tx_hash)

## Host Agent
- Python async daemon ~500 LOC
- Heartbeat каждые 30 сек, GPU telemetry (nvidia-smi)
- PyTorch benchmark при онбординге (5 мин stress-test)
- Docker isolation для клиентов (--gpus device=N)

## API: /api/v1/hosts/
- register, machines, gpus/{id}/verify, gpus/{id}/price, earnings, payouts/request

## Quality: uptime ≥95%, auto-delist при 5 missed heartbeats, рейтинг < 3.0 → бан

## P2P параллельно с vast.ai ресейлом — не ломает текущую архитектуру

## Timeline MVP: 3-4 недели (17 дней dev + 3 QA)

**Why:** Горизонтальное масштабирование без капитальных вложений в GPU. Каждый хост = бесплатный inventory.
**How to apply:** Реализовать после стабилизации текущего MVP (баги #9, #10, #14 + деплой).
