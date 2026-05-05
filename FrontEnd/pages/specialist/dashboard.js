import { renderLayout, toast } from '/app.js'
import { specialistApi, authApi } from '/api.js'
import { SPECIALIST_STATUS, bookingStatusTagHtml } from '/status.js'
import { renderAnnouncementsCard } from '/pages/shared/announcements-card.js'

function statusTag(s) {
  return bookingStatusTagHtml(s)
}

function renderAccountBanBanner() {
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
          Your account has been disabled by a system administrator.
          You cannot add slots or manage session requests while suspended.
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
      specialistApi.getBookings({}).catch(() => []),
      specialistApi.getSlots().catch(() => []),
      specialistApi.getOwnProfile().catch(() => null),
      authApi.me().catch(() => null),
    ]).then(([bookingsData, slotsData, profile, me]) => {
      const bookings  = Array.isArray(bookingsData) ? bookingsData : bookingsData?.content || []
      const slots     = Array.isArray(slotsData)    ? slotsData    : slotsData?.content    || []
      const pending   = bookings.filter(b => b.status === 'PENDING')
      const confirmed = bookings.filter(b => b.status === 'CONFIRMED')
      const available = slots.filter(s => s.status === 'AVAILABLE')
      const isBanned  = me?.status === 'DISABLED' || me?.userStatus === 'DISABLED'

      const profileBanner = renderProfileBanner(profile)

      container.innerHTML = `
        ${isBanned ? renderAccountBanBanner() : ''}
        ${profileBanner}
        <div id="announcements-host" style="margin-bottom:20px"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-bottom:20px">
          ${[
            { label: 'Pending requests', value: pending.length,   icon: '⏳' },
            { label: 'Confirmed',        value: confirmed.length, icon: '✅' },
            { label: 'Available slots',  value: available.length, icon: '🗓️' },
          ].map(s => `
            <div class="card" style="text-align:center;margin-bottom:0">
              <div style="font-size:28px;margin-bottom:8px">${s.icon}</div>
              <div style="font-size:28px;font-weight:800;color:#e8722a">${s.value}</div>
              <div class="text-muted text-sm">${s.label}</div>
            </div>
          `).join('')}
        </div>
        ${pending.length ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title">Pending requests</div>
              <a href="#/specialist/sessions" class="btn btn-primary btn-sm">View all</a>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Customer</th><th>Date / Time</th><th>Status</th></tr></thead>
                <tbody>
                  ${pending.slice(0,5).map(b => `<tr>
                    <td>${b.customerName||'—'}</td>
                    <td>${b.scheduledTime ? new Date(b.scheduledTime).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                    <td>${statusTag(b.status)}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
        <div class="card">
          <div class="card-header"><div class="card-title">Quick links</div></div>
          <div class="flex gap-8" style="flex-wrap:wrap">
            ${isBanned
              ? `<span class="tag tag-danger" style="font-size:13px;padding:8px 14px">Slot management disabled</span>
                 <a href="#/specialist/sessions" class="btn btn-secondary">📋 Session requests (view only)</a>
                 <a href="#/specialist/profile"  class="btn btn-secondary">👤 Edit profile</a>`
              : `<a href="#/specialist/slots"    class="btn btn-secondary">🗓️ Manage slots</a>
                 <a href="#/specialist/sessions" class="btn btn-secondary">📋 Session requests</a>
                 <a href="#/specialist/profile"  class="btn btn-secondary">👤 Edit profile</a>`
            }
          </div>
        </div>
      `
      renderAnnouncementsCard(document.getElementById('announcements-host'))
    }).catch(() => { container.innerHTML = '<div class="empty">Failed to load dashboard.</div>' })
  })
}

function renderProfileBanner(profile) {
  if (!profile) {
    return bannerCard({
      color:   '#e8722a',
      bg:      '#fff8f1',
      title:   'Complete your profile',
      message: "Your specialist profile is empty. Clients can't find or book you until it's submitted for approval.",
      cta:     { href: '#/specialist/profile', label: 'Complete profile', variant: 'btn-primary' },
    })
  }
  const meta = SPECIALIST_STATUS[profile.status]
  if (!meta) return ''

  if (profile.status === 'PENDING') {
    return bannerCard({
      color: meta.color, bg: meta.bg,
      title: 'Profile under review',
      message: meta.msg,
    })
  }
  if (profile.status === 'REJECTED') {
    const reason = profile.rejectionReason ? `<div style="margin-top:6px;padding:8px 10px;background:#fff;border-radius:4px;font-size:13px;color:#5c0011"><strong>Reason:</strong> ${escapeHtml(profile.rejectionReason)}</div>` : ''
    return bannerCard({
      color: meta.color, bg: meta.bg,
      title: 'Profile rejected',
      message: meta.msg + reason,
      cta: { href: '#/specialist/profile', label: 'Update & resubmit', variant: 'btn-danger' },
      messageIsHtml: true,
    })
  }
  if (profile.status === 'PAUSED') {
    return bannerCard({
      color: meta.color, bg: meta.bg,
      title: 'Profile paused',
      message: meta.msg,
      cta: { href: '#/specialist/profile', label: 'Manage profile', variant: 'btn-secondary' },
    })
  }
  return ''
}

function bannerCard({ color, bg, title, message, cta, messageIsHtml }) {
  const ctaHtml = cta ? `<a href="${cta.href}" class="btn ${cta.variant}">${cta.label}</a>` : ''
  const msgHtml = messageIsHtml ? message : escapeHtml(message)
  return `
    <div class="card" style="border-left:4px solid ${color};background:${bg};margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div style="flex:1;min-width:240px">
          <div class="card-title" style="margin-bottom:4px">${escapeHtml(title)}</div>
          <div class="text-muted text-sm">${msgHtml}</div>
        </div>
        ${ctaHtml}
      </div>
    </div>
  `
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}