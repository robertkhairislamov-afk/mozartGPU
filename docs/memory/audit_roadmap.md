---
name: Roadmap после аудита 8 агентов
description: Сводный план исправлений по результатам полного аудита всех 8 агентов (2026-04-09) — приоритеты P0-P3
type: project
---

## Полный аудит MOZART — 2026-04-09

8 агентов (Designer, Frontend, QA, Security, Performance, Copywriter, Backend, DevOps) провели параллельный аудит. Ниже — консолидированный roadmap.

---

## P0 — Critical (до деплоя)

### Безопасность
- [ ] Self-host Three.js — убрать CDN без SRI (Security HIGH-2)
- [ ] Создать `.gitignore` — `.claude/`, `node_modules/`, `foundry_page.html` (Security MEDIUM-4)
- [ ] Добавить CSP meta-тег или HTTP-заголовок (Security HIGH-1)

### QA / HTML
- [ ] Добавить favicon — `<link rel="icon">` (QA BUG-01)
- [ ] Добавить OG + Twitter Card мета-теги (QA BUG-02, Copywriter)
- [ ] Определить CSS-класс `.p2` — используется в Industries, но не существует (QA BUG-03)

### Доступность (a11y)
- [ ] Добавить `:focus-visible` стили на `.btn`, `.nav-link`, `.form-input` (Designer P0)
- [ ] Radio inputs: заменить `display:none` на `.sr-only` (Designer P0)
- [ ] Footer copyright: поднять контраст с 2.9:1 до 4.5:1+ (Designer P0)

### Контент
- [ ] Исправить RTX 4090 TFLOPS: 330 → 165 FP32 (или уточнить TF32) (Copywriter)

---

## P1 — High Priority (первая неделя)

### Мобильная адаптация
- [ ] `.form-row` — одна колонка на <500px (Frontend КРИТИЧНО, QA BUG-07)
- [ ] `.modal-close-btn` — touch target с 24px до 44px (Frontend КРИТИЧНО)
- [ ] Все `.btn` — высота с 40px до 44px touch target (Frontend)
- [ ] `.mobile-toggle` — 44px + визуальное состояние open (Frontend)
- [ ] `.industry-item` — padding 40px→16px на мобильных (Frontend)
- [ ] `.footer-content` — одна колонка на <480px (Frontend)
- [ ] `hover:none` — fallback для touch-устройств на ethos, industry, team (Designer P1)

### Производительность
- [ ] Добавить `defer` на `main.js` и `gpu-particles.js` (Performance — 5 мин)
- [ ] Сократить Google Fonts: Inter 6→4 весов, JetBrains 4→2 (Performance)
- [ ] Убрать fake loader или привязать к DOMContentLoaded (Performance HIGH)
- [ ] Кэшировать `canvas.clientWidth/Height` вне rAF (Performance HIGH)
- [ ] Hero rAF: добавить guard `if(!state.visible)` на репульсию (QA BUG-10)
- [ ] `Math.sqrt` → сравнение квадратов расстояния в hot loop (Performance)
- [ ] `scroll` listener — добавить `{ passive: true }` (Frontend)

### Кросс-браузерность
- [ ] `backdrop-filter` — добавить `-webkit-` префикс (QA BUG-04)
- [ ] `100dvh` — fallback `100vh` перед `100dvh` (QA BUG-05)

### Безопасность
- [ ] X-Frame-Options / frame-ancestors 'none' (Security MEDIUM-3)
- [ ] Убрать/обернуть `console.log` в three-scene.js (Security MEDIUM-2)

---

## P2 — Medium Priority (вторая неделя)

### Изображения
- [ ] Конвертировать 12 PNG → WebP + AVIF (Performance CRITICAL)
- [ ] Добавить `<picture>` элемент с fallback (Performance)
- [ ] Добавить `width`/`height` атрибуты на все `<img>` — CLS fix (Performance)
- [ ] Первые above-fold изображения: `loading="eager"` + `fetchpriority="high"` (Performance)
- [ ] Preload GLB модели: `<link rel="preload" href="models/..." as="fetch">` (Performance)
- [ ] Оценить/сжать GLB через gltfpack (Performance)

