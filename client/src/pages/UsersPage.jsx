import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  useUsers,
  useUserStats,
  useCreateUser,
  useUpdateRole,
  useDeleteUser,
} from '../hooks/useUsers'
import CreateUserDialog from '../components/users/CreateUserDialog'
import RoleBadge from '../components/common/RoleBadge'
import StatCard from '../components/common/StatCard'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import ConfirmDialog from '../components/common/ConfirmDialog'
import TableSectionHeader from '../components/common/TableSectionHeader'
import TablePagination from '../components/common/TablePagination'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROLE_LABELS } from '@/lib/constants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Users2, Shield, Crown, Trash2, Search } from 'lucide-react'
import RoleTabsFilter from '../components/common/RoleTabsFilter'

const USER_ROLE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'owner', label: 'Owner' },
  { value: 'user', label: 'User' },
]

const UsersPage = () => {
  const ITEMS_PER_PAGE = 10
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('all')
  const [pendingRoleChange, setPendingRoleChange] = useState(null)
  const { data: stats } = useUserStats()
  const { data, isLoading } = useUsers({
    page,
    limit: ITEMS_PER_PAGE,
    search,
    ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
  })
  const createMutation = useCreateUser()
  const updateRoleMutation = useUpdateRole()
  const deleteMutation = useDeleteUser()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const users = data?.data ?? []
  const meta = data?.meta

  useEffect(() => {
    setPage(1)
  }, [search, roleFilter])

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget._id)
      setDeleteTarget(null)
    }
  }

  const handleConfirmRoleChange = async () => {
    if (pendingRoleChange) {
      await updateRoleMutation.mutateAsync({
        id: pendingRoleChange.id,
        role: pendingRoleChange.nextRole,
      })
      setPendingRoleChange(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage system users and roles
          </p>
        </div>
        <CreateUserDialog
          onSubmit={createMutation.mutateAsync}
          loading={createMutation.isPending}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users2} label="Total Users" value={stats?.total ?? 0} />
        <StatCard
          icon={Shield}
          label="Admins"
          value={stats?.admins ?? 0}
        />
        <StatCard
          icon={Crown}
          label="Owners"
          value={stats?.owners ?? 0}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <TableSectionHeader
            title="All Users"
            count={meta?.totalItems ?? users.length}
            countLabel="users"
            filters={
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <RoleTabsFilter
                  value={roleFilter}
                  onValueChange={setRoleFilter}
                  options={USER_ROLE_OPTIONS}
                />
                <div className="relative w-full sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            }
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              {search || roleFilter !== 'all' ? 'No users found' : 'No users available'}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Change Role</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u, index) => (
                    <TableRow key={u._id}>
                      <TableCell className="text-sm text-slate-500">
                        {((meta?.page ?? page) - 1) * (meta?.limit ?? ITEMS_PER_PAGE) + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {u.name}
                        {u._id === currentUser.id && (
                          <span className="ml-2 text-xs text-slate-400">(you)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={u.role} />
                      </TableCell>
                      <TableCell>
                        {u._id !== currentUser.id && (
                          <Select
                            value={u.role}
                            onValueChange={(val) =>
                              setPendingRoleChange({
                                id: u._id,
                                name: u.name,
                                currentRole: u.role,
                                nextRole: val,
                              })
                            }
                          >
                            <SelectTrigger className="w-28 h-8">
                              {ROLE_LABELS[u.role] || u.role}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {u._id !== currentUser.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() => setDeleteTarget(u)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <TablePagination
                page={meta?.page ?? page}
                setPage={setPage}
                totalItems={meta?.totalItems ?? users.length}
                itemsPerPage={meta?.limit ?? ITEMS_PER_PAGE}
                itemLabel="users"
              />
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All their bookings will also be removed. This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={!!pendingRoleChange}
        onOpenChange={() => setPendingRoleChange(null)}
        title="Change Role"
        description={
          pendingRoleChange
            ? `Change "${pendingRoleChange.name}" from ${ROLE_LABELS[pendingRoleChange.currentRole]} to ${ROLE_LABELS[pendingRoleChange.nextRole]}? Existing bookings will be kept, but admins cannot create new bookings.`
            : ''
        }
        onConfirm={handleConfirmRoleChange}
        loading={updateRoleMutation.isPending}
      />
    </div>
  )
}

export default UsersPage
