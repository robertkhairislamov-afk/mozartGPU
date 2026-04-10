import { FormEvent, useState } from 'react'
import { useAddSshKey, useDeleteSshKey, useSshKeys } from '@/hooks/useSshKeys'
import type { SshKey } from '@/lib/types'

function AddKeyModal({
  onClose,
}: {
  onClose: () => void
}) {
  const addMutation = useAddSshKey()
  const [name, setName] = useState('')
  const [publicKey, setPublicKey] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    addMutation.mutate(
      { name: name.trim(), public_key: publicKey.trim() },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-neural-fog">Add SSH Key</h2>
          <button onClick={onClose} className="text-muted hover:text-neural-fog text-xl leading-none">
            ×
          </button>
        </div>

        {addMutation.error && (
          <div className="mb-4 px-3 py-2.5 bg-red-950 border border-red-800 rounded-[6px] text-sm text-red-400">
            {addMutation.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Key Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. MacBook Pro"
              maxLength={100}
            />
          </div>
          <div>
            <label className="label">Public Key</label>
            <textarea
              required
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="input font-mono text-xs resize-none h-28"
              placeholder="ssh-rsa AAAA… or ssh-ed25519 AAAA…"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="btn-primary flex-1"
            >
              {addMutation.isPending ? 'Adding...' : 'Add Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SshKeys() {
  const { data: keys, isLoading, error } = useSshKeys()
  const deleteMutation = useDeleteSshKey()
  const [showModal, setShowModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<SshKey | null>(null)

  const handleDelete = (key: SshKey) => {
    deleteMutation.mutate(key.id, {
      onSuccess: () => setConfirmDelete(null),
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">SSH Keys</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          Add Key
        </button>
      </div>

      <p className="text-sm text-muted">
        SSH keys are used to access your GPU instances. Add your public key before launching an instance.
      </p>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-10 text-center text-muted text-sm">Loading...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-400 text-sm">Failed to load SSH keys.</div>
        ) : !keys || keys.length === 0 ? (
          <div className="py-10 text-center text-muted text-sm">
            No SSH keys yet.{' '}
            <button onClick={() => setShowModal(true)} className="text-gold hover:underline">
              Add your first key
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Fingerprint</th>
                  <th className="hidden sm:table-cell">Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className="font-medium text-sm">{key.name}</td>
                    <td className="font-mono text-xs text-muted max-w-[160px] truncate">
                      {key.fingerprint}
                    </td>
                    <td className="hidden sm:table-cell text-xs text-muted">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => setConfirmDelete(key)}
                        className="text-xs text-red-500 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add key modal */}
      {showModal && <AddKeyModal onClose={() => setShowModal(false)} />}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="card w-full max-w-sm">
            <h2 className="text-base font-semibold text-neural-fog mb-2">Delete SSH key?</h2>
            <p className="text-sm text-muted mb-1">
              Key: <span className="text-neural-fog font-medium">{confirmDelete.name}</span>
            </p>
            <p className="text-xs text-muted mb-5">
              Any running instances that use this key will continue to work. You won't be able to
              launch new instances with it.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleteMutation.isPending}
                className="btn-danger flex-1"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
            {deleteMutation.error && (
              <p className="text-xs text-red-400 mt-3">{deleteMutation.error.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
