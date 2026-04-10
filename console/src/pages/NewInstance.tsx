import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGpus } from '@/hooks/useGpus'
import { useSshKeys } from '@/hooks/useSshKeys'
import { useCreateInstance } from '@/hooks/useInstances'
import type { GpuModel, SshKey } from '@/lib/types'

const TEMPLATES = [
  { id: 'pytorch', label: 'PyTorch 2.2', desc: 'CUDA 12.1, Python 3.11' },
  { id: 'tensorflow', label: 'TensorFlow 2.15', desc: 'CUDA 12.1, Python 3.11' },
  { id: 'vllm', label: 'vLLM 0.4', desc: 'Fast LLM inference server' },
  { id: 'jupyter', label: 'JupyterLab', desc: 'Notebook environment + PyTorch' },
  { id: 'cuda', label: 'CUDA Base', desc: 'Bare CUDA 12.1, Ubuntu 22.04' },
]

const STEPS = ['Select GPU', 'Template', 'Config', 'Review']

export default function NewInstance() {
  const navigate = useNavigate()
  const { data: gpus, isLoading: gpusLoading } = useGpus()
  const { data: sshKeys, isLoading: keysLoading } = useSshKeys()
  const createMutation = useCreateInstance()

  const [step, setStep] = useState(0)
  const [selectedGpu, setSelectedGpu] = useState<GpuModel | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('pytorch')
  const [selectedKey, setSelectedKey] = useState<SshKey | null>(null)
  const [hours, setHours] = useState(10)
  const [disk, setDisk] = useState(50)

  const canNext =
    (step === 0 && selectedGpu !== null) ||
    (step === 1 && selectedTemplate !== '') ||
    (step === 2 && selectedKey !== null && hours >= 1) ||
    step === 3

  const handleDeploy = () => {
    if (!selectedGpu || !selectedKey) return
    createMutation.mutate(
      { gpu_model_id: selectedGpu.id, ssh_key_id: selectedKey.id, hours },
      { onSuccess: (inst) => navigate(`/instances/${inst.id}`) }
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-0">
      <h1 className="page-title">New Instance</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                i < step
                  ? 'bg-gold text-[#0a0a0a]'
                  : i === step
                  ? 'border-2 border-gold text-gold'
                  : 'border border-[#2a2a2a] text-muted',
              ].join(' ')}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span
              className={[
                'text-xs font-medium hidden sm:block',
                i === step ? 'text-neural-fog' : 'text-muted',
              ].join(' ')}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={['flex-1 h-px', i < step ? 'bg-gold' : 'bg-[#2a2a2a]'].join(' ')} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Select GPU */}
      {step === 0 && (
        <div className="space-y-3">
          <p className="section-title">Choose a GPU</p>
          {gpusLoading ? (
            <p className="text-muted text-sm">Loading GPU catalog...</p>
          ) : !gpus || gpus.length === 0 ? (
            <p className="text-muted text-sm">No GPUs available at this time.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {gpus.map((gpu) => (
                <button
                  key={gpu.id}
                  onClick={() => setSelectedGpu(gpu)}
                  className={[
                    'text-left p-4 rounded-[8px] border transition-all duration-150',
                    selectedGpu?.id === gpu.id
                      ? 'border-gold bg-[#1a160a] shadow-card-gold'
                      : 'border-[#2a2a2a] bg-[#111] hover:border-[#444]',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-sm text-neural-fog">{gpu.name}</span>
                    <span className="text-gold font-mono text-sm font-bold">
                      ${parseFloat(gpu.price_per_hour).toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted font-mono">
                    <span>{gpu.vram_gb}GB VRAM</span>
                    <span>{gpu.tflops_fp16} TFLOPS</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Template */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="section-title">Select template</p>
          <div className="space-y-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={[
                  'w-full text-left flex items-center gap-4 p-4 rounded-[8px] border transition-all duration-150',
                  selectedTemplate === tpl.id
                    ? 'border-gold bg-[#1a160a]'
                    : 'border-[#2a2a2a] bg-[#111] hover:border-[#444]',
                ].join(' ')}
              >
                <div
                  className={[
                    'w-4 h-4 rounded-full border-2 shrink-0',
                    selectedTemplate === tpl.id ? 'border-gold bg-gold' : 'border-[#444]',
                  ].join(' ')}
                />
                <div>
                  <div className="text-sm font-medium text-neural-fog">{tpl.label}</div>
                  <div className="text-xs text-muted">{tpl.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Config */}
      {step === 2 && (
        <div className="space-y-5">
          <p className="section-title">Configuration</p>

          <div>
            <label className="label">SSH Key</label>
            {keysLoading ? (
              <p className="text-muted text-sm">Loading keys...</p>
            ) : !sshKeys || sshKeys.length === 0 ? (
              <p className="text-sm text-amber-400">
                No SSH keys found.{' '}
                <a href="/ssh-keys" className="underline">
                  Add one first.
                </a>
              </p>
            ) : (
              <select
                value={selectedKey?.id ?? ''}
                onChange={(e) => {
                  const key = sshKeys.find((k) => k.id === e.target.value) ?? null
                  setSelectedKey(key)
                }}
                className="input"
              >
                <option value="">Select SSH key…</option>
                {sshKeys.map((key) => (
                  <option key={key.id} value={key.id}>
                    {key.name} — {key.fingerprint.slice(0, 20)}…
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="label">
              Disk size — {disk}GB
            </label>
            <input
              type="range"
              min={20}
              max={500}
              step={10}
              value={disk}
              onChange={(e) => setDisk(Number(e.target.value))}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>20 GB</span>
              <span>500 GB</span>
            </div>
          </div>

          <div>
            <label className="label">Hours to rent (1–720)</label>
            <input
              type="number"
              min={1}
              max={720}
              value={hours}
              onChange={(e) => setHours(Math.max(1, Math.min(720, Number(e.target.value))))}
              className="input w-32"
            />
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && selectedGpu && (
        <div className="space-y-4">
          <p className="section-title">Review & Deploy</p>
          <div className="card space-y-3">
            <Row label="GPU" value={selectedGpu.name} />
            <Row label="VRAM" value={`${selectedGpu.vram_gb} GB`} />
            <Row label="Template" value={TEMPLATES.find((t) => t.id === selectedTemplate)?.label ?? selectedTemplate} />
            <Row label="SSH Key" value={selectedKey?.name ?? '—'} />
            <Row label="Disk" value={`${disk} GB`} />
            <Row label="Hours" value={`${hours}h`} />
            <div className="border-t border-[#2a2a2a] pt-3">
              <Row
                label="Estimated Cost"
                value={`$${(parseFloat(selectedGpu.price_per_hour) * hours).toFixed(2)}`}
                highlight
              />
              <p className="text-xs text-muted mt-1">
                At ${parseFloat(selectedGpu.price_per_hour).toFixed(2)}/hr × {hours}h
              </p>
            </div>
          </div>

          {createMutation.error && (
            <div className="px-3 py-2.5 bg-red-950 border border-red-800 rounded-[6px] text-sm text-red-400">
              {createMutation.error.message}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary">
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext}
            className="btn-primary"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleDeploy}
            disabled={createMutation.isPending || !selectedGpu || !selectedKey}
            className="btn-primary"
          >
            {createMutation.isPending ? 'Deploying...' : 'Deploy GPU'}
          </button>
        )}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted">{label}</span>
      <span className={['text-sm font-medium font-mono', highlight ? 'text-gold' : 'text-neural-fog'].join(' ')}>
        {value}
      </span>
    </div>
  )
}
