---
name: Исследование — Go-to-Market стратегия GPU-реселлинга
description: GTM план — outbound-first, GitHub/Reddit/Discord лидген, крипто-ниши (Bittensor, ZK), VRAM калькулятор, 50 B2B клиентов
type: project
---

## Главный принцип: Outbound-first (НЕ inbound)
B2B через PPC = высокий CAC. Начинать с прямого контакта.

## Каналы лидгена (приоритет)
1. **GitHub Events API** — парсить PushEvent/PullRequestEvent с ключевыми словами: `cuda out of memory`, `fine-tuning`, `LoRA`, `vram`, `distributed training`. Инструменты: firecrawl, theHarvester
2. **Hugging Face** — скрапинг авторов моделей (не Meta/Google) через BeautifulSoup + Haystack
3. **Reddit** — r/LocalLLaMA, r/MachineLearning. crawl4ai (500 стр/6 мин). Ключевые: "дешевле RunPod", "не хватает VRAM"
4. **Discord** — мониторинг через n8n + Discord API. Ключевые: "Где взять 8×A100 без KYC?"
5. **Farcaster (Warpcast)** — Web3 соцсеть. Frames = интерактивные мини-приложения прямо в ленте (уникальный канал, никто не делает)

## Outreach (AIDA Framework)
- Письма до 80 слов, персонализированные
- Инструменты: Dittofeed/Mautic (email sequences), SalesGPT на LangGraph (AI-ответы)
- Два шаблона: AI/ML разработчик (GitHub) + Web3/DAO команда

## Позиционирование: "Trust Architecture"
- НЕ "дешевле" а "надёжнее чем P2P, дешевле чем облако"
- On-chain SLA + Escrow — смарт-контракты на условия, автоматический refund
- Прозрачный мониторинг GPU через API

## Без KYC = конкурентное преимущество
- AWS/GCP требуют длительную верификацию
- MOZART: запуск за минуты с оплатой в крипте

## Лид-магниты
1. **VRAM-калькулятор** — рассчитывает потребность VRAM для модели с учётом квантизации → CTA на аренду
2. **Deployment Blueprints** — готовые Docker Compose / Helm charts (vLLM, ZK-Prover)
3. **3D визуализация GPU** на сайте (Three.js — уже есть!)

## Две главные ниши Web3
- **Bittensor субнеты**: Templar (SN3, H100), Chutes (SN64, RTX 4090), 404-GEN (SN17), Bitcast (SN93)
- **ZK-provers**: zkSync Era, StarkNet, Polygon zkEVM, Scroll

## Pricing (2026 benchmarks)
- P2P (Vast/Clore): RTX 4090 $0.15-0.20, A100 $0.85-1.30
- Semi-managed (RunPod): RTX 4090 $0.25-0.45, A100 $1.00-1.50
- Managed (Lambda): RTX 4090 $0.39-0.49, A100 $1.48-1.64
- Hyperscalers: A100 $3.67-4.10
- **MOZART target**: между semi-managed и managed, маржа 40-50%

## Referral программа
- 15-25% комиссия, Revenue Splits через Splits.org (on-chain)
- NFT-тиры для партнёров (Soulbound NFT для VIP, приоритетный доступ к H200/B200)
- Open-Source виджеты "Train on MOZART" в README на GitHub/HF

## KPI
- Цель: **50 B2B-клиентов** (первый milestone)
- 50 клиентов × 10 GPU-ч/день × $0.20 маржи = ~$3,000/мес чистой маржи на старте
- CAC target: <$25, Uptime SLA: 99.99%

## Timeline
- Недели 1-2: GitHub API парсинг, crawl4ai, Discord мониторинг, VRAM-калькулятор
- Недели 2-4: Dittofeed/Mautic, AIDA-шаблоны, SalesGPT, outreach
- Месяц 2-3: Blueprints, Farcaster Frames, реферальная программа
- Квартал 2: Bittensor/ZK выход, pre-seed стартапы, цель 50 клиентов
