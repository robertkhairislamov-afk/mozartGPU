import { useAuth } from '@/hooks/useAuth'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-20 lg:pb-0">
      <h1 className="page-title">Settings</h1>

      {/* Profile */}
      <div className="card space-y-4">
        <p className="section-title">Profile</p>

        <div>
          <label className="label">Email</label>
          <input
            type="email"
            readOnly
            value={user?.email ?? ''}
            className="input opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-muted mt-1">
            Email changes are not yet supported in the console.
          </p>
        </div>

        <div>
          <label className="label">Account ID</label>
          <input
            type="text"
            readOnly
            value={user?.id ?? ''}
            className="input font-mono text-xs opacity-60 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="label">Member Since</label>
          <input
            type="text"
            readOnly
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : ''}
            className="input opacity-60 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="label">Account Status</label>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={[
                'w-2 h-2 rounded-full',
                user?.is_active ? 'bg-running' : 'bg-red-500',
              ].join(' ')}
            />
            <span className="text-sm text-neural-fog">
              {user?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-900">
        <p className="section-title text-red-500">Danger Zone</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neural-fog">Delete Account</p>
            <p className="text-xs text-muted mt-1">
              Permanently remove your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <button
            disabled
            className="btn-danger shrink-0 opacity-40 cursor-not-allowed"
            title="Coming soon — contact support to delete your account"
          >
            Delete Account
          </button>
        </div>
        <p className="text-xs text-muted mt-3">
          To delete your account, please contact{' '}
          <a href="mailto:support@mozartgpu.com" className="text-gold hover:underline">
            support@mozartgpu.com
          </a>
        </p>
      </div>
    </div>
  )
}
