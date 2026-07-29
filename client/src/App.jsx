import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoadingSkeleton from './components/common/LoadingSkeleton'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const BookingsPage = lazy(() => import('./pages/BookingsPage'))
const SummaryPage = lazy(() => import('./pages/SummaryPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const RouteFallback = () => (
  <div className="flex items-center justify-center h-screen bg-slate-50">
    <LoadingSkeleton rows={3} />
  </div>
)

const LazyRoute = ({ children }) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
)

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSkeleton rows={3} />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }

  return children
}

const App = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <LoadingSkeleton rows={3} />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <LazyRoute><LoginPage /></LazyRoute>}
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<LazyRoute><DashboardPage /></LazyRoute>} />
        <Route path="/bookings" element={<LazyRoute><BookingsPage /></LazyRoute>} />
        <Route
          path="/summary"
          element={
            <ProtectedRoute roles={['owner']}>
              <LazyRoute><SummaryPage /></LazyRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <LazyRoute><UsersPage /></LazyRoute>
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<LazyRoute><NotFoundPage /></LazyRoute>} />
    </Routes>
  )
}

export default App
