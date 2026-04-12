# MOZART GPU — Session Handoff

**Date:** 2026-04-12
**Status:** Production LIVE on https://web3playlab.win
**Next session location:** VPS (217.217.250.84) via Claude Code in tmux

---

## Контекст для Claude на VPS

Ты работаешь над проектом MOZART GPU — платформа аренды GPU за криптовалюту без KYC. Этот файл — полная передача контекста от предыдущей сессии на Windows.

**Пользователь:** Роберт Хайрисламов, предприниматель. Windows 11 + VPS Ubuntu. Стиль работы: итеративный, делегирует агентам.

**Текущая дата:** 2026-04-12.

---

## Что работает в проде ПРЯМО СЕЙЧАС

```
https://web3playlab.win/                   → Landing (13 секций, i18n EN/RU, Three.js)
https://web3playlab.win/console/           → React Dashboard (JWT auth работает)
https://web3playlab.win/api/v1/health      → {"status":"ok","version":"0.2.0"}
https://web3playlab.win/api/v1/gpu-models/ → 5 GPU с ценами
https://web3playlab.win/flow/              → Agent Flow визуализатор (basic auth)
```

**Docker на VPS (в /var/www/mozartgpu):**
- postgres — запущен, данные сохранены
- fastapi-app — запущен, API работает
- Другие сервисы (btcpay, bot, nbxplorer) — НЕ запущены пока

**QA протестировал flow:**
- Register → 201 + токены ✅
- Login → 200 + редирект ✅
- /auth/me → 200 ✅
- SSH keys CRUD ✅
- Billing страница ✅

---

## История работы (4 сессии)

### Сессия 1 (2026-04-09)
Лендинг: Hero, Ethos, Industries, Portfolio, Pricing, Team, Partners, FAQ, Footer. 8 агентов, 60+ фиксов.

### Сессия 2 (2026-04-09/10)
i18n EN/RU (308 ключей), крипто-мессейджинг, 2 PDF исследования, ТЗ v1.1.

### Сессия 3 (2026-04-10)
MVP-1 (Telegram Bot + Auto-provision), MVP-2 (FastAPI, 26 файлов), MVP-3 (React Dashboard, 10 страниц). Первый GitHub push. Финальный аудит выявил 16 багов.

### Сессия 4 (2026-04-10/11)
- P0 Security: ключи отозваны, JWT обязательный, CORS ужесточён
- P1: shared DB, единый docker-compose, BTCPay webhook в FastAPI, create_instance fix, Invoice↔Instance FK
- P2: background worker, единый прайсинг (gpu_models table), landing кнопки → console, contact API, footer fixes
- Console build, serve.json
- 13 из 16 багов закрыто

### Сессия 5 (2026-04-11/12) — ДЕПЛОЙ
- Деплой на VPS (217.217.250.84)
- Домен web3playlab.win (тестовый)
- Nginx + SSL (certbot)
- Console: fix basename=/console
- Backend: pin bcrypt==4.0.1 (fix register 500)
- Agent Flow запущен на /flow/ с basic auth
- Баг #14 исправлен (BTCPay server-side verification) — Claude на VPS сделал, НУЖНО ЗАКОММИТИТЬ
- README.md + marketing-posts.md + улучшенный OG-image generator

---

## Архитектура

```
Nginx (TLS)
├── /                  → Landing HTML static
├── /console/          → React SPA (dist/)
├── /api/              → FastAPI :8000 (в Docker)
├── /flow/             → Agent Flow :3001 (basic auth)
└── /btcpay/           → BTCPay Server (не запущен)

Docker сервисы:
├── postgres ✅           → БД (users, instances, invoices, gpu_models)
├── fastapi-app ✅        → API + background worker
├── console (dist)        → статика, раздаётся nginx
├── btcpayserver ❌       → не настроен
├── nbxplorer ❌          → не нужен без btcpay
├── telegram-bot ❌       → не запущен
├── provision-webhook ❌  → legacy MVP-1, не нужен
└── nginx (host)          → системный, не Docker
```

---

## Баги — статус

### Закрыто (13/16)
#1, #2, #3, #4, #5, #6, #7, #8, #11, #12, #13, #15, #16

### Осталось
- **#9** Template selection не передаётся в API (cosmetic)
- **#10** Disk slider декоративный, hardcode 50GB (cosmetic)
- **#14** Проверка оплаты перед Instance — ИСПРАВЛЕНО Claude на VPS, нужно закоммитить

---

## Учётные данные

**GitHub:** https://github.com/robertkhairislamov-afk/mozartGPU (public)
**Домен:** web3playlab.win (тестовый), цель → mozartgpu.com (не куплен)
**VPS:** 217.217.250.84, user btcb, проект в /var/www/mozartgpu
**Telegram Bot:** @mozartgpu_bot (token в .env на VPS)
**Vast.ai API key:** в .env на VPS (обновлён 2026-04-10)
**BTCPay:** НЕ настроен (STORE_ID, API_KEY, WEBHOOK_SECRET пусты)

---

## Обратная связь от пользователя (важно помнить)

- **Не SVG иконки** — пользователь предпочитает realistic/bitmap
- **Low-poly GPU** стиль для 3D моделей
- **Разнообразные промпты** — не копировать один и тот же промпт агенту
- **Мобильное превью** — всегда проверять responsive
- **Итеративный стиль** — не делать всё сразу, маленькие шаги с проверкой
- **Deploy > Code** — критично: сначала задеплой, потом дорабатывай
- **Параллельные агенты** — использовать когда задачи независимы
- **Коммитить часто** — не накапливать изменения
- **Честность с клиентами** — упоминать reseller модель в маркетинге

