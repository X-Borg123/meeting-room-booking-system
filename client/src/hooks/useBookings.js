import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  BOOKING_STATS_QUERY_KEY,
  BOOKINGS_QUERY_KEY,
  invalidateBookingQueries,
} from '../lib/queryInvalidations'

export const useBookings = (params = {}) => {
  return useQuery({
    queryKey: [...BOOKINGS_QUERY_KEY, params],
    queryFn: () => api.get('/api/bookings', { params }).then((r) => r.data),
  })
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: BOOKING_STATS_QUERY_KEY,
    queryFn: () => api.get('/api/bookings/stats').then((r) => r.data.data),
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/bookings', data).then((r) => r.data.data),
    onSuccess: async () => {
      await invalidateBookingQueries(queryClient)
      toast.success('Booking created successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create booking')
    },
  })
}

export const useDeleteBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/bookings/${id}`),
    onSuccess: async () => {
      await invalidateBookingQueries(queryClient)
      toast.success('Booking deleted')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete booking')
    },
  })
}
