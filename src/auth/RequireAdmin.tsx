import { Navigate, Outlet, useLocation } from 'react-router'
import { useAdminAuth } from './context'

export function RequireAdmin() {
  const { session } = useAdminAuth()
  const location = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
