import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInstances, useDestroyInstance } from '@/hooks/useInstances'
import { useGpus } from '@/hooks/useGpus'
import StatusBadge from '@/components/StatusBadge'
import type { Instance, InstanceStatus } from '@/lib/types'
import { Icon } from '@/components/Layout'

const STATUS_FILTERS: Array<InstanceStatus | 'all'> = [
  'all',
  'running',
  'creating',
  'stopped',
  'error',
  'destroyed',
]

function formatUptime(startedAt: string | null): string {
  if (!startedAt) return '—'
  const ms = Date.now() - new Date(startedAt).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function Instances() {
  const { data: instances, isLoading, error } = useInstances()
  const { data: gpus } = useGpus()
  const destroyMutation = useDestroyInstance()

  const [statusFilter, setStatusFilter] = useState<InstanceStatus | 'all'>('all')
  const [gpuFilter, setGpuFilter] = useState<string>('all')
  const [confirmDestroy, setConfirmDestroy] = useState<string | null>(null)

  const gpuMap = new Map(gpus?.map((g) => [g.id, g]) ?? [])

  const filtered = (instances ?? []).filter((inst) => {
    if (statusFilter !== 'all' && inst.status !== statusFilter) return false
    if (gpuFilter !== 'all' && inst.gpu_model_id !== gpuFilter) return false
    return true
  })

  const handleDestroy = (id: string) => {
    destroyMutation.mutate(id, {
      onSuccess: () => setConfirmDestroy(null),
    })
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Instances</h1>
        <Link to="/instances/new" className="btn-primary">
          <Icon name="plus" size={16} />
          New Instance
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Status filter */}
        <div className="flex gap-1 bg-[#111] border border-[#2a2a2a] rounded-[6px] p-0.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={[
                'px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors capitalize',
                statusFilter === s
                  ? 'bg-[#2a2a2a] text-neural-fog'
                  : 'text-muted hover:text-neural-fog',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>

        {/* GPU filter */}
        {gpus && gpus.length > 0 && (
          <select
            value={gpuFilter}
            onChange={(e) => setGpuFilter(e.target.value)}
            className="input w-auto px-3 py-1.5 text-xs min-h-[36px]"
          >
            <option value="all">All GPUs</option>
            {gpus.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-muted text-sm">Loading instances...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-400 text-sm">
            Failed to load instances. Please refresh.
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted text-sm">
            {instances?.length === 0 ? (
              <>
                No instances yet.{' '}
                <Link to="/instances/new" className="text-gold hover:underline">
                  Launch your first GPU
                </Link>
              </>
            ) : (
              'No instances match the selected filters.'
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>GPU</th>
                  <th>Status</th>
                  <th className="hidden sm:table-cell">Uptime</th>
                  <th className="hidden md:table-cell">Cost/hr</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst: Instance) => {
                  const gpu = gpuMap.get(inst.gpu_model_id)
                  return (
                    <tr key={inst.id}>
                      <td>
                        <Link
                          to={`/instances/${inst.id}`}
                          className="font-mono text-xs text-neural-fog hover:text-gold transition-colors"
                        >
                          {inst.id.slice(0, 8)}…
                        </Link>
                      </td>
                      <td className="text-sm">
                        {gpu?.short_name ?? <span className="text-muted text-xs">—</span>}
                      </td>
                      <td>
                        <StatusBadge status={inst.status} />
                      </td>
                      <td className="hidden sm:table-cell text-xs text-muted font-mono">
                        {formatUptime(inst.started_at)}
                      </td>
                      <td className="hidden md:table-cell text-xs text-muted font-mono">
                        ${parseFloat(inst.client_cost_per_hour).toFixed(2)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/instances/${inst.id}`}
                            className="text-xs text-gold hover:text-gold-dim transition-colors"
                          >
                            Details
                          </Link>
                          {inst.status !== 'destroyed' && (
                            <button
                              onClick={() => setConfirmDestroy(inst.id)}
                              className="text-xs text-red-500 hover:text-red-400 transition-colors"
                            >
                              Destroy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm destroy modal */}
      {confirmDestroy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="card w-full max-w-sm">
            <h2 className="text-base font-semibold text-neural-fog mb-2">Destroy instance?</h2>
            <p className="text-sm text-muted mb-5">
              This will permanently terminate the GPU instance. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDestroy(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDestroy(confirmDestroy)}
                disabled={destroyMutation.isPending}
                className="btn-danger flex-1"
              >
                {destroyMutation.isPending ? 'Destroying...' : 'Destroy'}
              </button>
            </div>
            {destroyMutation.error && (
              <p className="text-xs text-red-400 mt-3">{destroyMutation.error.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
