export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['admin', 'owner', 'user'] },
  { path: '/bookings', label: 'Bookings', icon: 'Calendar', roles: ['admin', 'owner', 'user'] },
  { path: '/summary', label: 'Summary', icon: 'BarChart3', roles: ['owner'] },
  { path: '/users', label: 'Users', icon: 'Users2', roles: ['admin'] },
]

export const ROLE_LABELS = {
  admin: 'Admin',
  owner: 'Owner',
  user: 'User',
}

export const ROLE_CONFIG = {
  admin: { label: ROLE_LABELS.admin, color: 'bg-green-100 text-green-700 border-green-200' },
  owner: { label: ROLE_LABELS.owner, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  user: { label: ROLE_LABELS.user, color: 'bg-blue-100 text-blue-700 border-blue-200' },
}
