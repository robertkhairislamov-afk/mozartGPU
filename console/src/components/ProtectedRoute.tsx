import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAuthenticated } from '@/lib/auth'

interface Props {
  children?: React.ReactNode
}

/**
 * Guards authenticated routes.
 * When used as a layout route wrapper (no children), renders <Outlet />.
 * When used with an explicit child, renders that child.
 */
export default function ProtectedRoute({ children }: Props) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
