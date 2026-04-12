---
name: Dashboard UX спецификация
description: Полный дизайн user cabinet — 10 экранов, wireframes, shadcn/ui компоненты, onboarding flow
type: project
---

## Стек: React 18 + TypeScript + Vite + shadcn/ui + TanStack Query + Tailwind v4

## Layout: Collapsible Left Sidebar (240px→64px→hidden) + Top Bar
- Dark mode only (бренд MOZART)
- Mobile: bottom navigation (4 иконки)

## 10 экранов:

### 1. Dashboard — KPI cards (Balance, Running GPUs, Today Spend, Monthly Budget) + Active Instances table + Usage chart + Quick Actions
### 2. Instances — DataTable с фильтрами (status, GPU), mobile = card layout
### 3. Create Instance — 4-step wizard: GPU (grid карточки) → Template → Config (region, disk, SSH, auto-stop) → Review + estimated cost → Deploy
### 4. Instance Detail — Info panel + embedded terminal (xterm.js) / Logs / Metrics (realtime WebSocket)
### 5. Billing — Balance + burn rate + auto top-up + usage BarChart + invoice history
### 6. API Keys — CRUD, permissions per key, one-time show after creation
### 7. SSH Keys — Upload public key, fingerprint display
### 8. Templates — Official / My Templates / Custom Docker image
### 9. Settings — Profile / Security (2FA) / Notifications / Team (invite, RBAC) / Danger Zone
### 10. Onboarding — Checklist (Add SSH Key → Add Funds → Launch GPU), contextual hints, empty states

## Ключевые UX паттерны:
- WebSocket для realtime status updates (useInstanceStatus hook)
- Toast notifications (Sonner) для events
- Copy-to-clipboard для SSH commands
- Status badges: Running (emerald pulse), Stopped (gray), Error (red), Starting (amber spin)
- GPU selection: карточки с hover gold border, selected = gold glow + checkmark

## Файловая структура: console/src/{components, pages, hooks, lib}

**Why:** ML-инженеры проводят 80% времени на Instance Detail — terminal + metrics. Dashboard — быстрый обзор. Wizard — снижает ошибки.
**How to apply:** Начинать с Instances + Create + Billing (core flow). Dashboard и Settings — фаза 2.
