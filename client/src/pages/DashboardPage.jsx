import { format } from 'date-fns'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBookings, useDashboardStats } from '../hooks/useBookings'
import StatCard from '../components/common/StatCard'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import RoleBadge from '../components/common/RoleBadge'
import TableSectionHeader from '../components/common/TableSectionHeader'
import TablePagination from '../components/common/TablePagination'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getBookingStatus } from '@/lib/bookingStatus'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar, Clock, Sun, User } from 'lucide-react'

const DashboardPage = () => {
  const ITEMS_PER_PAGE = 10
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const { data: stats, isLoading: loadingStats } = useDashboardStats()
  const { data, isLoading: loadingBookings } = useBookings({
    page,
    limit: ITEMS_PER_PAGE,
  })
  const recentBookings = data?.data ?? []
  const meta = data?.meta
  const isLoading = loadingStats || loadingBookings

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Bookings" value={stats?.total ?? 0} />
        <StatCard icon={Sun} label="Today" value={stats?.today ?? 0} />
        <StatCard icon={Clock} label="Upcoming" value={stats?.upcoming ?? 0} />
        <StatCard icon={User} label="My Bookings" value={stats?.mine ?? 0} />
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <TableSectionHeader
            title="Recent Bookings"
            count={meta?.totalItems ?? recentBookings.length}
            countLabel="bookings"
            className="flex flex-row items-center justify-between space-y-0"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : recentBookings.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No bookings yet
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">No.</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Booked By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking, index) => {
                    const status = getBookingStatus(booking.startTime, booking.endTime)
                    return (
                      <TableRow key={booking._id}>
                        <TableCell className="text-sm text-slate-500">
                          {((meta?.page ?? page) - 1) * (meta?.limit ?? ITEMS_PER_PAGE) + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {booking.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{booking.userId?.name}</span>
                            <RoleBadge role={booking.userId?.role} />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {format(new Date(booking.startTime), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.className}>{status.label}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <TablePagination
                page={page}
                setPage={setPage}
                totalItems={meta?.totalItems ?? recentBookings.length}
                itemsPerPage={meta?.limit ?? ITEMS_PER_PAGE}
                itemLabel="bookings"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
