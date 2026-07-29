import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { GROUPED_BOOKINGS_QUERY_KEY, SUMMARY_QUERY_KEY } from '../lib/queryInvalidations'

export const useSummary = (params = {}) => {
  return useQuery({
    queryKey: [...SUMMARY_QUERY_KEY, params],
    queryFn: () => api.get('/api/bookings/summary', { params }).then((r) => r.data),
  })
}

export const useGroupedBookings = (params = {}) => {
  return useQuery({
    queryKey: [...GROUPED_BOOKINGS_QUERY_KEY, params],
    queryFn: () => api.get('/api/bookings/grouped', { params }).then((r) => r.data),
  })
}
