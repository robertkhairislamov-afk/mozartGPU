// ─── Auth ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  telegram_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: string
  name: string
  key_prefix: string
  permissions: Record<string, unknown>
  is_active: boolean
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

// ─── GPU Models ───────────────────────────────────────────────────────────────

export interface GpuModel {
  id: string
  name: string
  short_name: string
  vram_gb: number
  tflops_fp16: number
  price_per_hour: string
  vast_filter: Record<string, unknown>
  is_available: boolean
  created_at: string
}

// ─── Instances ───────────────────────────────────────────────────────────────

export type InstanceStatus =
  | 'creating'
  | 'running'
  | 'stopped'
  | 'error'
  | 'destroyed'

export interface Instance {
  id: string
  user_id: string
  gpu_model_id: string
  status: InstanceStatus
  vast_instance_id: string | null
  ssh_host: string | null
  ssh_port: number | null
  provider_cost_per_hour: string
  client_cost_per_hour: string
  hours_purchased: number
  hours_used: string
  started_at: string | null
  stopped_at: string | null
  created_at: string
}

export interface InstanceCreate {
  gpu_model_id: string
  ssh_key_id: string
  hours: number
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'pending' | 'settled' | 'expired' | 'invalid'

export interface Invoice {
  id: string
  user_id: string
  btcpay_invoice_id: string
  amount_usd: string
  status: InvoiceStatus
  package_id: string
  created_at: string
  settled_at: string | null
}

export interface BalanceItem {
  gpu_short_name: string
  hours_purchased: number
  hours_used: string
  hours_remaining: string
}

export interface BalanceResponse {
  items: BalanceItem[]
  total_spent_usd: string
}

export interface DepositRequest {
  package_id: string
  email?: string
}

export interface DepositResponse {
  invoice_id: string
  checkout_url: string
  amount_usd: string
  package_id: string
  expires_at: string | null
}

// ─── SSH Keys ─────────────────────────────────────────────────────────────────

export interface SshKey {
  id: string
  user_id: string
  name: string
  public_key: string
  fingerprint: string
  created_at: string
}

export interface SshKeyCreate {
  name: string
  public_key: string
}

// ─── GPU Packages (billing) ───────────────────────────────────────────────────

export interface GpuPackage {
  id: string
  label: string
  gpu: string
  hours: number
  price_usd: number
}

export const GPU_PACKAGES: GpuPackage[] = [
  { id: 'rtx4090_10h', label: 'RTX 4090 — 10 hours', gpu: 'RTX 4090', hours: 10, price_usd: 8 },
  { id: 'rtx4090_50h', label: 'RTX 4090 — 50 hours', gpu: 'RTX 4090', hours: 50, price_usd: 38 },
  { id: 'a100_10h',    label: 'A100 — 10 hours',     gpu: 'A100',     hours: 10, price_usd: 18 },
  { id: 'a100_50h',    label: 'A100 — 50 hours',     gpu: 'A100',     hours: 50, price_usd: 85 },
  { id: 'h100_10h',    label: 'H100 — 10 hours',     gpu: 'H100',     hours: 10, price_usd: 25 },
  { id: 'h100_50h',    label: 'H100 — 50 hours',     gpu: 'H100',     hours: 50, price_usd: 120 },
]

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string
}
