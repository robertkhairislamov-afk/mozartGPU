import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setValidationError('Passwords do not match')
      return
    }

    register.mutate({ email, password })
  }

  const errorMsg = validationError ?? register.error?.message ?? null

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-gold font-bold tracking-[0.3em] text-2xl uppercase">MOZART</span>
          <p className="text-muted text-sm mt-2">GPU Rental Console</p>
        </div>

        <div className="card">
          <h1 className="text-lg font-semibold text-neural-fog mb-6">Create account</h1>

          {errorMsg && (
            <div className="mb-4 px-3 py-2.5 bg-red-950 border border-red-800 rounded-[6px] text-sm text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="label">Confirm password</label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={register.isPending}
              className="btn-primary w-full mt-2"
            >
              {register.isPending ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold hover:text-gold-dim transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
