import { renderLayout, toast } from '/app.js'
import { specialistApi, bookingApi, authApi } from '/api.js'
import { bookingStatusTagHtml } from '/status.js'

function statusTag(s) { return bookingStatusTagHtml(s) }

function renderAccountBanBanner() {
  return `
    <div class="card" style="background:#fff0f0;border:1.5px solid #e74c3c;margin-bottom:20px;padding:20px">
      <div style="display:flex;align-items:flex-start;gap:14px">
        <span style="font-size:2rem;line-height:1">🚫</span>
        <div>
          <div style="font-weight:700;color:#c0392b;font-size:1.05rem;margin-bottom:4px">Account Suspended</div>
          <div style="color:#7b241c;font-size:0.9rem">Your account has been disabled by a system administrator. Session management actions are currently unavailable. You may view sessions in read-only mode. Please contact support if you believe this is a mistake.</div>
        </div>
      </div>
    </div>
  `
}

export function render(app) {
  renderLayout('Session Requests', container => {
    let bookings = []
    let filterStatus = ''
    let page = 1
    let isBanned = false
    const size = 10

    function load() {
      Promise.all([
        specialistApi.getBookings(filterStatus ? { status: filterStatus } : {}),
        authApi.me().catch(() => null),
      ]).then(([data, me]) => {
        bookings = Array.isArray(data) ? data : data?.content || []
        isBanned = me?.status === 'DISABLED' || me?.userStatus === 'DISABLED'
        renderPage()
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load sessions.</div>' })
    }

    function showConfirmDialog(bookingId) {
      const overlay = document.createElement('div')
      overlay.className = 'modal-overlay'
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header"><div class="modal-title">Confirm Session</div></div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Meeting Type</label>
              <select class="form-select" id="meeting-type">
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">In-person</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Meeting Info (link or address)</label>
              <input class="form-input" id="meeting-info" placeholder="e.g. Zoom link or office address" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="dlg-cancel">Cancel</button>
            <button class="btn btn-primary" id="dlg-confirm">Confirm</button>
          </div>
        </div>
      `
      document.body.appendChild(overlay)
      document.getElementById('dlg-cancel').addEventListener('click', () => overlay.remove())
      document.getElementById('dlg-confirm').addEventListener('click', async () => {
        const meetingType = document.getElementById('meeting-type').value
        const meetingInfo = document.getElementById('meeting-info').value.trim()
        try {
          await bookingApi.updateStatus(bookingId, { action: 'CONFIRM', meetingType, meetingInfo })
          toast('Session confirmed.', 'success')
          overlay.remove()
          load()
        } catch (e) { toast(e.message || 'Failed.', 'error') }
      })
    }

    function renderPage() {
      const totalPages = Math.ceil(bookings.length / size)
      const slice = bookings.slice((page-1)*size, page*size)
      container.innerHTML = `
        ${isBanned ? renderAccountBanBanner() : ''}
        <div class="card">
          <div class="card-header">
            <div class="card-title">Session Requests</div>
            ${isBanned ? `<span class="tag tag-danger">View only — management disabled</span>` : ''}
            <select class="form-select" id="filter-sel" style="width:150px">
              <option value="">All statuses</option>
              ${['PENDING','CONFIRMED','CONDUCTED','REVIEWED','CANCELLED','REJECTED'].map(s =>
                `<option value="${s}" ${filterStatus===s?'selected':''}>${s}</option>`
              ).join('')}
            </select>
          </div>
          ${!slice.length ? '<div class="empty">No sessions found.</div>' : `
            <div class="table-wrap">
              <table>
                <thead><tr><th>Customer</th><th>Date / Time</th><th>Fee</th><th>Status</th>${!isBanned ? '<th>Actions</th>' : ''}</tr></thead>
                <tbody>
                  ${slice.map(b => `<tr>
                    <td>${b.customerName||'—'}</td>
                    <td>${b.scheduledTime ? new Date(b.scheduledTime).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                    <td>${b.feeAmount != null ? '¥'+b.feeAmount : '—'}</td>
                    <td>${statusTag(b.status)}</td>
                    ${!isBanned ? `<td class="row-actions">
                      ${b.status==='PENDING' ? `
                        <button class="btn btn-success btn-sm" data-action="confirm" data-id="${b.bookingId||b.id}">Confirm</button>
                        <button class="btn btn-danger btn-sm"  data-action="reject"  data-id="${b.bookingId||b.id}">Reject</button>
                      ` : b.status==='CONFIRMED' ? `
                        <button class="btn btn-primary btn-sm"   data-action="conduct" data-id="${b.bookingId||b.id}">Mark Conducted</button>
                        <button class="btn btn-secondary btn-sm" data-action="cancel"  data-id="${b.bookingId||b.id}">Cancel</button>
                      ` : '—'}
                    </td>` : ''}
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
            ${totalPages > 1 ? `
              <div class="pagination">
                <button class="page-btn" ${page===1?'disabled':''} id="pg-prev">‹</button>
                ${Array.from({length:totalPages},(_,i)=>`<button class="page-btn ${i+1===page?'active':''}" data-pg="${i+1}">${i+1}</button>`).join('')}
                <button class="page-btn" ${page===totalPages?'disabled':''} id="pg-next">›</button>
              </div>
            ` : ''}
          `}
        </div>
      `
      document.getElementById('filter-sel').addEventListener('change', e => { filterStatus = e.target.value; page = 1; load() })
      document.getElementById('pg-prev')?.addEventListener('click', () => { page--; renderPage() })
      document.getElementById('pg-next')?.addEventListener('click', () => { page++; renderPage() })
      container.querySelectorAll('[data-pg]').forEach(btn => btn.addEventListener('click', () => { page = +btn.dataset.pg; renderPage() }))
      if (!isBanned) {
        container.querySelectorAll('[data-action]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id     = btn.dataset.id
            const action = btn.dataset.action
            if (action === 'confirm') {
              showConfirmDialog(id)
            } else if (action === 'conduct') {
              if (!confirm('Mark this session as conducted? This unlocks the customer\'s review.')) return
              try {
                await bookingApi.updateStatus(id, { action: 'CONDUCT' })
                toast('Session marked as conducted.', 'success')
                load()
              } catch (e) { toast(e.message || 'Failed.', 'error') }
            } else if (action === 'reject') {
              if (!confirm('Reject this session request? The slot will be released back to your schedule.')) return
              try {
                await bookingApi.updateStatus(id, { action: 'REJECT' })
                toast('Session rejected.', 'info')
                load()
              } catch (e) { toast(e.message || 'Failed.', 'error') }
            } else if (action === 'cancel') {
              if (!confirm('Cancel this confirmed session? Cancellation is blocked within 24 hours of the session start.')) return
              try {
                await bookingApi.updateStatus(id, { action: 'CANCEL' })
                toast('Session cancelled.', 'info')
                load()
              } catch (e) { toast(e.message || 'Failed.', 'error') }
            }
          })
        })
      }
    }

    load()
  })
}