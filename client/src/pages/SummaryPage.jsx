import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useSummary, useGroupedBookings } from '../hooks/useSummary'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import EmptyState from '../components/common/EmptyState'
import RoleBadge from '../components/common/RoleBadge'
import RoleTabsFilter from '../components/common/RoleTabsFilter'
import TableSectionHeader from '../components/common/TableSectionHeader'
import TablePagination from '../components/common/TablePagination'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BarChart3, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const ITEMS_PER_PAGE = 10

const GroupedBookingsTable = ({ bookings }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">No.</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b, index) => (
          <TableRow key={b._id}>
            <TableCell className="text-sm text-slate-500">
              {index + 1}
            </TableCell>
            <TableCell className="text-sm">{b.title}</TableCell>
            <TableCell className="text-sm text-slate-600">
              {format(new Date(b.startTime), 'MMM d, h:mm a')}
            </TableCell>
            <TableCell className="text-sm text-slate-600">
              {format(new Date(b.endTime), 'MMM d, h:mm a')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const SummaryPage = () => {
  const [summaryPage, setSummaryPage] = useState(1)
  const [summarySearch, setSummarySearch] = useState('')
  const [summaryRoleFilter, setSummaryRoleFilter] = useState('all')
  const [groupedPage, setGroupedPage] = useState(1)
  const [groupedSearch, setGroupedSearch] = useState('')
  const [groupedRoleFilter, setGroupedRoleFilter] = useState('all')
  const { data: summaryResponse, isLoading: loadingSummary } = useSummary({
    page: summaryPage,
    limit: ITEMS_PER_PAGE,
    search: summarySearch,
    ...(summaryRoleFilter !== 'all' ? { role: summaryRoleFilter } : {}),
  })
  const { data: groupedResponse, isLoading: loadingGrouped } = useGroupedBookings({
    page: groupedPage,
    limit: ITEMS_PER_PAGE,
    search: groupedSearch,
    ...(groupedRoleFilter !== 'all' ? { role: groupedRoleFilter } : {}),
  })
  const summary = summaryResponse?.data ?? []
  const summaryMeta = summaryResponse?.meta
  const grouped = groupedResponse?.data ?? []
  const groupedMeta = groupedResponse?.meta

  useEffect(() => {
    setSummaryPage(1)
  }, [summarySearch, summaryRoleFilter])

  useEffect(() => {
    setGroupedPage(1)
  }, [groupedSearch, groupedRoleFilter])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Usage Summary</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Booking statistics per user
        </p>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <TableSectionHeader
            title="Bookings Per User"
            count={summaryMeta?.totalItems ?? summary.length}
            countLabel="users"
            filters={
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <RoleTabsFilter
                  value={summaryRoleFilter}
                  onValueChange={setSummaryRoleFilter}
                />
                <div className="relative w-full sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    placeholder="Search users..."
                    value={summarySearch}
                    onChange={(e) => setSummarySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            }
          />
        </CardHeader>
        <CardContent>
          {loadingSummary ? (
            <LoadingSkeleton rows={4} />
          ) : summary.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No summary data"
              description="Create bookings to see usage statistics."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">No.</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Total Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map((s, index) => (
                    <TableRow key={s._id}>
                      <TableCell className="text-sm text-slate-500">
                        {((summaryMeta?.page ?? summaryPage) - 1) * (summaryMeta?.limit ?? ITEMS_PER_PAGE) + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {s.user.name}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={s.user.role} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {s.totalBookings} bookings
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700">
                          {s.totalHours.toFixed(1)} hours
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <TablePagination
                page={summaryMeta?.page ?? summaryPage}
                setPage={setSummaryPage}
                totalItems={summaryMeta?.totalItems ?? summary.length}
                itemsPerPage={summaryMeta?.limit ?? ITEMS_PER_PAGE}
                itemLabel="users"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Grouped */}
      <Card>
        <CardHeader>
          <TableSectionHeader
            title="Bookings Grouped By User"
            count={groupedMeta?.totalItems ?? grouped.length}
            countLabel="users"
            filters={
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <RoleTabsFilter
                  value={groupedRoleFilter}
                  onValueChange={setGroupedRoleFilter}
                />
                <div className="relative w-full sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    placeholder="Search grouped bookings..."
                    value={groupedSearch}
                    onChange={(e) => setGroupedSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            }
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingGrouped ? (
            <LoadingSkeleton rows={6} />
          ) : grouped.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No grouped bookings"
              description="Create bookings to see grouped booking details."
            />
          ) : (
            <>
              {grouped.map((group) => (
                <Card key={group.user._id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                        {group.user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{group.user.name}</CardTitle>
                        <p className="text-xs text-slate-500">{group.user.email}</p>
                      </div>
                      <RoleBadge role={group.user.role} />
                      <Badge variant="secondary" className="ml-auto">
                        {group.bookings.length} bookings
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <GroupedBookingsTable bookings={group.bookings} />
                  </CardContent>
                </Card>
              ))}
              <TablePagination
                page={groupedMeta?.page ?? groupedPage}
                setPage={setGroupedPage}
                totalItems={groupedMeta?.totalItems ?? grouped.length}
                itemsPerPage={groupedMeta?.limit ?? ITEMS_PER_PAGE}
                itemLabel="users"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SummaryPage