---

## План дальше — выбери откуда начать

### A. BTCPay настройка (20 мин, блокер для платежей)
```bash
cd /var/www/mozartgpu
docker compose up btcpayserver nbxplorer -d
# Потом через UI:
# 1. Открыть https://web3playlab.win/btcpay/ (добавить nginx location)
# 2. Создать admin аккаунт
# 3. Создать Store → получить STORE_ID
# 4. Создать API key → BTCPAY_API_KEY
# 5. Настроить webhook → BTCPAY_WEBHOOK_SECRET
# 6. Заполнить .env
# 7. docker compose restart fastapi-app
```

### B. Закоммитить баг #14 fix
```bash
cd /var/www/mozartgpu
git status  # проверить что изменилось в billing.py
git add backend/app/routers/billing.py
git commit -m "fix: bug #14 - server-side BTCPay verification + amount check"
git push
```

### C. Сгенерировать og-image.png
Открыть https://web3playlab.win/generate-og.html в Chrome, DevTools 1200x630, скриншот → /var/www/mozartgpu/img/og-image.png

### D. Маркетинг запуск
Прочитать marketing-posts.md, выбрать площадку, запостить

### E. Купить домен mozartgpu.com + DNS + SSL

### F. Начать P2P GPU marketplace (3-4 недели)
См. docs/memory/p2p_marketplace_plan.md

---

## Команды которые часто нужны

```bash
# Проверить статус
cd /var/www/mozartgpu
docker compose ps
docker compose logs fastapi-app --tail 30

# Обновить код
git pull
docker compose up fastapi-app -d --build
docker image prune -f

# Тесты API
curl https://web3playlab.win/api/v1/health
curl https://web3playlab.win/api/v1/gpu-models/

# Регистрация/логин
curl -X POST https://web3playlab.win/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123!"}'
```

---

## Память проекта

Полная память в `/var/www/mozartgpu/docs/memory/`:

- `MEMORY.md` — индекс
- `project_mozart.md` — общий контекст
- `user_profile.md` — профиль пользователя
- `work_history.md` — хронология всех сессий
- `feedback_workflow.md` — обратная связь, предпочтения
- `audit_roadmap.md` — roadmap после аудитов
- `critical_architecture_issues.md` — статус 16 багов
- `credentials_reference.md` — все учётки и статусы
- `dashboard_ux.md` — UX спецификация
- `infra_roadmap.md` — инфраструктурный план
- `finance_accounting.md` — P&L, break-even
- `legal_structure.md` — юридическая структура (РФ→Тайланд)
- `resale_architecture.md` — архитектура ресейла vast.ai
- `p2p_marketplace_plan.md` — план P2P marketplace
- `vastai_competitor.md` — анализ vast.ai
- `vastai_security_auth.md` — security/auth vast.ai
- `research_business_analysis.md` — бизнес-анализ
- `research_gtm_strategy.md` — GTM стратегия

---

## Команда sub-агентов (9 специалистов)

Агенты лежат в `.claude/agents/` и автоматически подхватываются Claude Code когда ты в этой директории.

| Агент | Когда использовать |
|-------|-------------------|
| **tech-lead** | Архитектурные решения, декомпозиция больших задач, координация команды |
| **frontend-dev** | HTML/CSS/vanilla JS, UI компоненты, Canvas 2D, responsive |
| **backend-dev** | FastAPI, SQLAlchemy, API endpoints, БД схемы |
| **designer** | UX/UI, визуальная иерархия, типографика, a11y, breakpoints |
| **devops** | Docker, Nginx, SSL, CI/CD, инфраструктура, деплой |
| **qa-engineer** | Тестирование, баги, кросс-браузерность, responsive тесты |
| **security-auditor** | Уязвимости, XSS, CSP, аудит зависимостей, security before deploy |
| **performance-engineer** | Core Web Vitals, Lighthouse, bundle size, оптимизация |
| **copywriter** | Контент, SEO мета-теги, маркетинг, описания |

**Как запускать:**

Одного агента:
```
Используй Agent tool с subagent_type=devops для задачи X
```

Несколько параллельно (одно сообщение, несколько Agent вызовов):
```
Запусти параллельно:
- backend-dev: fix bug #14
- frontend-dev: rebuild console
- devops: update nginx
```

**Важные правила работы с агентами:**

1. **Давай конкретные файлы и задачи** — не "улучши код", а "исправь C:/path/file.py строка 42, добавь return"
2. **Запускай параллельно когда независимо** — огромный буст по скорости
3. **run_in_background: true** для долгих задач (build, install)
4. **Не дублируй работу** — если агент читает файлы, не читай их сам параллельно
5. **Агенты не видят твой контекст** — давай полный брифинг каждому
6. **Не передавай секреты в промпт** — они попадут в логи

## Для Claude на VPS — первая команда

После чтения этого файла выполни:

```bash
cd /var/www/mozartgpu
git status
git log --oneline -5
docker compose ps
```

Затем доложи пользователю:
1. Какие коммиты на VPS отличаются от main
2. Статус Docker контейнеров
3. Что предлагаешь делать первым

Жди команды от пользователя.
