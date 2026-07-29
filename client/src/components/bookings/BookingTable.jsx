import { useState } from 'react'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getBookingStatus } from '@/lib/bookingStatus'
import RoleBadge from '../common/RoleBadge'
import ConfirmDialog from '../common/ConfirmDialog'
import { Trash2 } from 'lucide-react'

const getDuration = (start, end) => {
  const diff = (new Date(end) - new Date(start)) / 60000
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

const BookingTable = ({ bookings, onDelete, deleting, startIndex = 0 }) => {
  const { user } = useAuth()
  const [deleteTarget, setDeleteTarget] = useState(null)

  const canDelete = (booking) => {
    if (['admin', 'owner'].includes(user.role)) return true
    return booking.userId?._id === user.id
  }

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await onDelete(deleteTarget._id)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No.</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking, index) => {
            const status = getBookingStatus(booking.startTime, booking.endTime)
            return (
              <TableRow key={booking._id}>
                <TableCell className="text-sm text-slate-500">
                  {startIndex + index + 1}
                </TableCell>
                <TableCell className="font-medium">{booking.title}</TableCell>
                <TableCell className="text-sm">{booking.userId?.name || '-'}</TableCell>
                <TableCell>
                  {booking.userId?.role ? <RoleBadge role={booking.userId.role} /> : '-'}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {format(new Date(booking.startTime), 'MMM d, yyyy h:mm a')}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {format(new Date(booking.endTime), 'MMM d, yyyy h:mm a')}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getDuration(booking.startTime, booking.endTime)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={status.className}>{status.label}</Badge>
                </TableCell>
                <TableCell>
                  {canDelete(booking) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600"
                      onClick={() => setDeleteTarget(booking)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Booking"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </>
  )
}

export default BookingTable
