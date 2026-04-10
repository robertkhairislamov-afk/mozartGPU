import { useState } from 'react'
import { useBalance, useDeposit, useInvoices } from '@/hooks/useBilling'
import { GPU_PACKAGES } from '@/lib/types'
import type { InvoiceStatus } from '@/lib/types'

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const map: Record<InvoiceStatus, string> = {
    pending: 'bg-amber-950 text-amber-400',
    settled: 'bg-green-950 text-green-400',
    expired: 'bg-zinc-900 text-zinc-500',
    invalid: 'bg-red-950 text-red-400',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize ${map[status]}`}>
      {status}
    </span>
  )
}

export default function Billing() {
  const { data: balance, isLoading: balanceLoading } = useBalance()
  const { data: invoices, isLoading: invoicesLoading } = useInvoices()
  const depositMutation = useDeposit()

  const [selectedPackage, setSelectedPackage] = useState<string>('h100_10h')
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null)

  const pkg = GPU_PACKAGES.find((p) => p.id === selectedPackage)

  const handleDeposit = () => {
    depositMutation.mutate(
      { package_id: selectedPackage },
      {
        onSuccess: (data) => {
          setDepositSuccess(data.checkout_url)
          window.open(data.checkout_url, '_blank')
        },
      }
    )
  }

  const totalHoursRemaining = balance?.items.reduce(
    (sum, item) => sum + parseFloat(item.hours_remaining),
    0
  ) ?? 0

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-0">
      <h1 className="page-title">Billing</h1>

      {/* Balance overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="kpi-card">
          <p className="section-title">Total Spent</p>
          <p className="text-2xl font-bold font-mono text-neural-fog">
            {balanceLoading ? '—' : `$${parseFloat(balance?.total_spent_usd ?? '0').toFixed(2)}`}
          </p>
          <p className="text-xs text-muted">Lifetime</p>
        </div>
        <div className="kpi-card">
          <p className="section-title">Hours Remaining</p>
          <p className="text-2xl font-bold font-mono text-neural-fog">
            {balanceLoading ? '—' : `${totalHoursRemaining.toFixed(1)}h`}
          </p>
          <p className="text-xs text-muted">Across all GPUs</p>
        </div>
      </div>

      {/* Per-GPU balance */}
      {balance && balance.items.length > 0 && (
        <div className="card">
          <p className="section-title">GPU Hours Balance</p>
          <div className="space-y-3">
            {balance.items.map((item, i) => {
              const pct = item.hours_purchased > 0
                ? (parseFloat(item.hours_used) / item.hours_purchased) * 100
                : 0
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{item.gpu_short_name}</span>
                    <span className="font-mono text-muted text-xs">
                      {parseFloat(item.hours_remaining).toFixed(1)}h / {item.hours_purchased}h
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Funds */}
      <div className="card">
        <p className="section-title">Add Funds</p>
        <p className="text-xs text-muted mb-4">
          Purchase GPU hours via crypto (BTCPay). You'll be redirected to a secure checkout page.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {GPU_PACKAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPackage(p.id)}
              className={[
                'text-left p-3 rounded-[8px] border transition-all duration-150',
                selectedPackage === p.id
                  ? 'border-gold bg-[#1a160a]'
                  : 'border-[#2a2a2a] hover:border-[#444]',
              ].join(' ')}
            >
              <div className="text-xs font-semibold text-neural-fog">{p.gpu}</div>
              <div className="text-xs text-muted">{p.hours}h</div>
              <div className="text-gold font-bold font-mono text-sm mt-1">${p.price_usd}</div>
            </button>
          ))}
        </div>

        {pkg && (
          <div className="flex items-center justify-between px-3 py-2.5 bg-[#161616] rounded-[6px] mb-4">
            <span className="text-sm text-muted">Selected:</span>
            <span className="text-sm font-medium font-mono">
              {pkg.label} — <span className="text-gold">${pkg.price_usd}</span>
            </span>
          </div>
        )}

        {depositSuccess && (
          <div className="mb-4 px-3 py-2.5 bg-green-950 border border-green-800 rounded-[6px] text-sm text-green-400">
            Payment page opened.{' '}
            <a href={depositSuccess} target="_blank" rel="noreferrer" className="underline">
              Click here if it didn't open
            </a>
          </div>
        )}

        {depositMutation.error && (
          <div className="mb-4 px-3 py-2.5 bg-red-950 border border-red-800 rounded-[6px] text-sm text-red-400">
            {depositMutation.error.message}
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={depositMutation.isPending || !selectedPackage}
          className="btn-primary w-full sm:w-auto"
        >
          {depositMutation.isPending ? 'Opening checkout...' : 'Pay with Crypto'}
        </button>
      </div>

      {/* Invoice History */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2a2a]">
          <p className="section-title mb-0">Invoice History</p>
        </div>

        {invoicesLoading ? (
          <div className="py-8 text-center text-muted text-sm">Loading invoices...</div>
        ) : !invoices || invoices.length === 0 ? (
          <div className="py-8 text-center text-muted text-sm">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Package</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="text-xs text-muted">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-xs font-mono">{inv.package_id}</td>
                    <td className="text-xs font-mono font-semibold">
                      ${parseFloat(inv.amount_usd).toFixed(2)}
                    </td>
                    <td>
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
