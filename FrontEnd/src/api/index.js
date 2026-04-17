import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || ''
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
      if (!isAuthEndpoint) {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register:       data => api.post('/auth/register', data),
  login:          data => api.post('/auth/login', data),
  logout:         ()   => api.post('/auth/logout'),
  changePassword: data => api.patch('/auth/password', data)
}

export const specialistApi = {
  search:          params => api.get('/specialists/search', { params }),
  getPublicProfile: id    => api.get(`/specialists/profile/${id}`),
  getSchedule:     id    => api.get(`/specialists/${id}/schedule`),
  getOwnProfile:   ()    => api.get('/specialists/profile'),
  createProfile:   data  => api.post('/specialists/profile', data),
  updateProfile:   data  => api.patch('/specialists/profile', data),
  updateStatus:    data  => api.patch('/specialists/profile/status', data),
  getSlots:        ()    => api.get('/specialists/slots'),
  addSlot:         data  => api.post('/specialists/slots', data),
  markUnavailable: id    => api.patch(`/specialists/slots/${id}/unavailable`),
  markAvailable:   id    => api.patch(`/specialists/slots/${id}/available`),
  deleteSlot:      id    => api.delete(`/specialists/slots/${id}`),
  getBookings:     params => api.get('/specialists/bookings', { params })
}

export const bookingApi = {
  create:       data       => api.post('/bookings', data),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data)
}

export const dashboardApi = {
  getAppointments: params => api.get('/dashboard/appointments', { params }),
  getAppointment:  id     => api.get(`/dashboard/appointments/${id}`)
}

export const categoryApi = {
  getAll: () => api.get('/categories')
}

export const adminApi = {
  getUsers:           params     => api.get('/admin/users', { params }),
  getUserDetail:      id         => api.get(`/admin/users/${id}`),
  updateUserStatus:   (id, data) => api.patch(`/admin/users/${id}/status`, data),
  getPendingProfiles: ()         => api.get('/admin/specialists/pending'),
  reviewProfile:      (id, data) => api.put(`/admin/specialists/profile/${id}/review`, data),
  getBookings:        params     => api.get('/admin/bookings', { params }),
  getLogs:            params     => api.get('/admin/logs', { params }),
  getAnnouncements:   ()         => api.get('/admin/announcements'),
  createAnnouncement: data       => api.post('/admin/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: id         => api.delete(`/admin/announcements/${id}`),
  getCategories:      ()         => api.get('/admin/categories'),
  createCategory:     data       => api.post('/admin/categories', data),
  updateCategory:     (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory:     id         => api.delete(`/admin/categories/${id}`)
}