### CSS cleanup
- [ ] Удалить `--electric-teal` (дубль `--gold`) (QA BUG-20, Designer)
- [ ] Удалить orphaned CSS: `.footer-sub-nav`, `.footer-sub-link`, `.modal-close`, `.ethos-card-icon` (QA BUG-14)
- [ ] Заменить `PP Neue Machina` → `JetBrains Mono` в `.gpu-specs` (QA BUG-15)
- [ ] Hero description: поднять opacity с 0.6 до 0.75 для контраста (Designer P2)
- [ ] `prefers-reduced-motion: reduce` — отключить анимации (Designer P2)
- [ ] Заменить `filter: blur` hover → `transform`/`opacity` (Performance)
- [ ] `transition: all` → явные свойства (Performance LOW)

### Доступность
- [ ] `<label for>` + `<input id>` в модальной форме (QA BUG-16)
- [ ] Модал: закрытие по Escape (QA BUG-17)
- [ ] `aria-expanded` sync при закрытии меню через ссылки (QA BUG-18)
- [ ] Скрытые элементы: добавить `aria-hidden="true"` (Designer)

### JS cleanup
- [ ] Объединить 5 rAF loops в единый master loop (Performance)
- [ ] `resize` listeners — добавить cleanup через AbortController (QA BUG-09)
- [ ] `setInterval` polling для сцен — ограничить max attempts (QA BUG-19)
- [ ] `initAnimations()` — добавить safety timeout 5s (QA BUG-12)
- [ ] `w/h` closure в Hero — обновлять при resize (QA BUG-21)
- [ ] Guard деление на ноль: `canvas.clientWidth === 0` (QA BUG-11)

### HTML семантика
- [ ] Team header: убрать дублирующие `<span>`, оставить только `<h2>` (QA BUG-08)
- [ ] `<h2 class="p2-mono">` в team — слишком мелкий, нужен `.h5` (Designer P3)
- [ ] H1-H6 иерархия: переструктурировать (Copywriter)

### Контент / SEO
- [ ] Расширить meta description до 150-160 символов (Copywriter)
- [ ] Добавить JSON-LD Schema (Organization + Product) (Copywriter)
- [ ] Дифференцировать CTA: "Get Started" → уникальные по контексту (Copywriter)
- [ ] Убрать "Virtuoso" из H1, сделать конкретнее (Copywriter)
- [ ] Legal ссылки: Privacy, Terms, Cookies — создать или поставить placeholder (QA BUG-13)

---

## P3 — Долгосрочное (деплой + backend)

### Деплой (DevOps)
- [ ] Git init + GitHub repo
- [ ] Cloudflare Pages — подключить, настроить custom domain
- [ ] `_headers` файл — кэширование, security headers
- [ ] GitHub Actions CI/CD — lint → minify → deploy
- [ ] Cloudflare Web Analytics
- [ ] Sentry для JS-ошибок

### Сборка (DevOps + Performance)
- [ ] Vite build — minification, tree-shaking Three.js (~200KB экономии)
- [ ] Brotli компрессия
- [ ] Self-host шрифты для устранения внешнего DNS lookup

### Backend API (Backend Dev)
- [ ] Стек: Node.js + Fastify + TypeScript + PostgreSQL + Redis
- [ ] 6 таблиц: users, gpu_models, gpu_instances, rentals, billing_ticks, invoices
- [ ] Auth: JWT (Access 15min + Refresh 30d) + API Keys (mzt_sk_...)
- [ ] GPU каталог: GET /v1/gpus, фильтрация, availability
- [ ] Аренда: POST/GET /v1/rentals, stop, metrics
- [ ] Биллинг: тикинговая модель (60s), Stripe интеграция
- [ ] Контактная форма: POST /v1/contact с rate-limit + honeypot
- [ ] WebSocket: реалтайм GPU статус + метрики аренды
- [ ] Docker compose для локальной разработки

### Уточнить
- [ ] Актуальные цены GPU (расхождение между фронтом и memory)
- [ ] Breakpoint 480px — нужен между 320 и 768 (Designer)
- [ ] Breakpoint 1440px+ — типографика для больших экранов (Designer)

---

**Why:** Полный аудит 8 специалистами выявил ~50+ задач. Без roadmap они потеряются.
**How to apply:** Использовать как чек-лист при работе над MOZART. Отмечать выполненное. Приоритеты: P0 до деплоя, P1 первая неделя, P2 вторая, P3 долгосрочно.
