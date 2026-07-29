export const getBookingStatus = (startTime, endTime) => {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (end < now) {
    return { label: 'Past', className: 'bg-slate-100 text-slate-600' }
  }

  if (start <= now && end >= now) {
    return { label: 'Active', className: 'bg-green-100 text-green-700' }
  }

  return { label: 'Upcoming', className: 'bg-blue-100 text-blue-700' }
}
