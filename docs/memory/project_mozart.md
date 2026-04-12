---
name: MOZART GPU Rental Platform
description: Основной проект — премиальная платформа аренды GPU по часам, лендинг на vanilla HTML/CSS/JS
type: project
---

## Проект MOZART

Премиальная платформа аренды GPU по часам (GPU-as-a-Service). Клон структуры WorldQuant Foundry, переработанный под GPU-рентал бренд.

**Стек:** Vanilla HTML/CSS/JS (без фреймворков — осознанный выбор), Canvas 2D анимации.

**Файловая структура:**
- `index.html` — одностраничный лендинг
- `css/style.css` — все стили, CSS custom properties
- `js/main.js` — интерактив: слайдер, модалка, scroll reveal, мобильное меню
- `js/gpu-particles.js` — Canvas 2D частицы (GPU die визуализация, typed arrays, 12K частиц)
- `img/` — фото дата-центров (ethos), low-poly GPU рендеры, фото команды

**Дизайн-система:**
- Palette: gold (#D4A843), purple (#5B2C6F), burgundy (#800020), rich-carbon (#1A0A2E), core-black (#0D0517), celestial-blue (#A8D8EA), neural-fog (#FFFFF0)
- Тёмная премиальная эстетика, золотые акценты
- Uppercase заголовки

**GPU каталог с ценами:**
- NVIDIA H100 — $2.50/hr (80GB HBM3, 3.35 TB/s, 990 TFLOPS)
- NVIDIA A100 — $1.80/hr (80GB HBM2e, 2 TB/s, 312 TFLOPS)
- NVIDIA L40S — $1.20/hr (48GB GDDR6X, 864 GB/s, 362 TFLOPS)
- RTX 4090 — $0.80/hr (24GB GDDR6X, 1 TB/s, 330 TFLOPS)
- RTX 3090 — $0.45/hr (24GB GDDR6X, 936 GB/s, 142 TFLOPS)

**Why:** Пользователь строит реальный бизнес по аренде GPU, лендинг — первый этап.

**How to apply:** Все решения должны соответствовать премиальному позиционированию бренда MOZART. Контент ориентирован на ML-инженеров, дата-сайентистов, AI-исследователей.
