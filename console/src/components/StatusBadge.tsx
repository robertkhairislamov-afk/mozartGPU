import type { InstanceStatus } from '@/lib/types'

interface Props {
  status: InstanceStatus
}

export default function StatusBadge({ status }: Props) {
  if (status === 'running') {
    return (
      <span className="badge-running">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
        Running
      </span>
    )
  }
  if (status === 'creating') {
    return (
      <span className="badge-creating">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow" />
        Creating
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="badge-error">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Error
      </span>
    )
  }
  if (status === 'stopped') {
    return (
      <span className="badge-stopped">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
        Stopped
      </span>
    )
  }
  return (
    <span className="badge-destroyed">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
      Destroyed
    </span>
  )
}
