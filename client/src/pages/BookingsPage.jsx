import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBookings, useCreateBooking, useDeleteBooking } from '../hooks/useBookings'
import BookingForm from '../components/bookings/BookingForm'
import BookingTable from '../components/bookings/BookingTable'
import EmptyState from '../components/common/EmptyState'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import RoleTabsFilter from '../components/common/RoleTabsFilter'
import TableSectionHeader from '../components/common/TableSectionHeader'
import TablePagination from '../components/common/TablePagination'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar, Search } from 'lucide-react'

const BOOKING_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
]

const BookingsPage = () => {
  const ITEMS_PER_PAGE = 10
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const { user } = useAuth()
  const { data, isLoading } = useBookings({
    page,
    limit: ITEMS_PER_PAGE,
    search,
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  })
  const createMutation = useCreateBooking()
  const deleteMutation = useDeleteBooking()
  const canCreateBooking = ['owner', 'user'].includes(user?.role)
  const bookings = data?.data ?? []
  const meta = data?.meta

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-800">Bookings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage meeting room bookings
          </p>
        </div>
        {canCreateBooking && (
          <BookingForm
            onSubmit={createMutation.mutateAsync}
            loading={createMutation.isPending}
          />
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <TableSectionHeader
            title="All Bookings"
            count={meta?.totalItems ?? bookings.length}
            countLabel="bookings"
            filters={
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <RoleTabsFilter
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={BOOKING_STATUS_OPTIONS}
                />
                <div className="relative w-full sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    placeholder="Search bookings..."
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
            <LoadingSkeleton rows={6} />
          ) : bookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No bookings found"
              description={
                search || statusFilter !== 'all'
                  ? 'Try a different search term'
                  : 'Create your first booking to get started'
              }
            />
          ) : (
            <>
              <BookingTable
                bookings={bookings}
                onDelete={deleteMutation.mutateAsync}
                deleting={deleteMutation.isPending}
                startIndex={((meta?.page ?? page) - 1) * (meta?.limit ?? ITEMS_PER_PAGE)}
              />
              <TablePagination
                page={meta?.page ?? page}
                setPage={setPage}
                totalItems={meta?.totalItems ?? bookings.length}
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

export default BookingsPage
