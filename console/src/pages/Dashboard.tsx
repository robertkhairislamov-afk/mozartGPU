import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useBalance } from '@/hooks/useBilling'
import { useInstances } from '@/hooks/useInstances'
import StatusBadge from '@/components/StatusBadge'

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="kpi-card">
      <p className="section-title">{label}</p>
      <p className="text-2xl font-bold text-neural-fog font-mono">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: balance, isLoading: balanceLoading } = useBalance()
  const { data: instances, isLoading: instancesLoading } = useInstances()

  const runningInstances = instances?.filter((i) => i.status === 'running') ?? []
  const totalHoursRemaining = balance?.items.reduce(
    (sum, item) => sum + parseFloat(item.hours_remaining),
    0
  ) ?? 0
  const totalSpent = balance?.total_spent_usd ?? '0'

  // Today's estimated spend: running instances × their rate
  const todaySpend = runningInstances.reduce((sum, inst) => {
    return sum + parseFloat(inst.client_cost_per_hour)
  }, 0)

  const activeInstances = instances?.slice(0, 5) ?? []

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted text-sm mt-1">
          Welcome back, <span className="text-neural-fog">{user?.email}</span>
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total Spent"
          value={balanceLoading ? '—' : `$${parseFloat(totalSpent).toFixed(2)}`}
          sub="All time"
        />
        <KpiCard
          label="Running GPUs"
          value={instancesLoading ? '—' : String(runningInstances.length)}
          sub="Active instances"
        />
        <KpiCard
          label="Today's Spend"
          value={`~$${todaySpend.toFixed(2)}`}
          sub="Per hour estimate"
        />
        <KpiCard
          label="Hours Remaining"
          value={balanceLoading ? '—' : `${totalHoursRemaining.toFixed(1)}h`}
          sub="Across all GPUs"
        />
      </div>

      {/* Active Instances */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <span className="section-title mb-0">Active Instances</span>
          <Link to="/instances" className="text-xs text-gold hover:text-gold-dim">
            View all
          </Link>
        </div>

        {instancesLoading ? (
          <div className="px-4 py-8 text-center text-muted text-sm">Loading...</div>
        ) : activeInstances.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted text-sm">
            No instances yet.{' '}
            <Link to="/instances/new" className="text-gold hover:underline">
              Launch your first GPU
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Instance</th>
                  <th>Status</th>
                  <th className="hidden sm:table-cell">Cost/hr</th>
                  <th className="hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {activeInstances.map((inst) => (
                  <tr key={inst.id}>
                    <td>
                      <Link
                        to={`/instances/${inst.id}`}
                        className="text-neural-fog hover:text-gold transition-colors font-mono text-xs"
                      >
                        {inst.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td>
                      <StatusBadge status={inst.status} />
                    </td>
                    <td className="hidden sm:table-cell font-mono text-xs text-muted">
                      ${parseFloat(inst.client_cost_per_hour).toFixed(2)}
                    </td>
                    <td className="hidden md:table-cell text-xs text-muted">
                      {new Date(inst.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="section-title">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/instances/new" className="btn-primary">
            Launch GPU
          </Link>
          <Link to="/billing" className="btn-secondary">
            Add Funds
          </Link>
          <a
            href="https://docs.mozartgpu.com"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            View Docs
          </a>
        </div>
      </div>
    </div>
  )
}
