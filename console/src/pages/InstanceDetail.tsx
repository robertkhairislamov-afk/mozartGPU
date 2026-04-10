import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInstance, useDestroyInstance } from '@/hooks/useInstances'
import { useGpu } from '@/hooks/useGpus'
import StatusBadge from '@/components/StatusBadge'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2.5 py-1.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-[4px]
                 text-muted hover:text-neural-fog hover:border-[#444] transition-colors shrink-0"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[#1e1e1e] last:border-0">
      <span className="text-xs text-muted uppercase tracking-wide w-28 shrink-0">{label}</span>
      <span className="text-sm text-neural-fog font-mono text-right">{children}</span>
    </div>
  )
}

function formatUptime(startedAt: string | null): string {
  if (!startedAt) return '—'
  const ms = Date.now() - new Date(startedAt).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function InstanceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: instance, isLoading, error } = useInstance(id ?? '')
  const { data: gpu } = useGpu(instance?.gpu_model_id)
  const destroyMutation = useDestroyInstance()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDestroy = () => {
    if (!id) return
    destroyMutation.mutate(id, {
      onSuccess: () => navigate('/instances'),
    })
  }

  const sshCommand =
    instance?.ssh_host && instance?.ssh_port
      ? `ssh -p ${instance.ssh_port} root@${instance.ssh_host}`
      : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm">
        Loading instance...
      </div>
    )
  }

  if (error || !instance) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-400 text-sm">Instance not found or failed to load.</p>
        <button onClick={() => navigate('/instances')} className="btn-secondary text-sm">
          Back to Instances
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/instances')}
            className="text-xs text-muted hover:text-neural-fog mb-2 flex items-center gap-1"
          >
            ← Instances
          </button>
          <h1 className="page-title font-mono text-base">{instance.id.slice(0, 8)}…</h1>
        </div>
        <StatusBadge status={instance.status} />
      </div>

      {/* Info card */}
      <div className="card">
        <p className="section-title">Instance Info</p>
        <InfoRow label="GPU">{gpu?.name ?? '—'}</InfoRow>
        <InfoRow label="VRAM">{gpu ? `${gpu.vram_gb} GB` : '—'}</InfoRow>
        <InfoRow label="Status">
          <StatusBadge status={instance.status} />
        </InfoRow>
        <InfoRow label="Uptime">{formatUptime(instance.started_at)}</InfoRow>
        <InfoRow label="Host">{instance.ssh_host ?? 'Pending…'}</InfoRow>
        <InfoRow label="Port">{instance.ssh_port ? String(instance.ssh_port) : 'Pending…'}</InfoRow>
        <InfoRow label="Cost/hr">${parseFloat(instance.client_cost_per_hour).toFixed(2)}</InfoRow>
        <InfoRow label="Hours">{instance.hours_purchased}h purchased</InfoRow>
        <InfoRow label="Hours used">{parseFloat(instance.hours_used).toFixed(2)}h</InfoRow>
        <InfoRow label="Created">
          {new Date(instance.created_at).toLocaleString()}
        </InfoRow>
      </div>

      {/* SSH Command */}
      {sshCommand && (
        <div className="card">
          <p className="section-title">SSH Access</p>
          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-[6px] p-3">
            <code className="text-xs font-mono text-gold flex-1 overflow-x-auto whitespace-nowrap">
              {sshCommand}
            </code>
            <CopyButton text={sshCommand} />
          </div>
        </div>
      )}

      {instance.status === 'creating' && (
        <div className="px-4 py-3 bg-amber-950 border border-amber-800 rounded-[8px] text-sm text-amber-300">
          Instance is being provisioned. SSH access will be available once it reaches Running state.
          This page auto-refreshes.
        </div>
      )}

      {/* Actions */}
      {instance.status !== 'destroyed' && (
        <div className="card">
          <p className="section-title">Actions</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(true)}
              className="btn-danger"
            >
              Destroy Instance
            </button>
          </div>
          <p className="text-xs text-muted mt-2">
            Destroying an instance is permanent and cannot be undone.
          </p>
        </div>
      )}

      {/* Confirm destroy modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="card w-full max-w-sm">
            <h2 className="text-base font-semibold text-neural-fog mb-2">Destroy instance?</h2>
            <p className="text-sm text-muted mb-5">
              This will permanently terminate the GPU instance. Remaining prepaid hours will not be
              refunded.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDestroy}
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
