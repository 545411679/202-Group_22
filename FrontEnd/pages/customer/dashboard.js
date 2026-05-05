import { renderLayout, toast } from '/app.js'
import { dashboardApi, authApi } from '/api.js'
import { renderAnnouncementsCard } from '/pages/shared/announcements-card.js'

function statusTag(s) {
  const map = { PENDING: 'warning', CONFIRMED: 'success', COMPLETED: 'info', CANCELLED: 'danger' }
  return `<span class="tag tag-${map[s]||'info'}">${s}</span>`
}

function renderBanBanner() {
  return `
    <div style="
      background:#fef2f2;
      border:1.5px solid #f87171;
      border-radius:10px;
      padding:16px 20px;
      margin-bottom:20px;
      display:flex;
      align-items:flex-start;
      gap:14px;
    ">
      <div style="font-size:22px;line-height:1">🚫</div>
      <div>
        <div style="font-weight:700;color:#b91c1c;font-size:15px;margin-bottom:4px">Account Suspended</div>
        <div style="color:#7f1d1d;font-size:13px;line-height:1.5">
          Your account has been disabled by a system administrator. You cannot submit new bookings.
          Please contact support if you believe this is a mistake.
        </div>
      </div>
    </div>
  `
}

export function render(app) {
  renderLayout('Dashboard', container => {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading...</div>'
    Promise.all([
      dashboardApi.getAppointments({}),
      authApi.me().catch(() => null)
    ]).then(([data, me]) => {
      const appts = Array.isArray(data) ? data : data?.appointments || data?.content || []
      const upcoming  = appts.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING')
      const completed = appts.filter(a => a.status === 'COMPLETED')
      const isBanned  = me?.status === 'DISABLED' || me?.userStatus === 'DISABLED'

      container.innerHTML = `
        ${isBanned ? renderBanBanner() : ''}
        <div id="announcements-host" style="margin-bottom:20px"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-bottom:20px">
          ${[
            { label: 'Total bookings',    value: appts.length,     icon: '📋' },
            { label: 'Upcoming',          value: upcoming.length,  icon: '📅' },
            { label: 'Completed',         value: completed.length, icon: '✅' },
          ].map(s => `
            <div class="card" style="text-align:center;margin-bottom:0">
              <div style="font-size:28px;margin-bottom:8px">${s.icon}</div>
              <div style="font-size:28px;font-weight:800;color:#e8722a">${s.value}</div>
              <div class="text-muted text-sm">${s.label}</div>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">My Sessions</div>
            ${isBanned
              ? `<span class="tag tag-danger" style="font-size:12px">Booking disabled</span>`
              : `<a href="#/customer/search" class="btn btn-primary btn-sm">+ Book new</a>`
            }
          </div>
          ${!appts.length ? '<div class="empty">No sessions yet. <a href="#/customer/search">Find a specialist</a></div>' : `
            <div class="table-wrap">
              <table>
                <thead><tr><th>Specialist</th><th>Date / Time</th><th>Fee</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  ${appts.slice(0,10).map(a => `<tr>
                    <td>${a.specialistName||'—'}</td>
                    <td>${a.scheduledTime ? new Date(a.scheduledTime).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                    <td>${a.feeAmount != null ? '¥'+a.feeAmount : '—'}</td>
                    <td>${statusTag(a.status)}</td>
                    <td><a class="btn btn-text btn-sm" href="#/customer/sessions/${a.bookingId||a.id}">View</a></td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `
      renderAnnouncementsCard(document.getElementById('announcements-host'))
    }).catch(() => { container.innerHTML = '<div class="empty">Failed to load dashboard.</div>' })
  })
}