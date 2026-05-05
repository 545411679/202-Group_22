export const auth = {
  get token()       { return localStorage.getItem('token') },
  get role()        { return localStorage.getItem('role') },
  get userId()      { return localStorage.getItem('userId') },
  get specialistId(){ return localStorage.getItem('specialistId') },
  get userName()    { return localStorage.getItem('userName') },
  get isLoggedIn()  { return !!localStorage.getItem('token') },

  login(data) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('userId', data.userId)
    localStorage.setItem('userName', data.name || data.userName || '')
    if (data.specialistId) localStorage.setItem('specialistId', data.specialistId)
  },

  logout() { localStorage.clear() },

  roleHome() {
    const r = this.role
    if (r === 'ADMIN')      return '#/admin/dashboard'
    if (r === 'SPECIALIST') return '#/specialist/dashboard'
    return '#/customer/dashboard'
  }
}
