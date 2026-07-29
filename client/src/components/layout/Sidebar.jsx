import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { NAV_ITEMS } from '../../lib/constants'
import RoleBadge from '../common/RoleBadge'
import ConfirmDialog from '../common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users2,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

const iconMap = { LayoutDashboard, Calendar, BarChart3, Users2 }

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role)
  )

  return (
    <aside
      className={`sticky top-0 hidden min-h-screen self-start md:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className="border-b border-slate-100">
        {collapsed ? (
          <div className="flex items-center justify-center px-2 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setCollapsed(false)}
            >
              <PanelLeft size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex h-14 items-center justify-between px-3">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src="/icon.webp"
                alt="Meeting Room"
                className="h-8 w-8 rounded-lg object-cover shrink-0"
              />
              <span className="font-semibold text-slate-800 text-sm truncate">
                Meeting Room
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg"
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftClose size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon]
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path}>
              <div
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-100 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {user?.name}
              </p>
              <RoleBadge role={user?.role} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut size={16} />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut size={16} />
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Logout"
        description="Are you sure you want to log out?"
        onConfirm={logout}
      />
    </aside>
  )
}

export default Sidebar
