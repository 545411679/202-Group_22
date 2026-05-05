import { auth } from '/auth.js'

async function request(method, url, body, params) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`

  let fullUrl = url
  if (params) {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v != null && v !== '')))
    if ([...q].length) fullUrl += '?' + q.toString()
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined
  })

  const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')

  if (!isAuthEndpoint && (res.status === 401 || res.status === 403)) {
    let errorBody = null
    try { const text = await res.text(); if (text) errorBody = JSON.parse(text) } catch {}
    if (!errorBody) {
      // Empty body = Spring Security blocked request (missing/invalid/expired token)
      auth.logout()
      location.hash = '#/login'
      return
    }
    throw new Error(errorBody.message || `Error ${res.status}`)
  }

  if (!res.ok) {
    let msg = `Error ${res.status}`
    try { const j = await res.json(); msg = j.message || j.error || msg } catch {}
    throw new Error(msg)
  }

  if (res.status === 204) return null
  try { return await res.json() } catch { return null }
}

const get  = (url, params) => request('GET', url, null, params)
const post = (url, body)   => request('POST', url, body)
const put  = (url, body)   => request('PUT', url, body)
const patch= (url, body)   => request('PATCH', url, body)
const del  = (url)         => request('DELETE', url)

export const authApi = {
  register:       data => post('/api/auth/register', data),
  login:          data => post('/api/auth/login', data),
  logout:         ()   => post('/api/auth/logout'),
  changePassword: data => patch('/api/auth/password', data),
  updateProfile:  data => patch('/api/auth/profile', data),
  me:             ()   => get('/api/auth/me')
}

export const specialistApi = {
  search:          params => get('/api/specialists/search', params),
  getPublicProfile: id    => get(`/api/specialists/profile/${id}`),
  getSchedule:     id    => get(`/api/specialists/${id}/schedule`),
  getOwnProfile:   ()    => get('/api/specialists/profile'),
  createProfile:   data  => post('/api/specialists/profile', data),
  updateProfile:   data  => patch('/api/specialists/profile', data),
  getSlots:        ()    => get('/api/specialists/slots'),
  addSlot:         data  => post('/api/specialists/slots', data),
  markUnavailable: id    => patch(`/api/specialists/slots/${id}/unavailable`),
  markAvailable:   id    => patch(`/api/specialists/slots/${id}/available`),
  deleteSlot:      id    => del(`/api/specialists/slots/${id}`),
  getBookings:     params => get('/api/specialists/bookings', params),
  updateStatus:    data  => patch('/api/specialists/profile/status', data)
}

export const bookingApi = {
  create:       data       => post('/api/bookings', data),
  updateStatus: (id, data) => patch(`/api/bookings/${id}/status`, data)
}

export const dashboardApi = {
  getAppointments: params => get('/api/dashboard/appointments', params),
  getAppointment:  id     => get(`/api/dashboard/appointments/${id}`)
}

export const categoryApi = {
  getAll: () => get('/api/categories')
}

export const fileApi = {
  upload: async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const headers = {}
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`
    const res = await fetch('/api/files/upload', { method: 'POST', headers, body: fd })
    if (!res.ok) {
      let msg = `Upload failed (${res.status})`
      try { const j = await res.json(); msg = j.message || j.error || msg } catch {}
      throw new Error(msg)
    }
    return res.json()
  },
  url: (filename) => `/api/files/${encodeURIComponent(filename)}`
}

export const announcementApi = {
  getMine:   ()   => get('/api/announcements/me'),
  markRead:  (id) => post(`/api/announcements/${id}/read`)
}

export const reviewApi = {
  getRecentReviews:    ()           => get('/api/reviews/recent'),
  submitReview:        (id, data)   => post(`/api/reviews/booking/${id}`, data),
  adminGetAll:         ()           => get('/api/admin/reviews'),
  adminSetVisibility:  (id, visible) => patch(`/api/admin/reviews/${id}/visibility`, { visible })
}

export const adminApi = {
  getBookings:        params     => get('/api/admin/bookings', params),
  getUsers:           params     => get('/api/admin/users', params),
  getUserDetail:      id         => get(`/api/admin/users/${id}`),
  updateUserStatus:   (id, data) => patch(`/api/admin/users/${id}/status`, data),
  getPendingProfiles:     ()         => get('/api/admin/specialists/pending'),
  approveProfile:         id         => put(`/api/admin/specialists/profile/${id}/review`, { action: 'APPROVE' }),
  rejectProfile:          (id, reason) => put(`/api/admin/specialists/profile/${id}/review`, { action: 'REJECT', reason }),
  getPendingSpecialists:  ()         => get('/api/admin/specialists/pending'),
  reviewSpecialist:       (id, data) => put(`/api/admin/specialists/profile/${id}/review`, data),
  getLogs:                params     => get('/api/admin/logs', params),
  getAnnouncements:   ()         => get('/api/admin/announcements'),
  createAnnouncement: data       => post('/api/admin/announcements', data),
  updateAnnouncement: (id, data) => put(`/api/admin/announcements/${id}`, data),
  deleteAnnouncement: id         => del(`/api/admin/announcements/${id}`),
  getCategories:      ()         => get('/api/admin/categories'),
  createCategory:     data       => post('/api/admin/categories', data),
  updateCategory:     (id, data) => put(`/api/admin/categories/${id}`, data),
  deleteCategory:     id         => del(`/api/admin/categories/${id}`)
}
