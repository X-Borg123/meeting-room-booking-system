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
  Menu,
  X,
} from 'lucide-react'

const iconMap = { LayoutDashboard, Calendar, BarChart3, Users2 }

const MobileNav = () => {
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role)
  )

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/icon.webp"
            alt="Meeting Room"
            className="h-8 w-8 rounded-lg object-cover shrink-0"
          />
          <span className="font-semibold text-slate-800 text-sm truncate">Meeting Room</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-14 left-0 right-0 bg-white border-b border-slate-200 z-50 p-4 space-y-2">
            {visibleItems.map((item) => {
              const Icon = iconMap[item.icon]
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              )
            })}
            <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <RoleBadge role={user?.role} />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLogoutOpen(true)}>
                <LogOut size={16} className="mr-1 text-red-500 hover:text-red-600" /> <span className='text-red-500 hover:text-red-600'>Logout</span>
              </Button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Logout"
        description="Are you sure you want to log out?"
        onConfirm={logout}
      />
    </div>
  )
}

export default MobileNav
