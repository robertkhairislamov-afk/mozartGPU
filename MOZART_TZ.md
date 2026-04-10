# MOZART GPU Cloud -- Техническое задание (MVP)

**Версия:** 1.1 (stress-tested)
**Дата:** 2026-04-10
**Автор:** Tech Lead (Claude Opus 4.6)
**Заказчик:** Роберт, Founder & CEO

---

## Содержание

1. [Обзор проекта](#1-обзор-проекта)
2. [Функциональные требования](#2-функциональные-требования)
3. [Нефункциональные требования](#3-нефункциональные-требования)
4. [Техническая архитектура](#4-техническая-архитектура)
5. [Дизайн и UX](#5-дизайн-и-ux)
6. [Интеграции](#6-интеграции)
7. [План реализации](#7-план-реализации)
8. [Метрики успеха](#8-метрики-успеха)
9. [Риски и митигация](#9-риски-и-митигация)
10. [Бюджет](#10-бюджет)

---

## 1. Обзор проекта

### 1.1 Описание продукта

MOZART -- премиальная платформа аренды GPU по часам (GPU-as-a-Service). Managed-модель ресейла: закупаем GPU-мощности у провайдеров (vast.ai, Lambda, CoreWeave) по оптовым/spot-ценам, перепродаём конечным клиентам как managed service с наценкой 40-80%.

Позиционирование: **"Надёжнее чем P2P-маркетплейсы, дешевле чем гиперскейлеры"**. Не marketplace (vast.ai), не hyperscaler (AWS). Промежуточный сегмент -- semi-managed / managed.

### 1.2 Бизнес-модель

```
[vast.ai spot/on-demand] --закупка--> [MOZART backend] --наценка 40-80%--> [Клиент]
```

**Юнит-экономика по GPU:**

| GPU       | Закупка ($/ч) | Продажа ($/ч) | Маржа  |
|-----------|---------------|----------------|--------|
| RTX 4090  | 0.29-0.33     | 0.80           | 54%    |
| RTX 3090  | 0.15-0.20     | 0.45           | 55%+   |
| L40S      | 0.50-0.60     | 1.20           | 50%    |
| A100 80GB | 0.60-1.19     | 1.80           | 44-60% |
| H100 80GB | 1.54-2.25     | 2.50           | 43-60% |

**Break-even:** ~1,600 GPU-часов/мес (~$1,205 выручки/мес). Это 3 GPU, работающих 24/7.

**Скрытые издержки, заложенные в расчёт:**
- "Горячий резерв" -- прогретые инстансы для быстрого деплоя
- Storage tax -- vast.ai тарифицирует диск при паузе
- SLA-компенсации -- до 30% прибыли без AIOps
- Egress fees -- до $7,500/мес для кластера 4xH100

### 1.3 Целевая аудитория

**Сегмент 1 (приоритет) -- ML-инженеры и AI-исследователи**
- Независимые разработчики и малые команды
- Задачи: fine-tuning LLM, inference, training
- Болезнь: нет бюджета на AWS, vast.ai ненадёжен
- Объём: 10-100 GPU-часов/неделю

**Сегмент 2 -- Web3/DAO команды**
- Bittensor субнеты: Templar (SN3, H100), Chutes (SN64, RTX 4090), 404-GEN (SN17), Bitcast (SN93)
- ZK-provers: zkSync Era, StarkNet, Polygon zkEVM, Scroll
- Болезнь: нужен GPU без KYC, оплата в крипте
- Объём: 24/7 постоянная аренда

**Сегмент 3 -- Операторы AI-агентов**
- Inference для продакшен-сервисов
- Болезнь: нужна эластичная инфраструктура с посекундной тарификацией
- Объём: бёрстовые нагрузки

### 1.4 Конкурентные преимущества

| Преимущество              | vs Vast.ai              | vs RunPod              | vs AWS/GCP               |
|---------------------------|-------------------------|------------------------|--------------------------|
| SLA с автоматическим refund | Нет SLA               | Потеря данных          | Есть, но дорого          |
| Без KYC, оплата крипто   | Есть, P2P              | Нет крипто             | Требуют верификацию       |
| Автоматический failover   | Нет (polling, хост offline) | Нет               | Есть, но vendor lock     |
| Статические IP/эндпоинты  | Нет                    | Ограничено             | Есть                     |
| Единый CLI + API + Dashboard | CLI есть            | Dashboard есть         | Переусложнённый UI       |
| Managed experience        | P2P marketplace        | Semi-managed           | Fully managed            |
| Цена (H100/ч)            | $1.54-2.25             | $2.49                  | $3.67+                   |
| **MOZART (H100/ч)**      | **$2.50**              | **$2.50**              | **$2.50**                |

---

## 2. Функциональные требования

### 2.1 MVP-1: "Ручной старт" (Неделя 1, 9-16 апреля 2026)

**Цель:** Первые продажи через лендинг + ручной provisioning. Ноль backend-кода.

#### 2.1.1 BTCPay Server интеграция

**P0 -- критический путь к первой оплате.**

- Развёртывание BTCPay Server (self-hosted, Docker на VPS)
- Принимаемые валюты: BTC, USDT (Tron TRC-20), USDC (Tron TRC-20 / ERC-20)
- Тарифы: prepaid пакеты часов (нет посекундной тарификации на MVP-1)
- Конвертация в фиат: Bybit Card (крипто -> USD для оплаты vast.ai)

**Пакеты для MVP-1:**

| Пакет         | Часы     | GPU         | Цена (USDT) | Маржа |
|---------------|----------|-------------|-------------|-------|
| Starter       | 10 ч     | RTX 4090    | $8          | 54%   |
| Pro           | 50 ч     | RTX 4090    | $35         | 57%   |
| ML Basic      | 10 ч     | A100 80GB   | $18         | 50%   |
| ML Pro        | 50 ч     | A100 80GB   | $80         | 55%   |
| Enterprise    | 10 ч     | H100 80GB   | $25         | 50%   |
| Enterprise+   | 50 ч     | H100 80GB   | $110        | 56%   |
| Custom        | По запросу | Любой      | Индивидуально | 40%+ |

**Интеграция в лендинг:**
- Кнопка "Rent Now" на каждой GPU-карточке -> переход на pricing page
- Pricing page: выбор пакета -> BTCPay invoice (redirect или iframe)
- После оплаты: BTCPay webhook -> Telegram-уведомление founder'у
- Founder вручную создаёт инстанс на vast.ai, отправляет SSH-credentials клиенту

#### 2.1.2 Telegram Bot для заявок и поддержки

**P0 -- канал коммуникации с клиентами до появления Dashboard.**

Функционал бота:
- `/start` -- приветствие, описание сервиса
- `/rent <gpu> <hours>` -- создать заявку на аренду
- `/status` -- статус текущей аренды (ручной ввод founder'ом)
- `/prices` -- текущий прайс-лист
- `/support <message>` -- обращение в поддержку
- Webhook от BTCPay: бот уведомляет founder'а о новой оплате
- Бот уведомляет клиента: "Ваш GPU готов. SSH: `ssh root@<ip> -p <port>`"

**Стек:** Python (python-telegram-bot), запуск как systemd-сервис на том же VPS, что BTCPay.

#### 2.1.3 Ручной provisioning (SOP)

Стандартная операционная процедура для founder'а:

```
1. Получить уведомление от Telegram Bot (оплата прошла)
2. Зайти на vast.ai -> "Search" -> выбрать нужный GPU
3. Фильтры: gpu_name, num_gpus=1, inet_down>200, reliability>0.95
4. Выбрать cheapest -> "Rent" -> выбрать template (PyTorch/vLLM)
5. Дождаться статуса "Running" (~30-120с)
6. Скопировать SSH-адрес: ssh -p PORT root@IP
7. Отправить клиенту через Telegram Bot
8. Записать в Google Sheet: client_id, gpu, start_time, vast_cost, client_paid
9. По истечении часов: уничтожить инстанс на vast.ai, уведомить клиента
```

#### 2.1.4 Pricing Page

Новая страница `pricing.html` (или секция в index.html):
- 6 пакетов (таблица выше) с кнопками "Pay with Crypto"
- Каждая кнопка: ссылка на BTCPay Store -> создание Invoice
- Калькулятор: ввод количества часов -> расчёт стоимости
- Сравнительная таблица: MOZART vs Vast.ai vs RunPod vs AWS
- FAQ по оплате крипто
- CTA: Telegram Bot для custom-запросов

#### 2.1.5 Лендинг -- финальные доработки для продаж

Из audit_roadmap (P0, до деплоя):
- [ ] Favicon
- [ ] OG + Twitter Card meta-теги
- [ ] Self-host Three.js (убрать CDN без SRI)
- [ ] CSP meta-тег
- [ ] .gitignore
- [ ] Определить CSS-класс `.p2`
- [ ] `:focus-visible` стили
- [ ] Исправить RTX 4090 TFLOPS: 330 -> 165 FP32

Деплой:
- [ ] Git init + GitHub private repo
- [ ] Cloudflare Pages (бесплатный план)
- [ ] Custom domain: mozart.gpu или mozartgpu.com
- [ ] `_headers` файл для кэширования и security headers
- [ ] Cloudflare Web Analytics

---

### 2.2 MVP-2: "Автоматизация" (Недели 2-4, 16 апреля - 7 мая 2026)

**Цель:** Backend API, автоматический provisioning, первая версия CLI.

#### 2.2.1 Backend API (FastAPI monolith)

**Фреймворк:** Python 3.12 + FastAPI + Pydantic v2 + SQLAlchemy 2.0 (async)
**БД:** PostgreSQL 16 + Redis 7 + Celery (async tasks)
**Деплой:** Docker Compose на VPS (Hetzner CX31 ~$15/мес)

**Эндпоинты:**

##### Auth

```
POST   /api/v1/auth/register          -- регистрация (email + password)
POST   /api/v1/auth/login             -- получить JWT (access 15min + refresh 30d)
POST   /api/v1/auth/refresh           -- обновить access token
POST   /api/v1/auth/logout            -- инвалидировать refresh token
GET    /api/v1/auth/me                -- текущий пользователь
```

##### GPU Catalog

```
GET    /api/v1/gpus                   -- список доступных GPU (cached 60s)
GET    /api/v1/gpus/{gpu_id}          -- детали GPU (спеки, цена, availability)
GET    /api/v1/gpus/availability      -- real-time доступность по типам
```

##### Instances

```
POST   /api/v1/instances              -- создать инстанс (gpu_type, template, ssh_key_id)
GET    /api/v1/instances              -- список инстансов пользователя
GET    /api/v1/instances/{id}         -- детали инстанса (IP, port, status, cost)
POST   /api/v1/instances/{id}/stop    -- остановить
POST   /api/v1/instances/{id}/start   -- перезапустить
DELETE /api/v1/instances/{id}         -- уничтожить
GET    /api/v1/instances/{id}/logs    -- логи (последние N строк)
GET    /api/v1/instances/{id}/metrics -- CPU/GPU/RAM/Network метрики
```

##### Billing

```
GET    /api/v1/billing/balance        -- текущий баланс
POST   /api/v1/billing/deposit        -- создать BTCPay invoice для пополнения
GET    /api/v1/billing/invoices       -- история инвойсов
GET    /api/v1/billing/usage          -- детализация расходов по инстансам
POST   /api/v1/billing/webhook/btcpay -- BTCPay callback (internal)
```

##### SSH Keys

```
GET    /api/v1/ssh-keys               -- список SSH-ключей
POST   /api/v1/ssh-keys               -- добавить SSH-ключ (public key)
DELETE /api/v1/ssh-keys/{id}          -- удалить
```

##### Templates

```
GET    /api/v1/templates              -- список шаблонов (PyTorch, vLLM, Jupyter, CUDA, TF)
GET    /api/v1/templates/{id}         -- детали шаблона
```

##### Health & Meta

```
GET    /api/v1/health                 -- healthcheck
GET    /api/v1/status                 -- статус платформы (GPU availability summary)
```

**Auth модель:**
- JWT Access Token (15 мин) + Refresh Token (30 дней, хранится в Redis)
- API Keys для CLI/SDK: `mzt_sk_<base64_random_32>`
- Rate limiting: 100 req/min для auth endpoints, 1000 req/min для остальных

#### 2.2.2 Provider Abstraction Layer (PAL)

Единый интерфейс для взаимодействия с GPU-провайдерами. MVP-2 = только vast.ai.

```python
class ProviderInterface(ABC):
    """Абстрактный интерфейс для GPU-провайдера."""

    @abstractmethod
    async def search_offers(self, gpu_type: str, min_ram: int,
                            min_reliability: float) -> list[GpuOffer]:
        """Поиск доступных GPU."""

    @abstractmethod
    async def create_instance(self, offer_id: str, template: str,
                              ssh_key: str, disk_gb: int) -> ProviderInstance:
        """Создать инстанс."""

    @abstractmethod
    async def get_instance(self, instance_id: str) -> ProviderInstance:
        """Получить статус инстанса."""

    @abstractmethod
    async def destroy_instance(self, instance_id: str) -> bool:
        """Уничтожить инстанс."""

    @abstractmethod
    async def get_cost(self, instance_id: str) -> Decimal:
        """Текущая стоимость у провайдера."""
```

**VastAiProvider** (реализация):
- `GET /bundles/` -- поиск GPU по фильтрам (gpu_name, num_gpus, cuda_vers, inet_down, reliability)
- `PUT /asks/{offer_id}/` -- аренда инстанса (image, disk, onstart_cmd)
- `GET /instances/{id}/` -- статус (created, loading, running, exited, error)
- `DELETE /instances/{id}/` -- уничтожение
- Auth: `Authorization: Bearer {VAST_API_KEY}`
- **Polling каждые 30 секунд** (vast.ai НЕ предоставляет webhooks на interruption)

#### 2.2.3 Instance Lifecycle Manager

Celery-задачи для управления жизненным циклом:

```
[create_instance]
  1. Проверить баланс клиента >= estimated_cost (минимум 1 час)
  2. PAL.search_offers() -> выбрать cheapest с reliability > 0.95
  3. PAL.create_instance()
  4. Сохранить в БД: mozart_instances (status=PROVISIONING)
  5. Запустить health_check_task (periodic, 30s)
  6. При status=RUNNING: отправить клиенту SSH-credentials (Telegram/email/webhook)

[health_check_task] (periodic, каждые 30 секунд)
  1. PAL.get_instance() -> проверить status
  2. Если RUNNING -> обновить last_health_check
  3. Если ERROR/EXITED:
     a. Приостановить клиентский биллинг
     b. Попытаться перезапустить (1 попытка)
     c. Если не удалось -> failover на другой инстанс:
        - Создать новый инстанс на другом хосте/провайдере
        - Обновить SSH-proxy (если есть bastion)
        - Уведомить клиента
     d. Записать событие в instance_events

[billing_tick_task] (periodic, каждые 60 секунд)
  1. Для каждого RUNNING инстанса:
     a. client_cost = ceil(elapsed_seconds / 3600) * hourly_rate
     b. provider_cost = PAL.get_cost(instance_id)
     c. Записать в dual ledger
     d. Если balance < hourly_rate: предупреждение (30 мин до стопа)
     e. Если balance <= 0: auto-stop инстанса

[destroy_instance]
  1. PAL.destroy_instance()
  2. Финальная запись биллинга
  3. Обновить статус в БД
  4. Уведомить клиента
```

#### 2.2.4 Pricing Engine

```python
class PricingEngine:
    """Динамическое ценообразование с учётом себестоимости и спроса."""

    def calculate_price(self, gpu_type: str, provider_cost: Decimal) -> Decimal:
        base_markup = self.get_markup(gpu_type)      # 1.40 - 1.80
        demand_factor = self.get_demand_factor()      # 0.9 - 1.3
        floor_price = self.get_floor_price(gpu_type)  # минимальная цена
        price = max(provider_cost * base_markup * demand_factor, floor_price)
        return price.quantize(Decimal('0.01'))
```

Разметка по GPU:
- RTX 3090: x1.80 (высокий markup, низкая закупка)
- RTX 4090: x1.60
- L40S: x1.50
- A100: x1.50
- H100: x1.40 (низкий markup, высокая абсолютная маржа)

#### 2.2.5 Webhook-уведомления клиентам

При изменении статуса инстанса:

```json
POST {client_webhook_url}
{
  "event": "instance.status_changed",
  "instance_id": "mzt_inst_abc123",
  "status": "running",
  "gpu_type": "H100",
  "ssh_host": "45.67.89.101",
  "ssh_port": 22345,
  "timestamp": "2026-04-15T14:30:00Z",
  "signature": "sha256=..."
}
```

События: `instance.created`, `instance.running`, `instance.stopped`, `instance.error`, `instance.failover`, `billing.low_balance`, `billing.deposit_confirmed`.

#### 2.2.6 CLI (базовый)

**Язык:** Python, ~500 LOC, обёртка над REST API.
**Установка:** `pip install mozart-cli`
**Конфигурация:** `~/.mozart/config.yaml` (api_key, default_gpu, default_template)

```bash
# Auth
mozart auth login                     # интерактивный логин -> сохраняет API key
mozart auth whoami                    # текущий пользователь

# GPU каталог
mozart gpus list                      # таблица доступных GPU
mozart gpus list --type h100          # фильтр по типу

# Инстансы
mozart create --gpu h100 --template pytorch --disk 50
mozart list                           # список моих инстансов
mozart ssh <instance_id>              # подключиться по SSH
mozart stop <instance_id>
mozart destroy <instance_id>
mozart logs <instance_id> --tail 100

# Биллинг
mozart balance                        # текущий баланс
mozart deposit 50                     # создать инвойс на $50

# SSH Keys
mozart ssh-keys add ~/.ssh/id_rsa.pub
mozart ssh-keys list
```

---

### 2.3 MVP-3: "Dashboard" (Месяц 2-3, май-июнь 2026)

**Цель:** Полноценный web-интерфейс. Самообслуживание клиентов без Telegram.

**Стек:** React 18 + TypeScript + Vite + shadcn/ui + TanStack Query + Tailwind CSS v4
**Layout:** Collapsible Left Sidebar (240px -> 64px -> hidden) + Top Bar. Dark mode only (бренд MOZART).
**Mobile:** Bottom navigation (4 иконки).

#### 10 экранов Dashboard

##### Экран 1: Dashboard (Home)
- KPI-карточки: Balance, Running GPUs, Today's Spend, Monthly Budget
- Таблица Active Instances (status, GPU, uptime, cost)
- Usage chart (area chart, последние 7 дней)
- Quick Actions: "Launch GPU", "Add Funds", "View Docs"

##### Экран 2: Instances (список)
- DataTable с сортировкой и фильтрами (status, GPU type, date)
- Колонки: Name, GPU, Status, Uptime, Cost/hr, Total Cost, Actions
- Status badges: Running (emerald pulse), Stopped (gray), Error (red), Starting (amber spin)
- Mobile: card layout вместо таблицы

##### Экран 3: Create Instance (wizard, 4 шага)
- **Шаг 1 -- GPU:** Grid карточек с hover gold border, selected = gold glow + checkmark. Показать: тип, VRAM, цена/ч, availability
- **Шаг 2 -- Template:** Выбор из 5 templates (PyTorch, TF, vLLM, Jupyter, CUDA) или custom Docker image
- **Шаг 3 -- Config:** Region preference, Disk size (slider), SSH Key (select), Auto-stop timer, Spot/On-demand toggle
- **Шаг 4 -- Review:** Summary + estimated cost (1ч / 24ч / 7д) + "Deploy" button
- After deploy: redirect на Instance Detail

##### Экран 4: Instance Detail
- Info panel: GPU, IP, Port, Status, Uptime, Cost
- Tabs:
  - **Terminal:** embedded SSH terminal (xterm.js + WebSocket)
  - **Logs:** realtime log viewer
  - **Metrics:** GPU utilization, memory, temperature, network (realtime, WebSocket)
- Actions: Stop, Restart, Destroy (с confirmation modal)
- Copy-to-clipboard: SSH-команда

##### Экран 5: Billing
- Current balance (large number)
- Burn rate: $/hr при текущей нагрузке
- Auto top-up toggle: при balance < threshold, автоматически создать BTCPay invoice
- Usage chart: BarChart по дням/неделям
- Invoice history: DataTable (date, amount, status, method, receipt)
- "Add Funds" button: выбор суммы ($10 / $25 / $50 / $100 / $500 / custom) -> BTCPay

##### Экран 6: API Keys
- DataTable: name, prefix (mzt_sk_...), permissions, created, last_used
- "Create Key" -> modal: name, permissions checkboxes -> one-time show after creation
- Revoke key (с confirmation)

##### Экран 7: SSH Keys
- DataTable: name, fingerprint (SHA256:...), added date
- "Add Key" -> modal: paste public key, auto-detect name
- Delete key

##### Экран 8: Templates
- 3 вкладки: Official (5 штук) / My Templates / Custom Docker Image
- Карточка template: icon, name, description, base image, GPU compatibility
- "Use Template" -> redirect на Create Instance (шаг 2 prefilled)

##### Экран 9: Settings
- Profile: name, email, avatar
- Security: change password, 2FA (TOTP)
- Notifications: email/Telegram/webhook toggles по событиям
- Team (Growth): invite members, RBAC roles (owner, admin, member, billing)
- Danger Zone: delete account, export data

##### Экран 10: Onboarding
- Checklist (progressive): Add SSH Key -> Add Funds -> Launch First GPU
- Contextual hints (tooltips)
- Empty states с CTA на каждом экране
- "Skip" option

#### Realtime (WebSocket)

```
ws://api.mozart.gpu/ws?token=<jwt>

// Server -> Client events:
{ "type": "instance.status", "instance_id": "...", "status": "running" }
{ "type": "instance.metrics", "instance_id": "...", "gpu_util": 87, "mem_used": 65 }
{ "type": "billing.balance", "balance": "142.50" }
{ "type": "billing.low_balance", "balance": "5.20", "eta_minutes": 45 }
```

---

### 2.4 Growth (Месяц 3-6, июль-сентябрь 2026)

#### 2.4.1 Multi-Provider
- Lambda Labs adapter (ProviderInterface)
- CoreWeave adapter
- Smart Routing: автоматический выбор cheapest + reliable провайдера
- Failover между провайдерами (не только между хостами)

#### 2.4.2 Serverless Endpoints
- Пользователь загружает модель -> MOZART разворачивает inference endpoint
- Autoscaling: 0 -> N GPU по нагрузке
- Pay-per-request (не per-hour)
- REST API: `POST /v1/endpoints` (model, min_replicas, max_replicas)

#### 2.4.3 Teams / RBAC
- Организации: owner -> admin -> member -> billing
- Shared billing / раздельный billing
- Audit log всех действий
- Invite по email

#### 2.4.4 Templates Marketplace
- Community templates (Docker images)
- "One-click deploy" кнопка в каталоге
- Версионирование templates
- Deployment Blueprints: готовые Docker Compose / Helm charts (vLLM, ZK-Prover)

#### 2.4.5 Referral программа
- 15-25% комиссия реферреру
- Revenue Splits через Splits.org (on-chain)
- NFT-тиры для партнёров (Soulbound NFT для VIP)
- Open-Source виджеты "Train on MOZART" для README на GitHub/HF

#### 2.4.6 Фиатные платежи (Thai Company)
- Регистрация Thai Limited Company (Siam Legal / Juslaws)
- Omise/Opn Payments -- карточные платежи без риска блокировки РФ бенефициара
- Bangkok Bank бизнес-счёт
- Non-B виза + Work Permit

---

## 3. Нефункциональные требования

### 3.1 Performance

| Метрика                    | Целевое значение | Измерение               |
|----------------------------|------------------|--------------------------|
| Время деплоя GPU           | < 60 секунд      | От нажатия Deploy до SSH ready |
| API Latency (p95)          | < 200 мс         | Prometheus histograms    |
| API Latency (p99)          | < 500 мс         | Prometheus histograms    |
| Dashboard TTI              | < 2 секунды       | Lighthouse               |
| WebSocket latency          | < 100 мс         | Ping/pong measurement    |
| Billing tick accuracy      | < 1 секунда       | Drift monitoring         |
| CLI response time          | < 1 секунда       | Cold start to output     |

### 3.2 Security

| Требование                        | Реализация                                    | Фаза   |
|-----------------------------------|-----------------------------------------------|--------|
| HTTPS everywhere                  | Cloudflare SSL (landing), Let's Encrypt (API) | MVP-1  |
| Credentials encryption at rest    | AES-256, env vars, never in code              | MVP-2  |
| JWT + API Key auth                | Access 15min, Refresh 30d, Redis blacklist    | MVP-2  |
| Rate limiting                     | Redis-based, per-IP + per-user                | MVP-2  |
| Input validation                  | Pydantic v2 strict mode                       | MVP-2  |
| SQL injection prevention          | SQLAlchemy ORM (parameterized queries)        | MVP-2  |
| OFAC screening (basic)            | IP geolocation check, blocked countries list  | MVP-2  |
| Geo-blocking                      | Cloudflare Firewall Rules (OFAC countries)    | MVP-1  |
| CSP headers                       | Strict Content-Security-Policy                | MVP-1  |
| 2FA (TOTP)                        | pyotp, QR code setup                          | MVP-3  |
| Audit log                         | Все мутации логируются с user_id, IP, action  | MVP-3  |
| SOC 2 Type I                      | Vanta automation                              | Growth |
| Vast.ai API key rotation          | Quarterly, encrypted in Vault                 | MVP-2  |

**OFAC compliance (минимальная):**
- Блокировка IP из OFAC-sanctioned стран (Cloudflare Firewall)
- Отсутствие KYC на MVP = отсутствие обязанности проверять SDN List
- При Thai Company: KYC через Omise, Omise проверяет сам

### 3.3 Reliability

| Метрика                  | Целевое значение | Реализация                       |
|--------------------------|------------------|----------------------------------|
| Uptime SLA               | 99.9%            | Auto-failover, multi-host        |
| Health check interval    | 30 секунд         | Celery beat task                 |
| Failover time            | < 3 минуты        | Auto-provision on new host       |
| Data persistence         | Volumes preserved | Vast.ai disk_space reservation   |
| Billing accuracy         | 99.99%           | Dual ledger + reconciliation     |
| Reconciliation frequency | 15 минут          | Celery periodic task             |
| Backup frequency (DB)    | Daily             | pg_dump to S3-compatible storage |

### 3.4 Scalability

| Параметр                | MVP-2          | Growth          | Enterprise      |
|-------------------------|----------------|-----------------|-----------------|
| Concurrent GPU instances | 5-20          | 20-100          | 100-500         |
| Registered users         | 10-50         | 50-500          | 500-5000        |
| API requests/min         | 100           | 1,000           | 10,000          |
| Providers supported      | 1 (vast.ai)  | 3               | 5+              |
| DB size                  | < 1 GB        | < 10 GB         | < 100 GB        |
| WebSocket connections    | 50            | 500             | 5,000           |

---

## 4. Техническая архитектура

### 4.1 Схема сервисов (MVP-2)

```
                     +------------------+
                     |   Cloudflare     |
                     |   (CDN + WAF)    |
                     +--------+---------+
                              |
              +---------------+----------------+
              |                                |
    +---------v---------+          +-----------v-----------+
    |   Landing Page    |          |    FastAPI Monolith    |
    |  (Cloudflare      |          |    (Docker, VPS)       |
    |   Pages)          |          |                        |
    +-------------------+          |  +------------------+  |
                                   |  | Auth Module      |  |
    +-------------------+          |  | Instances Module  |  |
    |   React Dashboard |          |  | Billing Module   |  |
    |  (Cloudflare      |<-------->|  | Templates Module |  |
    |   Pages)          |   API    |  | SSH Keys Module  |  |
    +-------------------+          |  +------------------+  |
                                   |                        |
    +-------------------+          |  +------------------+  |
    |   CLI / SDK       |<-------->|  | WebSocket Server |  |
    |  (Python pip)     |   API    |  +------------------+  |
    +-------------------+          |                        |
                                   |  +------------------+  |
    +-------------------+          |  | Celery Workers   |  |
    |   Telegram Bot    |<-------->|  | - Health checks  |  |
    |  (same VPS)       |   API    |  | - Billing ticks  |  |
    +-------------------+          |  | - Provisioning   |  |
                                   |  +------------------+  |
                                   +----------+-------------+
                                              |
                   +--------------------------+---------------------------+
                   |                          |                           |
          +--------v--------+       +--------v--------+        +---------v--------+
          |   PostgreSQL    |       |     Redis       |        |  Provider Layer  |
          |   (primary DB)  |       |  (cache, queue, |        |                  |
          |                 |       |   sessions)     |        |  +------------+  |
          +-----------------+       +-----------------+        |  | vast.ai    |  |
                                                               |  | adapter    |  |
          +------------------+                                 |  +------------+  |
          |   BTCPay Server  |                                 |  | Lambda     |  |
          |  (self-hosted,   |                                 |  | (Growth)   |  |
          |   Docker)        |                                 |  +------------+  |
          +------------------+                                 +------------------+
                                                                        |
          +------------------+                                          |
          |   Prometheus +   |                                +---------v---------+
          |   Grafana        |                                |   Vast.ai API     |
          |  (monitoring)    |                                |   (external)      |
          +------------------+                                +-------------------+
```

### 4.2 База данных (PostgreSQL)

#### Таблица: users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(100),
    telegram_id     BIGINT,
    totp_secret     VARCHAR(64),           -- 2FA (MVP-3)
    is_active       BOOLEAN DEFAULT true,
    is_verified     BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Таблица: api_keys
```sql
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    key_hash        VARCHAR(255) NOT NULL,     -- SHA-256 of full key
    key_prefix      VARCHAR(12) NOT NULL,      -- mzt_sk_xxxx (for display)
    permissions     JSONB DEFAULT '["all"]',
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
```

#### Таблица: ssh_keys
```sql
CREATE TABLE ssh_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    public_key      TEXT NOT NULL,
    fingerprint     VARCHAR(100) NOT NULL,     -- SHA256:...
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Таблица: providers
```sql
CREATE TABLE providers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL UNIQUE,  -- 'vastai', 'lambda', 'coreweave'
    is_active       BOOLEAN DEFAULT true,
    api_base_url    VARCHAR(255) NOT NULL,
    priority        INT DEFAULT 0,                -- for smart routing
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Таблица: provider_credentials
```sql
CREATE TABLE provider_credentials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id     UUID REFERENCES providers(id),
    api_key_enc     BYTEA NOT NULL,               -- AES-256 encrypted
    balance_usd     DECIMAL(10,2) DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    last_checked    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Таблица: gpu_models
```sql
CREATE TABLE gpu_models (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL,          -- 'H100', 'A100', 'RTX 4090'
    vram_gb         INT NOT NULL,
    memory_type     VARCHAR(20),                   -- 'HBM3', 'HBM2e', 'GDDR6X'
    bandwidth_tbps  DECIMAL(5,2),
    tflops_fp32     DECIMAL(8,2),
    tflops_fp16     DECIMAL(8,2),
    hourly_rate     DECIMAL(6,2) NOT NULL,         -- клиентская цена
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Таблица: templates
```sql
CREATE TABLE templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    docker_image    VARCHAR(255) NOT NULL,          -- e.g. 'pytorch/pytorch:2.3-cuda12.4'
    category        VARCHAR(50),                    -- 'ml', 'inference', 'general'
    gpu_types       JSONB,                          -- compatible GPU types
    default_disk_gb INT DEFAULT 20,
    onstart_cmd     TEXT,                           -- startup script
    is_official     BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Таблица: mozart_instances
```sql
CREATE TABLE mozart_instances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    gpu_model_id    UUID REFERENCES gpu_models(id),
    template_id     UUID REFERENCES templates(id),
    provider_id     UUID REFERENCES providers(id),
    provider_instance_id  VARCHAR(100),             -- ID на стороне провайдера
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
                    -- pending, provisioning, running, stopping, stopped, error, destroyed
    ssh_host        VARCHAR(100),
    ssh_port        INT,
    ssh_key_id      UUID REFERENCES ssh_keys(id),
    disk_gb         INT DEFAULT 20,
    region          VARCHAR(50),
    is_spot         BOOLEAN DEFAULT false,
    auto_stop_hours INT,                            -- auto-stop after N hours
    last_health_check TIMESTAMPTZ,
    health_failures INT DEFAULT 0,
    started_at      TIMESTAMPTZ,
    stopped_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_instances_user ON mozart_instances(user_id);
CREATE INDEX idx_instances_status ON mozart_instances(status);
```

#### Таблица: instance_events
```sql
CREATE TABLE instance_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id     UUID REFERENCES mozart_instances(id),
    event_type      VARCHAR(50) NOT NULL,
                    -- created, provisioning, running, health_check_fail, failover_start,
                    -- failover_complete, stopped, destroyed, error, billing_paused, billing_resumed
    details         JSONB,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_events_instance ON instance_events(instance_id);
```

#### Таблица: provider_billing (что мы платим провайдеру)
```sql
CREATE TABLE provider_billing (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id     UUID REFERENCES mozart_instances(id),
    provider_id     UUID REFERENCES providers(id),
    period_start    TIMESTAMPTZ NOT NULL,
    period_end      TIMESTAMPTZ,
    cost_usd        DECIMAL(10,4) NOT NULL,
    is_reconciled   BOOLEAN DEFAULT false,
    reconciled_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Таблица: client_billing (что платят нам)
```sql
CREATE TABLE client_billing (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    instance_id     UUID REFERENCES mozart_instances(id),
    period_start    TIMESTAMPTZ NOT NULL,
    period_end      TIMESTAMPTZ,
    amount_usd      DECIMAL(10,4) NOT NULL,
    balance_before  DECIMAL(10,2),
    balance_after   DECIMAL(10,2),
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Таблица: deposits (пополнения баланса)
```sql
CREATE TABLE deposits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    amount_usd      DECIMAL(10,2) NOT NULL,
    payment_method  VARCHAR(20) NOT NULL,          -- 'btcpay', 'stripe', 'manual'
    payment_id      VARCHAR(255),                  -- BTCPay invoice ID или Stripe PI
    status          VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, expired, refunded
    crypto_currency VARCHAR(10),                   -- 'BTC', 'USDT', 'USDC'
    crypto_amount   DECIMAL(18,8),
    confirmed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Таблица: pricing_rules
```sql
CREATE TABLE pricing_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gpu_model_id    UUID REFERENCES gpu_models(id),
    base_markup     DECIMAL(4,2) NOT NULL,         -- e.g. 1.50 = 50% markup
    demand_factor   DECIMAL(4,2) DEFAULT 1.00,     -- dynamic modifier
    floor_price_usd DECIMAL(6,2) NOT NULL,         -- minimum price
    is_active       BOOLEAN DEFAULT true,
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Таблица: margin_ledger (сводка P&L по сессиям)
```sql
CREATE TABLE margin_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id     UUID REFERENCES mozart_instances(id),
    user_id         UUID REFERENCES users(id),
    gpu_model_id    UUID REFERENCES gpu_models(id),
    provider_id     UUID REFERENCES providers(id),
    total_hours     DECIMAL(10,2),
    provider_cost   DECIMAL(10,4),                 -- COGS
    client_revenue  DECIMAL(10,4),                 -- Revenue
    gross_margin    DECIMAL(10,4) GENERATED ALWAYS AS (client_revenue - provider_cost) STORED,
    margin_pct      DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN client_revenue > 0
             THEN ((client_revenue - provider_cost) / client_revenue * 100)
             ELSE 0 END
    ) STORED,
    period_date     DATE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_margin_date ON margin_ledger(period_date);
```

#### Таблица: webhook_endpoints (клиентские webhook)
```sql
CREATE TABLE webhook_endpoints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    url             VARCHAR(500) NOT NULL,
    secret          VARCHAR(64) NOT NULL,          -- для подписи HMAC-SHA256
    events          JSONB NOT NULL,                -- ['instance.*', 'billing.*']
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

**Итого: 15 таблиц.**

### 4.3 API спецификация (сводная)

| Метод  | Endpoint                          | Auth     | Описание                        | Фаза  |
|--------|-----------------------------------|----------|---------------------------------|-------|
| POST   | /api/v1/auth/register             | No       | Регистрация                     | MVP-2 |
| POST   | /api/v1/auth/login                | No       | Логин -> JWT                    | MVP-2 |
| POST   | /api/v1/auth/refresh              | Refresh  | Обновить access token           | MVP-2 |
| POST   | /api/v1/auth/logout               | Access   | Инвалидировать refresh          | MVP-2 |
| GET    | /api/v1/auth/me                   | Access   | Текущий пользователь            | MVP-2 |
| GET    | /api/v1/gpus                      | API Key  | Каталог GPU                     | MVP-2 |
| GET    | /api/v1/gpus/{id}                 | API Key  | Детали GPU                      | MVP-2 |
| GET    | /api/v1/gpus/availability         | API Key  | Доступность в реальном времени  | MVP-2 |
| POST   | /api/v1/instances                 | API Key  | Создать инстанс                 | MVP-2 |
| GET    | /api/v1/instances                 | API Key  | Список инстансов                | MVP-2 |
| GET    | /api/v1/instances/{id}            | API Key  | Детали инстанса                 | MVP-2 |
| POST   | /api/v1/instances/{id}/stop       | API Key  | Остановить                      | MVP-2 |
| POST   | /api/v1/instances/{id}/start      | API Key  | Перезапустить                   | MVP-2 |
| DELETE | /api/v1/instances/{id}            | API Key  | Уничтожить                      | MVP-2 |
| GET    | /api/v1/instances/{id}/logs       | API Key  | Логи инстанса                   | MVP-2 |
| GET    | /api/v1/instances/{id}/metrics    | API Key  | Метрики GPU/CPU/RAM             | MVP-2 |
| GET    | /api/v1/billing/balance           | API Key  | Баланс                          | MVP-2 |
| POST   | /api/v1/billing/deposit           | API Key  | Создать BTCPay invoice          | MVP-2 |
| GET    | /api/v1/billing/invoices          | API Key  | История инвойсов                | MVP-2 |
| GET    | /api/v1/billing/usage             | API Key  | Детализация расходов            | MVP-2 |
| POST   | /api/v1/billing/webhook/btcpay    | HMAC     | BTCPay callback (internal)      | MVP-2 |
| GET    | /api/v1/ssh-keys                  | API Key  | Список SSH-ключей              | MVP-2 |
| POST   | /api/v1/ssh-keys                  | API Key  | Добавить SSH-ключ              | MVP-2 |
| DELETE | /api/v1/ssh-keys/{id}             | API Key  | Удалить SSH-ключ               | MVP-2 |
| GET    | /api/v1/templates                 | API Key  | Список шаблонов                 | MVP-2 |
| GET    | /api/v1/templates/{id}            | API Key  | Детали шаблона                  | MVP-2 |
| GET    | /api/v1/health                    | No       | Healthcheck                     | MVP-2 |
| GET    | /api/v1/status                    | No       | Статус платформы                | MVP-2 |
| WS     | /ws                               | JWT      | WebSocket (realtime events)     | MVP-3 |
| POST   | /api/v1/webhooks                  | API Key  | Зарегистрировать webhook        | MVP-2 |
| GET    | /api/v1/webhooks                  | API Key  | Список webhook                  | MVP-2 |
| DELETE | /api/v1/webhooks/{id}             | API Key  | Удалить webhook                 | MVP-2 |

**Итого: 31 endpoint + 1 WebSocket.**

### 4.4 Инфраструктура

#### MVP-1 (неделя 1)
| Компонент         | Провайдер        | Стоимость/мес |
|-------------------|------------------|---------------|
| Лендинг           | Cloudflare Pages | $0            |
| BTCPay Server     | Hetzner CX22     | ~$4           |
| Telegram Bot      | Same VPS         | $0            |
| Домен             | Cloudflare       | ~$10/год      |
| SSL               | Cloudflare       | $0            |
| DNS               | Cloudflare       | $0            |
| **Итого**         |                  | **~$5/мес**   |

#### MVP-2 (недели 2-4)
| Компонент         | Провайдер        | Стоимость/мес |
|-------------------|------------------|---------------|
| API Server        | Hetzner CX31     | ~$15          |
| PostgreSQL        | Same VPS         | $0            |
| Redis             | Same VPS         | $0            |
| BTCPay Server     | Same VPS         | $0            |
| Monitoring        | Prometheus+Grafana (self-hosted) | $0 |
| Dashboard hosting | Cloudflare Pages | $0            |
| Email             | Resend (free)    | $0            |
| **Итого**         |                  | **~$15/мес**  |

#### MVP-3 (месяц 2-3)
| Компонент         | Провайдер        | Стоимость/мес |
|-------------------|------------------|---------------|
| API Server        | Hetzner CX41     | ~$25          |
| DB Server         | Hetzner CX31     | ~$15          |
| Redis             | Dedicated        | ~$10          |
| BTCPay Server     | Dedicated CX22   | ~$4           |
| Monitoring        | Self-hosted      | $0            |
| Backups (DB)      | Hetzner S3       | ~$2           |
| Email             | Resend           | $0-20         |
| Sentry            | Free tier        | $0            |
| **Итого**         |                  | **~$56/мес**  |

---

## 5. Дизайн и UX

### 5.1 Дизайн-система MOZART

**Палитра:**

| Цвет           | HEX       | Применение                         |
|----------------|-----------|-------------------------------------|
| Gold           | #D4A843   | CTA, акценты, selected states       |
| Purple         | #5B2C6F   | Градиенты, secondary backgrounds    |
| Burgundy       | #800020   | Error states, danger zone            |
| Rich Carbon    | #1A0A2E   | Card backgrounds, modals             |
| Core Black     | #0D0517   | Main background                      |
| Celestial Blue | #A8D8EA   | Links, info states                   |
| Neural Fog     | #FFFFF0   | Primary text                         |

**Типографика:**
- Заголовки: Inter (bold, uppercase)
- Body: Inter (regular/medium)
- Code/mono: JetBrains Mono
- Размеры: 14px base, 1.5 line-height

**Компоненты (shadcn/ui):**
- Dark mode only
- Border radius: 8px (cards), 6px (buttons), 4px (inputs)
- Shadows: subtle glow (gold на hover/active)
- Status badges: emerald (running), gray (stopped), red (error), amber (starting)

### 5.2 Ключевые экраны Dashboard

Подробная спецификация всех 10 экранов -- см. раздел 2.3.

**Приоритет реализации:**
1. Create Instance wizard (core flow -- экран 3)
2. Instances list (экран 2)
3. Instance Detail (экран 4)
4. Billing (экран 5)
5. SSH Keys (экран 7)
6. API Keys (экран 6)
7. Dashboard Home (экран 1)
8. Templates (экран 8)
9. Settings (экран 9)
10. Onboarding (экран 10)

### 5.3 Mobile-подход

- Dashboard: Responsive, bottom navigation на mobile (4 иконки: Home, Instances, Billing, Settings)
- Sidebar: collapsible (240px -> 64px -> hidden)
- Instances table: card layout на mobile
- Create wizard: stacked layout, шаги по одному
- Touch targets: минимум 44px
- Touch hover: `:hover` fallback через `@media (hover: none)`

### 5.4 Лендинг (текущий)

Расположен в `C:/GPU/img/`. Готовые секции:
- Hero с 3D GPU-моделью + Canvas 2D частицы
- How It Works (3 шага)
- GPU Catalog (5 моделей с ценами)
- Developer Experience (CLI/SDK/API code tabs)
- Comparison Table
- Team
- Pricing
- FAQ (7 вопросов)
- Trust Badges (SOC2/GDPR/Encryption/SLA)
- Contact Form
- i18n EN/RU

---

## 6. Интеграции

### 6.1 Vast.ai API

**Base URL:** `https://cloud.vast.ai/api/v0`
**Auth:** `Authorization: Bearer {API_KEY}`
**Документация:** docs.vast.ai

#### Используемые эндпоинты:

```
GET  /bundles/
  Параметры:
    gpu_name: "RTX_4090" | "A100_PCIE" | "H100_SXM" | ...
    num_gpus: 1
    cuda_vers: "12.4"              -- минимальная CUDA
    inet_down: 200                 -- минимальный download Mbps
    reliability: 0.95              -- минимальная надёжность хоста
    rentable: true
    order: "dph_total"             -- сортировка по цене
    type: "on-demand" | "bid"      -- on-demand или spot
  Ответ: массив offer объектов с gpu_name, dph_total, disk_space, inet_down, reliability, ...

PUT  /asks/{offer_id}/
  Body:
    image: "pytorch/pytorch:2.3.0-cuda12.4-cudnn9-runtime"
    disk: 20                       -- GB
    onstart: "bash /opt/onstart.sh"
    ssh: true
    direct: true
    env: { "JUPYTER_TOKEN": "..." }
  Ответ: { "success": true, "new_contract": instance_id }

GET  /instances/{id}/
  Ответ: { "id", "actual_status", "ssh_host", "ssh_port", "cur_state",
            "gpu_name", "dph_total", "start_date", "disk_usage", ... }
  Статусы: "created", "loading", "running", "exited", "error"

DELETE /instances/{id}/
  Ответ: { "success": true }

GET  /instances/
  Ответ: массив всех текущих инстансов аккаунта

GET  /users/current/
  Ответ: { "id", "credit", "balance", ... }
```

**Ограничения vast.ai:**
- НЕТ webhooks на interruption/status change -- только polling (каждые 30с)
- Rate limit: не документирован, рекомендуется не чаще 1 req/с
- Spot instances могут быть прерваны в любой момент без предупреждения
- Нет гарантии наличия конкретного GPU

#### Обработка ошибок vast.ai:

| HTTP Code | Значение            | Наша реакция                         |
|-----------|---------------------|--------------------------------------|
| 200       | OK                  | Продолжить                           |
| 400       | Bad request         | Логировать, сообщить клиенту         |
| 401       | Unauthorized        | Проверить/ротировать API key         |
| 404       | Instance not found  | Отметить как destroyed               |
| 429       | Rate limited        | Exponential backoff (1s, 2s, 4s, 8s) |
| 500+      | Server error        | Retry 3x, затем failover             |

### 6.2 BTCPay Server

**Версия:** BTCPay Server v2.x
**Деплой:** Docker на Hetzner VPS
**Домен:** pay.mozart.gpu (или btcpay.mozartgpu.com)

#### Настройка:
1. `docker-compose up` с BTCPay Server
2. Создать Store: "MOZART GPU Cloud"
3. Подключить BTC wallet (xpub)
4. Подключить USDT/USDC (Tron TRC-20)
5. Настроить Webhook URL: `https://api.mozart.gpu/api/v1/billing/webhook/btcpay`
6. Настроить Invoice defaults: expiration 30 min, monitoring 1 hour

#### API (BTCPay Greenfield API):

```
POST /api/v1/stores/{storeId}/invoices
  Body:
    amount: "50.00"
    currency: "USD"
    checkout:
      speedPolicy: "MediumSpeed"    -- 1 confirmation
      expirationMinutes: 30
      redirectURL: "https://mozart.gpu/billing?status=success"
    metadata:
      user_id: "uuid"
      deposit_id: "uuid"
  Ответ: { "id": "invoice_id", "checkoutLink": "https://pay.mozart.gpu/i/xxx" }

// Webhook payload (POST to our API):
{
  "deliveryId": "...",
  "type": "InvoiceSettled",
  "storeId": "...",
  "invoiceId": "...",
  "metadata": { "user_id": "...", "deposit_id": "..." }
}
```

### 6.3 Stripe (Фаза 2 -- Thai Company)

**Подключение:** Через Thai Company (Omise/Opn для тайского рынка, Stripe для international)
**Модель:** Prepaid wallet -- клиент пополняет баланс, расходует при использовании GPU

```
POST /api/v1/billing/deposit/stripe
  -> Stripe Checkout Session (amount, currency=USD)
  -> Success: webhook /api/v1/billing/webhook/stripe
  -> Пополнение баланса в deposits таблице

Stripe Tax: автоматический расчёт VAT/Sales Tax ($0.50% от taxable volume)
```

**Минимальное пополнение:** $10
**Суммы по умолчанию:** $10 / $25 / $50 / $100 / $500

### 6.4 Telegram Bot API

**Библиотека:** python-telegram-bot v21+
**Деплой:** systemd-сервис на API VPS

```python
# Команды бота:
/start          -> Welcome message + меню
/rent           -> Inline keyboard: выбор GPU -> часы -> BTCPay ссылка
/status         -> Список активных инстансов пользователя
/prices         -> Текущий прайс-лист (formatted message)
/balance        -> Текущий баланс
/support <msg>  -> Пересылка в support-чат founder'а
/help           -> Список команд

# Уведомления (от системы клиенту):
- "Оплата подтверждена. Баланс: $X"
- "GPU готов. SSH: ssh root@IP -p PORT"
- "GPU остановлен. Использовано: X часов, стоимость: $Y"
- "Низкий баланс: осталось $Z (~N минут)"
- "Failover: GPU переведён на новый хост. Новый SSH: ..."

# Уведомления (founder'у):
- Новая оплата: сумма, user, метод
- Новый пользователь: email, telegram
- Ошибка системы: instance fail, health check fail
```

### 6.5 Мониторинг (Prometheus + Grafana)

**Деплой:** Docker на API VPS
**Доступ:** grafana.mozart.gpu (internal, VPN/firewall)

#### Prometheus метрики (custom):

```
# Business metrics
mozart_active_instances{gpu_type}                   -- gauge
mozart_total_revenue_usd                            -- counter
mozart_total_provider_cost_usd                      -- counter
mozart_gross_margin_pct{gpu_type}                   -- gauge
mozart_user_balance_usd{user_id}                    -- gauge

# Instance metrics
mozart_instance_uptime_seconds{instance_id}         -- gauge
mozart_instance_health_check_duration_seconds       -- histogram
mozart_instance_health_check_failures_total         -- counter
mozart_instance_failover_total                      -- counter

# API metrics
mozart_http_requests_total{method, endpoint, status} -- counter
mozart_http_request_duration_seconds{endpoint}       -- histogram
mozart_websocket_connections                         -- gauge

# Provider metrics
mozart_provider_api_calls_total{provider, endpoint}  -- counter
mozart_provider_api_latency_seconds{provider}        -- histogram
mozart_provider_balance_usd{provider}                -- gauge
```

#### Grafana Dashboards:

1. **Business Overview** -- MRR, active users, GPU utilization, margin
2. **Instance Health** -- uptime, failovers, health check latency
3. **API Performance** -- request rate, latency, error rate
4. **Provider Status** -- availability, API health, cost tracking

#### Alerting (Grafana Alerting -> Telegram):

| Alert                          | Threshold        | Action              |
|--------------------------------|------------------|---------------------|
| Instance health check fail     | 3 consecutive    | Auto-failover       |
| Provider API error rate        | > 5% for 5min    | Telegram alert      |
| Provider balance low           | < $50            | Telegram alert      |
| API error rate                 | > 1% for 5min    | Telegram alert      |
| No running instances           | 0 for 1 hour     | Info notification   |
| High margin deviation          | > 20% from target | Review pricing     |

---

## 7. План реализации

### 7.1 Спринты

#### Sprint 1 (9-11 апреля, 3 дня) -- ПЕРВЫЕ ПРОДАЖИ

| # | Задача                                      | Приоритет | Часы | Зависимости |
|---|----------------------------------------------|-----------|------|-------------|
| 1 | Развернуть BTCPay Server на Hetzner VPS      | P0        | 3    | -           |
| 2 | Настроить BTC + USDT + USDC в BTCPay         | P0        | 2    | 1           |
| 3 | Создать Telegram Bot (базовые команды)        | P0        | 4    | -           |
| 4 | Интегрировать BTCPay webhook -> Telegram Bot  | P0        | 2    | 1, 3        |
| 5 | Pricing page в лендинге с BTCPay ссылками     | P0        | 4    | 1           |
| 6 | Деплой лендинга на Cloudflare Pages           | P0        | 2    | -           |
| 7 | P0 фиксы лендинга (favicon, OG, CSP)          | P0        | 3    | -           |
| 8 | Git init + GitHub repo + CI/CD                 | P0        | 2    | -           |
| 9 | Написать SOP для ручного provisioning          | P0        | 1    | -           |
| 10| Купить домен, настроить DNS                    | P0        | 1    | -           |
|   | **Итого Sprint 1**                             |           | **24** |           |

#### Sprint 2 (12-16 апреля, 5 дней) -- OUTREACH + АВТОМАТИЗАЦИЯ НАЧАЛО

| # | Задача                                          | Приоритет | Часы | Зависимости |
|---|-------------------------------------------------|-----------|------|-------------|
| 11| Настроить Bybit Card для конвертации крипто->USD | P0        | 2    | -           |
| 12| Первый outreach: GitHub API парсинг (10 лидов)   | P0        | 4    | -           |
| 13| Первый outreach: Reddit r/LocalLLaMA (10 лидов)  | P0        | 3    | -           |
| 14| FastAPI boilerplate (auth, health, middleware)     | P1        | 6    | -           |
| 15| PostgreSQL schema (все 15 таблиц)                  | P1        | 4    | 14          |
| 16| Provider Abstraction Layer (interface)              | P1        | 3    | 14          |
| 17| VastAiProvider (search, create, get, destroy)       | P1        | 8    | 16          |
| 18| Vast.ai API тестирование на реальных запросах       | P1        | 3    | 17          |
|   | **Итого Sprint 2**                                  |           | **33** |          |

#### Sprint 3 (17-23 апреля, 5 дней) -- CORE BACKEND

| # | Задача                                          | Приоритет | Часы | Зависимости |
|---|-------------------------------------------------|-----------|------|-------------|
| 19| Auth модуль (register, login, JWT, API keys)     | P0        | 8    | 14, 15      |
| 20| GPU Catalog эндпоинты                             | P1        | 3    | 15          |
| 21| Instances CRUD эндпоинты                          | P0        | 8    | 17, 15      |
| 22| Instance Lifecycle Manager (Celery tasks)          | P0        | 10   | 21, 17      |
| 23| Health check task (30s polling)                    | P0        | 4    | 22          |
| 24| SSH Keys CRUD                                      | P1        | 2    | 19          |
| 25| Templates CRUD                                     | P1        | 2    | 15          |
|   | **Итого Sprint 3**                                  |           | **37** |          |

#### Sprint 4 (24-30 апреля, 5 дней) -- BILLING + CLI

| # | Задача                                          | Приоритет | Часы | Зависимости |
|---|-------------------------------------------------|-----------|------|-------------|
| 26| Billing tick task (60s, dual ledger)               | P0        | 6    | 22, 15      |
| 27| BTCPay интеграция в API (deposit, webhook)         | P0        | 6    | 15          |
| 28| Balance management (deposit, deduct, low alert)    | P0        | 4    | 26, 27      |
| 29| Pricing Engine                                      | P1        | 4    | 20          |
| 30| Webhook уведомления клиентам                        | P1        | 4    | 22          |
| 31| CLI (auth, list, create, ssh, stop, destroy)        | P1        | 8    | 19, 21      |
| 32| Docker Compose для dev-окружения                    | P1        | 3    | all         |
|   | **Итого Sprint 4**                                  |           | **35** |          |

#### Sprint 5 (1-7 мая, 5 дней) -- СТАБИЛИЗАЦИЯ + ТЕСТЫ

| # | Задача                                          | Приоритет | Часы | Зависимости |
|---|-------------------------------------------------|-----------|------|-------------|
| 33| Integration tests (pytest)                          | P0        | 8    | all API     |
| 34| Auto-failover flow (end-to-end)                     | P0        | 6    | 22, 23      |
| 35| Reconciliation pipeline (15 min check)              | P1        | 4    | 26          |
| 36| Prometheus metrics + Grafana dashboards              | P1        | 6    | all         |
| 37| Деплой backend на production VPS                     | P0        | 4    | 32          |
| 38| API documentation (OpenAPI auto-generated)           | P2        | 2    | all API     |
| 39| Rate limiting + security headers                     | P1        | 3    | 14          |
|   | **Итого Sprint 5**                                  |           | **33** |          |

#### Sprint 6-9 (май-июнь, 4 недели) -- DASHBOARD

| # | Задача                                          | Приоритет | Часы |
|---|-------------------------------------------------|-----------|------|
| 40| React project setup (Vite + shadcn + Tailwind)  | P0        | 4    |
| 41| Auth pages (login, register, forgot password)    | P0        | 8    |
| 42| Layout (sidebar, topbar, mobile nav)             | P0        | 6    |
| 43| Create Instance wizard (4 шага)                  | P0        | 16   |
| 44| Instances list + filters                          | P0        | 8    |
| 45| Instance Detail + terminal (xterm.js)             | P0        | 12   |
| 46| Billing page + deposit flow                       | P0        | 10   |
| 47| SSH Keys management                               | P1        | 4    |
| 48| API Keys management                               | P1        | 4    |
| 49| Dashboard Home (KPI cards, charts)                | P1        | 8    |
| 50| Templates page                                    | P2        | 6    |
| 51| Settings page                                     | P2        | 8    |
| 52| Onboarding flow                                   | P2        | 6    |
| 53| WebSocket integration (realtime updates)           | P1        | 8    |
| 54| Mobile responsive                                  | P1        | 8    |
|   | **Итого Dashboard**                                |           | **~116** |

### 7.2 Диаграмма зависимостей

```
Sprint 1 (Первые продажи):
  BTCPay Server ──> Pricing Page ──> Лендинг деплой
  Telegram Bot ──────────────────────┘
  Git + CI/CD ─────────────────────────┘

Sprint 2-4 (Backend):
  FastAPI boilerplate ──> Auth ──> Instances CRUD ──> Lifecycle Manager
                     └──> DB Schema ──> Billing ──> CLI
  PAL Interface ──> VastAiProvider ──────┘

Sprint 5 (Стабилизация):
  All Backend ──> Tests ──> Production Deploy
             └──> Monitoring

Sprint 6-9 (Dashboard):
  React Setup ──> Auth Pages ──> Layout ──> Create Wizard ──> Instance Detail
                                       └──> Instances List ──> Billing
                                       └──> SSH/API Keys ──> Settings
```

### 7.3 Оценка трудозатрат

| Фаза     | Период            | Часов | Один разработчик (40ч/нед) |
|----------|-------------------|-------|---------------------------|
| MVP-1    | 9-11 апреля       | 24    | 3 дня                     |
| MVP-2    | 12 апреля - 7 мая | 138   | 3.5 недели                |
| MVP-3    | Май - Июнь         | 116   | 3 недели                  |
| **Итого** | **9 апреля - 30 июня** | **278** | **7 недель**         |

При использовании AI-coding (Claude Code) -- реалистичная оценка: x1.5-2x скорость.
**Оптимистичная оценка: ~5 недель до полного MVP.**

---

## 8. Метрики успеха

### 8.1 KPI по фазам

#### MVP-1 (Неделя 1)

| Метрика                 | Цель        | Измерение                    |
|-------------------------|-------------|------------------------------|
| Первая оплата           | 1           | BTCPay invoice settled       |
| Лендинг онлайн          | Да          | Cloudflare Pages live        |
| BTCPay работает          | Да          | Test invoice paid            |
| Telegram Bot работает    | Да          | /start responds              |
| Время от оплаты до SSH   | < 15 минут  | Manual tracking              |

#### MVP-2 (Конец месяца 1)

| Метрика                  | Цель        | Измерение                    |
|--------------------------|-------------|------------------------------|
| Зарегистрированных юзеров | 10+        | users table count            |
| Платящих клиентов         | 3+         | deposits with confirmed      |
| MRR                       | > $300     | margin_ledger sum            |
| Автоматический provisioning | < 90 секунд | instance_events timing     |
| API uptime                | > 99%      | Prometheus uptime metric     |
| Gross margin              | > 40%      | margin_ledger avg            |

#### MVP-3 (Конец месяца 3)

| Метрика                  | Цель        | Измерение                    |
|--------------------------|-------------|------------------------------|
| Платящих клиентов         | 20+        | monthly active depositors    |
| MRR                       | > $1,500   | margin_ledger sum            |
| GPU-часов/мес             | > 2,000    | client_billing sum           |
| Mean Time to GPU          | < 3 минуты  | instance_events timing      |
| Dashboard MAU             | > 15       | Analytics                    |
| CLI downloads             | > 50       | PyPI stats                   |
| Churn (monthly)           | < 15%      | User cohort analysis         |

#### Growth (Конец месяца 6)

| Метрика                  | Цель          | Измерение                    |
|--------------------------|---------------|------------------------------|
| Платящих клиентов         | 50+          | B2B target                   |
| MRR                       | > $5,000     | margin_ledger sum            |
| ARPU                      | > $100/мес   | MRR / active users           |
| LTV:CAC                   | > 3:1        | Cohort analysis              |
| GPU utilization           | > 30%        | Running hours / available    |
| Провайдеров               | 2+           | providers table              |
| Uptime SLA                | > 99.9%      | Monitoring                   |

### 8.2 Definition of Done для MVP

**MVP считается готовым когда:**

- [ ] Клиент может зарегистрироваться (email + password)
- [ ] Клиент может пополнить баланс (BTC / USDT / USDC через BTCPay)
- [ ] Клиент может создать GPU-инстанс через API или CLI
- [ ] Инстанс автоматически создаётся на vast.ai (< 90 секунд)
- [ ] Клиент получает SSH-credentials (email / Telegram / webhook)
- [ ] Health check работает каждые 30 секунд
- [ ] При падении инстанса -- автоматический failover (< 3 минут)
- [ ] Биллинг тикает каждые 60 секунд (dual ledger)
- [ ] При низком балансе -- уведомление клиенту
- [ ] При нулевом балансе -- авто-стоп инстанса
- [ ] CLI работает: auth, create, list, ssh, stop, destroy, balance
- [ ] API документация доступна (OpenAPI/Swagger)
- [ ] Мониторинг работает (Prometheus + Grafana)
- [ ] Integration tests проходят (> 80% coverage на critical paths)
- [ ] Backend задеплоен на production VPS с Docker Compose

---

## 9. Риски и митигация

### 9.1 Технические риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Vast.ai API изменится без уведомления | Средняя | Высокое | Абстрактный PAL; version pinning; мониторинг API changes |
| Spot-инстанс прерван во время работы клиента | Высокая | Высокое | Auto-failover < 3 мин; SLA-компенсация; рекомендовать on-demand для production |
| Потеря данных клиента при failover | Средняя | Критическое | Persistent volumes; snapshot перед уничтожением; предупреждение в docs |
| Vast.ai заблокирует аккаунт (ToS violation) | Низкая | Критическое | Несколько аккаунтов; multi-provider (Lambda); чтение ToS -- ресейл не запрещён |
| DDoS на API | Низкая | Среднее | Cloudflare Pro; rate limiting; fail2ban |
| БД corruption | Низкая | Критическое | Daily pg_dump; point-in-time recovery; WAL archiving |

### 9.2 Бизнес-риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Нет клиентов в первый месяц | Средняя | Высокое | Outbound-first GTM; 50 лидов/неделю; бесплатные trial-часы |
| Vast.ai снизит цены (маржа сожмётся) | Средняя | Среднее | Multi-provider; value-add (SLA, failover); managed premium |
| Клиент не платит (крипто не пришла) | Низкая | Низкое | Prepaid only; no credit; BTCPay подтверждение перед provisioning |
| Конкурент скопирует модель | Средняя | Среднее | Execution speed; community; brand; technical moat (failover, CLI) |
| Regulatory pressure (крипто-платежи) | Низкая | Среднее | Thai Company фаза 2; Omise для фиата; крипто-лицензия НЕ нужна для приёма оплаты за услуги |

### 9.3 Юридические риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Санкции (РФ бенефициар) | Низкая | Высокое | Обычный гражданин (не SDN); тайский адрес; нероссийские карты; Omise вместо Stripe |
| Stripe блокировка | Средняя | Среднее | Не использовать Stripe до Thai Company; Omise/Opn для карт; BTCPay для крипто |
| Тайские налоги при >183 дней | Средняя | Среднее | Налоговый консультант; DTV виза; структурирование доходов |
| E-Residency отказ (если подавать) | Высокая | Низкое | Не подавать на эстонское e-Residency; Thai Company + BOI |
| Vast.ai ToS нарушение | Низкая | Высокое | Прочитать ToS; ресейл не запрещён напрямую; не представляться как vast.ai |

### 9.4 Финансовые риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Расходы превышают доходы (burn) | Средняя | Высокое | Инфра < $60/мес; GPU только по запросу; no inventory risk |
| Крипто-волатильность | Средняя | Среднее | Мгновенная конвертация USDT/USDC (стейблкоины); BTC -> конвертация через Bybit сразу |
| SLA-компенсации съедают прибыль | Средняя | Среднее | AIOps failover; лимит компенсации 100% стоимости затронутого периода |
| Egress fees неожиданно высокие | Средняя | Среднее | Мониторинг egress; предупреждение клиентов; включить в pricing |

---

## 10. Бюджет

### 10.1 Инфраструктура по месяцам

| Компонент              | Месяц 1 | Месяц 2 | Месяц 3 | Месяц 6 |
|------------------------|----------|----------|----------|----------|
| VPS (Hetzner)          | $5       | $15      | $55      | $80      |
| Домен                  | $1       | $1       | $1       | $1       |
| Cloudflare             | $0       | $0       | $0       | $20      |
| Email (Resend)         | $0       | $0       | $0       | $20      |
| Backups (S3)           | $0       | $0       | $2       | $5       |
| Sentry                 | $0       | $0       | $0       | $26      |
| **Инфра итого**        | **$6**   | **$16**  | **$58**  | **$152** |
| GPU закупка (vast.ai)  | ~$200    | ~$600    | ~$1,500  | ~$5,000  |
| **Всего расходы**      | **~$206** | **~$616** | **~$1,558** | **~$5,152** |

*GPU закупка масштабируется с клиентской базой. Нет inventory risk -- GPU арендуются по запросу.*

### 10.2 Инструменты и сервисы

| Инструмент         | Стоимость       | Назначение                   | Фаза   |
|--------------------|-----------------|------------------------------|--------|
| Hetzner VPS        | $5-80/мес       | API, DB, BTCPay, monitoring  | MVP-1  |
| Cloudflare         | $0-20/мес       | CDN, DNS, WAF, Pages         | MVP-1  |
| BTCPay Server      | $0 (self-host)  | Крипто-платежи               | MVP-1  |
| Bybit              | $0 (торговые комиссии) | Крипто -> фиат конвертация | MVP-1 |
| GitHub             | $0 (private repos) | Git, CI/CD                | MVP-1  |
| Resend             | $0-20/мес       | Transactional email          | MVP-2  |
| Sentry             | $0-26/мес       | Error tracking               | MVP-3  |
| Prometheus+Grafana | $0 (self-host)  | Мониторинг                   | MVP-2  |
| Telegram Bot API   | $0              | Клиентское общение           | MVP-1  |
| Vast.ai            | Per-use         | GPU провайдер                | MVP-1  |
| Omise/Opn          | 2.65%+7 THB     | Карточные платежи            | Growth |
| Xero               | $42/мес         | Бухгалтерия                  | Growth |
| Vanta              | ~$10K/год       | SOC 2 automation             | Enterprise |

### 10.3 Юридические расходы

| Расход                            | Стоимость     | Когда                    |
|-----------------------------------|---------------|--------------------------|
| DTV виза                          | $270          | Сейчас (если нет)        |
| Thai Company регистрация          | $2,000-4,000  | Месяц 2-3 (при $5K+ MRR)|
| Non-B виза + Work Permit          | $500-1,000    | После Thai Company       |
| Годовой аудит Thai Company        | $1,500-2,000  | Ежегодно                 |
| BOI заявка                        | $2,000-5,000  | Месяц 6+ (при $20K+ MRR)|

### 10.4 Прогноз P&L

| Метрика              | Месяц 1    | Месяц 3    | Месяц 6       |
|----------------------|------------|------------|----------------|
| GPU-часов/мес        | 200        | 2,000      | 8,000          |
| Revenue              | $300       | $2,500     | $10,000        |
| COGS (vast.ai)       | $200       | $1,500     | $5,500         |
| Gross Profit         | $100       | $1,000     | $4,500         |
| Инфра                | $6         | $58        | $152           |
| **Net Profit**       | **$94**    | **$942**   | **$4,348**     |
| **Gross Margin**     | **33%**    | **40%**    | **45%**        |
| Клиентов             | 3          | 20         | 50             |
| Break-even           | Нет        | Да         | Да             |

---

## 11. Узкие места и критические исправления (v1.1)

> Добавлено после стресс-тестирования ТЗ. Три уязвимости + два ИИ-агента.

### 11.1 Уязвимость: Зависимость от Vast.ai (маржа под угрозой)

**Проблема:** Позиционируемся как "надёжнее P2P", но под капотом — P2P. Хосты на Vast.ai часто уходят в офлайн. SLA-компенсации могут съесть до 30% маржи.

**Митигация (добавить в MVP-2):**
1. **Host Reliability Score** — при поиске GPU фильтровать `reliability >= 0.95` + `hosting_type = "datacenter"` (только дата-центры, не домашние ПК)
2. **Blacklist table** — автоматический бан machine_id с >2 падениями за 7 дней
3. **Hot Standby Pool** — держать 1-2 предоплаченных "спящих" инстанса на on-demand (не spot) для мгновенного failover. Стоимость: ~$50-100/мес, но спасает маржу
4. **SLA-компенсации с потолком** — максимум 100% стоимости затронутого ЧАСА (не всей сессии). Явно прописать в ToS
5. **Multi-provider с MVP-2** — Lambda Labs как резервный провайдер. Не ждать Growth-фазы

```python
# Фильтр надёжных хостов vast.ai
RELIABILITY_FILTER = {
    "reliability": {"gte": 0.95},
    "hosting_type": {"eq": "datacenter"},
    "machine_id": {"not_in": BLACKLISTED_MACHINES}
}
```

### 11.2 Уязвимость: Ручной provisioning 24/7 (MVP-1)

**Проблема:** SOP требует нажимать кнопки на vast.ai вручную. Клиент из США оплатит в 4 утра по Тайланду — ждать пробуждения не будет.

**Решение: Микро-скрипт auto-provisioning для MVP-1 (до полного API):**

```python
#!/usr/bin/env python3
"""auto_provision.py — BTCPay webhook → Vast.ai → SSH клиенту
Заменяет ручной SOP. Запускается как systemd service."""

from fastapi import FastAPI, Request
import httpx, json, asyncio

app = FastAPI()
VAST_API_KEY = "..."
TELEGRAM_BOT_TOKEN = "..."
TELEGRAM_CHAT_ID = "..."  # ваш чат для уведомлений

GPU_MAP = {
    "rtx4090_10h": {"gpu": "RTX 4090", "hours": 10, "vast_filter": {"gpu_name": {"eq": "RTX 4090"}}},
    "a100_10h":    {"gpu": "A100",     "hours": 10, "vast_filter": {"gpu_name": {"eq": "A100 80GB"}}},
    "h100_10h":    {"gpu": "H100",     "hours": 10, "vast_filter": {"gpu_name": {"eq": "H100 SXM5"}}},
}

@app.post("/btcpay-webhook")
async def handle_payment(request: Request):
    data = await request.json()
    if data.get("type") != "InvoiceSettled":
        return {"ok": True}
    
    # 1. Определить какой пакет оплачен
    package_id = data["metadata"]["packageId"]
    pkg = GPU_MAP[package_id]
    
    # 2. Найти лучший инстанс на vast.ai
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://cloud.vast.ai/api/v0/bundles/",
            params={"q": json.dumps({
                **pkg["vast_filter"],
                "rentable": {"eq": True},
                "reliability": {"gte": 0.95},
                "hosting_type": {"eq": "datacenter"}
            }), "order": "dph_total", "limit": 1},
            headers={"Authorization": f"Bearer {VAST_API_KEY}"}
        )
        offer = resp.json()["offers"][0]
        
        # 3. Арендовать
        rent = await client.post(
            f"https://cloud.vast.ai/api/v0/asks/{offer['id']}/",
            json={"client_id": "me", "image": "pytorch/pytorch:2.3.0-cuda12.4-cudnn9-runtime",
                  "disk": 50, "runtype": "ssh"},
            headers={"Authorization": f"Bearer {VAST_API_KEY}"}
        )
        contract_id = rent.json()["new_contract"]
        
        # 4. Подождать запуска (polling)
        for _ in range(60):  # макс 5 мин
            await asyncio.sleep(5)
            status = await client.get(
                f"https://cloud.vast.ai/api/v0/instances/{contract_id}/",
                headers={"Authorization": f"Bearer {VAST_API_KEY}"}
            )
            info = status.json()
            if info["actual_status"] == "running":
                break
        
        # 5. Отправить SSH-доступ клиенту через Telegram
        ssh_cmd = f"ssh -p {info['ssh_port']} root@{info['ssh_host']}"
        client_email = data["metadata"]["buyerEmail"]
        
        await client.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": TELEGRAM_CHAT_ID,
                  "text": f"🟢 Новый клиент!\n{client_email}\n{pkg['gpu']} x {pkg['hours']}h\n\nSSH: `{ssh_cmd}`\nContract: {contract_id}",
                  "parse_mode": "Markdown"}
        )
    
    return {"ok": True, "contract_id": contract_id}
```

**Время реализации:** 4-6 часов. Убирает ручной процесс с первого дня.

### 11.3 Уязвимость: Ловушка динамического прайсинга

**Проблема:** Продали пакет 50 часов по $1.20/hr, а spot-цена подскочила до $2.00/hr → работаем в минус.

**Решение: Фиксированные пакеты с буфером маржи:**

```
PRICING STRATEGY (MVP-1):

1. Базовая цена = MAX(spot_avg_30d, spot_p75_7d) * 1.5
   — берём 75-й перцентиль за 7 дней, не среднюю
   — множитель 1.5 = буфер на скачки

2. Пакеты фиксированные (пересматриваются раз в неделю):
   — RTX 4090: $0.45/hr (при закупке до $0.30)
   — A100:     $1.80/hr (при закупке до $1.20)  
   — H100:     $2.80/hr (при закупке до $1.85)

3. Если spot > ceiling (наша max закупочная):
   — Автоматически переключиться на on-demand у провайдера
   — Если on-demand тоже дорого → пометить GPU как "temporarily unavailable"
   — НЕ работать в минус ни при каких условиях

4. Price lock: клиент получает фиксированную цену на весь пакет
   — Мы берём риск волатильности на себя (это наш value-add)
   — Но защищаемся через ceiling и buffer
```

**Добавить в БД:**
```sql
ALTER TABLE pricing_rules ADD COLUMN ceiling_price DECIMAL(10,4);
-- Если provider_price > ceiling → отказать в provisioning
```

### 11.4 ИИ-агенты для автоматизации (фаза MVP-2)

**L1 Support Agent (Telegram Bot):**

```python
# Встроить в существующий Telegram Bot
# Claude API для ответов на базовые вопросы

SYSTEM_PROMPT = """Ты MOZART GPU Support Bot. Отвечай кратко.
Документация:
- SSH подключение: ssh -p PORT root@HOST
- CUDA версия: 12.4 (все шаблоны)
- PyTorch: 2.3.0 предустановлен
- Jupyter: порт 8888, токен в логах инстанса
- Проблемы: перезапусти инстанс через /restart
- Биллинг: prepaid, пакеты 10/50/200 часов
Если не знаешь ответ — передай человеку через /escalate."""

# Снимает 80% коммуникации с первого дня
```

**ИИ-Модератор рисков (Host Blacklist):**

```python
# Celery periodic task — каждые 5 минут
@celery.task
def analyze_host_reliability():
    """Автоматический бан ненадёжных хостов."""
    events = db.query(InstanceEvent).filter(
        event_type == 'health_check_failed',
        created_at > now() - timedelta(days=7)
    ).all()
    
    # Группировать по machine_id провайдера
    failure_counts = Counter(e.metadata['machine_id'] for e in events)
    
    for machine_id, count in failure_counts.items():
        if count >= 3:  # 3+ падения за 7 дней
            db.add(BlacklistedHost(
                machine_id=machine_id,
                reason=f"Auto-blacklisted: {count} failures in 7 days",
                blacklisted_at=now()
            ))
            log.warning(f"Host {machine_id} blacklisted ({count} failures)")
```

---

## Приложения

### A. Пять стартовых шаблонов (Docker images)

| Шаблон       | Docker Image                                    | Default Disk | Описание                    |
|--------------|------------------------------------------------|-------------|------------------------------|
| PyTorch      | pytorch/pytorch:2.3.0-cuda12.4-cudnn9-runtime  | 20 GB       | PyTorch + CUDA 12.4          |
| TensorFlow   | tensorflow/tensorflow:2.16.1-gpu               | 20 GB       | TensorFlow + CUDA            |
| vLLM         | vllm/vllm-openai:latest                        | 50 GB       | vLLM inference server        |
| Jupyter      | jupyter/datascience-notebook:latest             | 20 GB       | JupyterLab + GPU support     |
| Base CUDA    | nvidia/cuda:12.4.1-devel-ubuntu22.04           | 10 GB       | Чистый CUDA                  |

### B. OFAC-блокируемые юрисдикции (Cloudflare Firewall)

Cuba, Iran, North Korea, Syria, Crimea region, Donetsk region, Luhansk region.
Реализация: Cloudflare Firewall Rules по country code.

### C. Структура файлов проекта (целевая)

```
mozart/
  landing/                  -- Лендинг (текущий C:/GPU/img/)
    index.html
    pricing.html
    css/style.css
    js/main.js, gpu-particles.js, i18n.js, three-scene.js
    img/
    _headers

  api/                      -- FastAPI backend
    app/
      main.py
      config.py
      models/               -- SQLAlchemy models (15 таблиц)
      schemas/              -- Pydantic schemas
      routers/              -- auth, instances, billing, gpus, ssh_keys, templates, webhooks
      services/
        provider/           -- PAL: interface.py, vastai.py, (lambda.py)
        lifecycle.py        -- Instance lifecycle manager
        billing.py          -- Billing tick, dual ledger
        pricing.py          -- Pricing engine
      tasks/                -- Celery tasks
        health_check.py
        billing_tick.py
        provisioning.py
        reconciliation.py
      middleware/            -- auth, rate_limit, cors
      utils/                -- crypto, ssh, validators
    tests/
    alembic/                -- DB migrations
    Dockerfile
    docker-compose.yml
    requirements.txt

  console/                  -- React Dashboard
    src/
      components/           -- shadcn/ui components
      pages/                -- 10 pages
      hooks/                -- useAuth, useInstances, useWebSocket
      lib/                  -- api client, websocket, utils
      styles/               -- Tailwind + MOZART theme
    vite.config.ts
    Dockerfile

  cli/                      -- Python CLI
    mozart_cli/
      __init__.py
      main.py               -- typer app
      commands/              -- auth, instances, billing, ssh_keys
      api_client.py
    setup.py
    pyproject.toml

  bot/                      -- Telegram Bot
    bot.py
    handlers/
    Dockerfile

  monitoring/               -- Prometheus + Grafana
    prometheus.yml
    grafana/dashboards/
    docker-compose.monitoring.yml

  btcpay/                   -- BTCPay Server config
    docker-compose.btcpay.yml

  docker-compose.yml        -- Общий для dev-среды
  .github/workflows/        -- CI/CD
  .gitignore
  README.md
  THIRD_PARTY_NOTICES.md
```

---

**Конец документа.**

*Это техническое задание является живым документом. Обновления вносятся по мере валидации продукта рынком.*
