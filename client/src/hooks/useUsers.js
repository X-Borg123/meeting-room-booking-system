import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  USERS_QUERY_KEY,
  invalidateBookingQueries,
  removeDeletedUserFromBookingCaches,
} from '../lib/queryInvalidations'

export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: () => api.get('/api/users', { params }).then((r) => r.data),
  })
}

export const useUserStats = () => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, 'stats'],
    queryFn: () => api.get('/api/users/stats').then((r) => r.data.data),
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/users', data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success('User created successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create user')
    },
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) =>
      api.patch(`/api/users/${id}/role`, { role }).then((r) => r.data.data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
        invalidateBookingQueries(queryClient),
      ])
      toast.success('Role updated')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update role')
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/users/${id}`),
    onSuccess: async (_, userId) => {
      queryClient.setQueryData(USERS_QUERY_KEY, (current = []) =>
        current.filter((user) => user._id !== userId)
      )
      removeDeletedUserFromBookingCaches(queryClient, userId)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
        invalidateBookingQueries(queryClient),
      ])
      toast.success('User deleted')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    },
  })
}
