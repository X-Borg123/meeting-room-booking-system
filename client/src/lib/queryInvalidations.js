export const BOOKINGS_QUERY_KEY = ['bookings']
export const GROUPED_BOOKINGS_QUERY_KEY = ['bookings', 'grouped']
export const SUMMARY_QUERY_KEY = ['summary']
export const USERS_QUERY_KEY = ['users']
export const BOOKING_STATS_QUERY_KEY = ['bookings', 'stats']

export const invalidateBookingQueries = (queryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: GROUPED_BOOKINGS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: SUMMARY_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: BOOKING_STATS_QUERY_KEY }),
  ])

export const removeDeletedUserFromBookingCaches = (queryClient) =>
  invalidateBookingQueries(queryClient)
