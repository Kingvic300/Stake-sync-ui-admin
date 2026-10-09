import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { AdminAuthProvider } from './auth/AdminAuthProvider'
import { RequireAdmin } from './auth/RequireAdmin'
import { RequireRole } from './auth/RequireRole'
import { LOG_ROLES } from './auth/roles'
import { AppPageSkeleton, AuthSkeleton, ListPageSkeleton } from './components/Skeleton'
import './index.css'
import { AdminShell } from './layouts/AdminShell'
import { lazyPage } from './lib/lazyPage'
import { NotFound, RouteError } from './pages/Status'
import { AdminStoreProvider } from './state/AdminStoreProvider'
import { ToastProvider } from './toast/ToastProvider'

const router = createBrowserRouter([
  { path: '/login', element: lazyPage(() => import('./pages/Login'), 'Login', <AuthSkeleton />), errorElement: <RouteError /> },
  {
    element: <RequireAdmin />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AdminShell />,
        children: [
          { index: true, element: lazyPage(() => import('./pages/Overview'), 'Overview', <AppPageSkeleton />) },
          { path: 'disputes', element: lazyPage(() => import('./pages/Disputes'), 'Disputes', <ListPageSkeleton />) },
          { path: 'reviews', element: lazyPage(() => import('./pages/Reviews'), 'Reviews', <ListPageSkeleton />) },
          { path: 'risk', element: lazyPage(() => import('./pages/Risk'), 'Risk', <ListPageSkeleton />) },
          { path: 'reports', element: lazyPage(() => import('./pages/Reports'), 'Reports', <ListPageSkeleton />) },
          { path: 'approvals', element: lazyPage(() => import('./pages/Approvals'), 'Approvals', <ListPageSkeleton />) },
          { path: 'users', element: lazyPage(() => import('./pages/Users'), 'Users', <ListPageSkeleton />) },
          { path: 'challenges', element: lazyPage(() => import('./pages/Challenges'), 'Challenges', <ListPageSkeleton />) },
          { path: 'organizations', element: lazyPage(() => import('./pages/Orgs'), 'Orgs', <ListPageSkeleton />) },
          { path: 'health', element: lazyPage(() => import('./pages/Health'), 'Health', <AppPageSkeleton />) },
          { path: 'escrow', element: lazyPage(() => import('./pages/Escrow'), 'Escrow', <AppPageSkeleton />) },
          { path: 'audit', element: lazyPage(() => import('./pages/Audit'), 'Audit', <ListPageSkeleton />) },
          { path: 'logs', element: <RequireRole roles={LOG_ROLES}>{lazyPage(() => import('./pages/ServerLog'), 'ServerLog', <ListPageSkeleton />)}</RequireRole> },
          { path: 'errors', element: <RequireRole roles={LOG_ROLES}>{lazyPage(() => import('./pages/ErrorLog'), 'ErrorLog', <ListPageSkeleton />)}</RequireRole> },
          { path: 'team', element: lazyPage(() => import('./pages/Team'), 'Team', <ListPageSkeleton />) },
          { path: 'settings', element: lazyPage(() => import('./pages/Settings'), 'Settings', <AppPageSkeleton />) },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminAuthProvider>
      <AdminStoreProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AdminStoreProvider>
    </AdminAuthProvider>
  </StrictMode>,
)
