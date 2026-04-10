import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center space-y-5">
        <div>
          <span className="text-gold font-bold tracking-[0.3em] text-xl uppercase">MOZART</span>
        </div>
        <div>
          <p className="text-7xl font-bold font-mono text-[#2a2a2a] leading-none">404</p>
          <p className="text-xl font-semibold text-neural-fog mt-3">Page not found</p>
          <p className="text-muted text-sm mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link to="/dashboard" className="btn-primary inline-flex">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
