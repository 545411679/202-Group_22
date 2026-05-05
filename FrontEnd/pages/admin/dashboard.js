import { renderLayout, toast } from '/app.js'
import { adminApi } from '/api.js'

export function render(app) {
  renderLayout('Admin Dashboard', container => {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading...</div>'
    Promise.all([
      adminApi.getUsers({}).catch(() => []),
      adminApi.getBookings({}).catch(() => []),
      adminApi.getPendingProfiles().catch(() => []),
    ]).then(([usersData, bookingsData, pendingData]) => {
      const users    = Array.isArray(usersData)    ? usersData    : usersData?.content    || []
      const bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData?.content || []
      const pending  = Array.isArray(pendingData)  ? pendingData  : pendingData?.content  || []
      const clients     = users.filter(u => u.role === 'CLIENT' || u.role === 'CUSTOMER').length
      const specialists = users.filter(u => u.role === 'SPECIALIST').length
      const confirmed   = bookings.filter(b => b.status === 'CONFIRMED').length
      const completed   = bookings.filter(b => b.status === 'COMPLETED').length
      container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:20px">
          ${[
            { label: 'Total users',        value: users.length,   icon: '👥' },
            { label: 'Customers',          value: clients,        icon: '🙋' },
            { label: 'Specialists',        value: specialists,    icon: '👨‍⚕️' },
            { label: 'Pending approvals',  value: pending.length, icon: '⏳' },
            { label: 'Active sessions',    value: confirmed,      icon: '📅' },
            { label: 'Completed sessions', value: completed,      icon: '✅' },
          ].map(s => `
            <div class="card" style="text-align:center;margin-bottom:0">
              <div style="font-size:28px;margin-bottom:8px">${s.icon}</div>
              <div style="font-size:28px;font-weight:800;color:#e8722a">${s.value}</div>
              <div class="text-muted text-sm">${s.label}</div>
            </div>
          `).join('')}
        </div>
        ${pending.length > 0 ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title">Pending profile approvals</div>
              <a href="#/admin/profiles" class="btn btn-primary btn-sm">View all</a>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Specialty</th><th>Fee (¥)</th><th></th></tr></thead>
                <tbody>
                  ${pending.slice(0,5).map(p => `<tr>
                    <td>${p.name||'—'}</td>
                    <td>${p.specialty||'—'}</td>
                    <td>${p.fee??'—'}</td>
                    <td><a class="btn btn-text btn-sm" href="#/admin/profiles">Review →</a></td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
        <div class="card">
          <div class="card-header"><div class="card-title">Quick links</div></div>
          <div class="flex gap-8" style="flex-wrap:wrap">
            <a href="#/admin/users"         class="btn btn-secondary">👥 Manage users</a>
            <a href="#/admin/sessions"      class="btn btn-secondary">📋 View sessions</a>
            <a href="#/admin/categories"    class="btn btn-secondary">🏷️ Categories</a>
            <a href="#/admin/announcements" class="btn btn-secondary">📢 Announcements</a>
          </div>
        </div>
      `
    }).catch(() => { container.innerHTML = '<div class="empty">Failed to load dashboard.</div>' })
  })
}
