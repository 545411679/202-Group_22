import { renderLayout, toast } from '/app.js'
import { dashboardApi, bookingApi, reviewApi } from '/api.js'
import { bookingStatusTagHtml } from '/status.js'

function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

function fmtDateTime(a) {
  if (a.slotDate && a.startTime) {
    const end = a.endTime ? ` – ${String(a.endTime).slice(0,5)}` : ''
    const dt = new Date(`${a.slotDate}T${a.startTime}`)
    return `${dt.toLocaleDateString('en-GB', { dateStyle: 'full' })} · ${String(a.startTime).slice(0,5)}${end}`
  }
  if (a.scheduledTime) return new Date(a.scheduledTime).toLocaleString('en-GB',{dateStyle:'full',timeStyle:'short'})
  return '—'
}

function slotHours(a) {
  if (!a.slotDate || !a.startTime || !a.endTime) return 0
  const start = new Date(`${a.slotDate}T${a.startTime}`)
  const end   = new Date(`${a.slotDate}T${a.endTime}`)
  return Math.max(0, (end - start) / 3600000)
}

function canCustomerCancel(a) {
  if (!['PENDING', 'CONFIRMED'].includes(a.status)) return false
  if (!a.slotDate || !a.startTime) return true
  const start = new Date(`${a.slotDate}T${a.startTime}`)
  const cutoff = new Date(Date.now() + 24 * 3600 * 1000)
  return start > cutoff
}

function starBar(rating, interactive, onPick) {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'display:inline-flex;gap:2px;font-size:22px;line-height:1'
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('span')
    s.textContent = '★'
    s.style.cssText = `cursor:${interactive?'pointer':'default'};color:${i<=rating?'#f5a623':'#d9d9d9'};user-select:none`
    if (interactive) s.addEventListener('click', () => onPick(i))
    wrap.appendChild(s)
  }
  return wrap
}

export function render(app, params) {
  renderLayout('Session Detail', container => {
    function load() {
      container.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading...</div>'
      dashboardApi.getAppointment(params.id).then(a => {
        renderPage(a)
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load session.</div>' })
    }

    function renderPage(a) {
      const hours = slotHours(a)
      const fee   = a.feeAmount != null ? a.feeAmount : a.totalFee
      const cancellable = canCustomerCancel(a)
      const showReviewCard = a.status === 'CONDUCTED' || a.status === 'REVIEWED' || a.hasReview

      container.innerHTML = `
        <div style="max-width:640px;display:flex;flex-direction:column;gap:16px">

          <div class="card" style="margin-bottom:0">
            <div class="card-header">
              <div class="card-title">Booking #${a.bookingId||a.id}</div>
              ${bookingStatusTagHtml(a.status)}
            </div>
            <table class="desc-table">
              <tr><td>Specialist</td><td>${esc(a.specialistName)||'—'}</td></tr>
              <tr><td>Specialty</td><td>${esc(a.specialty)||'—'}</td></tr>
              <tr><td>Date / Time</td><td>${fmtDateTime(a)}</td></tr>
              <tr><td>Duration</td><td>${hours ? `${hours} hour${hours===1?'':'s'}` : '—'}</td></tr>
              <tr><td>Total fee</td><td><strong>${fee != null ? '¥'+fee : '—'}</strong>${hours && fee != null ? ` <span class="text-muted text-sm">(${hours}h × ¥${(Number(fee)/hours).toFixed(2)}/hr)</span>` : ''}</td></tr>
              <tr><td>Contact</td><td>${esc(a.contact)||'—'}</td></tr>
              <tr><td>Topic</td><td>${esc(a.topic)||'—'}</td></tr>
              <tr><td>Notes</td><td style="white-space:pre-wrap">${esc(a.notes)||'—'}</td></tr>
              ${a.meetingType ? `<tr><td>Meeting type</td><td>${esc(a.meetingType)}</td></tr>` : ''}
              ${a.meetingInfo ? `<tr><td>Meeting info</td><td>${esc(a.meetingInfo)}</td></tr>` : ''}
            </table>
            ${['PENDING','CONFIRMED'].includes(a.status) ? `
              <div style="margin-top:20px">
                <button class="btn btn-danger" id="cancel-btn" ${cancellable?'':'disabled'}>Cancel booking</button>
                ${!cancellable ? '<div class="text-muted text-sm" style="margin-top:6px">Cancellation is blocked within 24 hours of the session start.</div>' : ''}
              </div>
            ` : ''}
          </div>

          ${showReviewCard ? renderReviewCard(a) : ''}

          <div>
            <a href="#/customer/dashboard" class="btn btn-secondary">← Back to dashboard</a>
          </div>
        </div>
      `

      document.getElementById('cancel-btn')?.addEventListener('click', async () => {
        if (!confirm('Cancel this booking? The slot will be released.')) return
        try {
          await bookingApi.updateStatus(a.bookingId||a.id, { action: 'CANCEL' })
          toast('Booking cancelled.', 'info')
          location.hash = '#/customer/dashboard'
        } catch (e) { toast(e.message || 'Failed.', 'error') }
      })

      if (showReviewCard) bindReviewCard(a)
    }

    function renderReviewCard(a) {
      if (a.hasReview || a.status === 'REVIEWED') {
        return `
          <div class="card" style="margin-bottom:0">
            <div class="card-header"><div class="card-title">Your review</div></div>
            <div id="review-display">
              <div style="margin-bottom:10px" id="review-stars-display"></div>
              <div style="white-space:pre-wrap;color:#2d1a0e;font-size:14px;line-height:1.6">${esc(a.reviewComment)||'<span class="text-muted">(no comment)</span>'}</div>
              ${a.reviewedAt ? `<div class="text-muted text-sm" style="margin-top:10px">Reviewed on ${new Date(a.reviewedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})}</div>` : ''}
            </div>
          </div>
        `
      }
      return `
        <div class="card" style="margin-bottom:0;border-left:4px solid #f5a623;background:#fffbe6">
          <div class="card-header"><div class="card-title">Your review</div></div>
          <div class="text-muted text-sm" style="margin-bottom:14px">This session has been conducted but you haven't reviewed it yet. Your feedback helps other clients.</div>
          <div class="form-group">
            <label class="form-label">Rating</label>
            <div id="star-row"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Comment</label>
            <textarea class="form-textarea" id="review-comment" rows="3" placeholder="Share your experience..." maxlength="1000"></textarea>
          </div>
          <div id="review-err" class="form-error" style="display:none;margin-bottom:8px"></div>
          <button class="btn btn-primary" id="submit-review-btn">Submit review</button>
        </div>
      `
    }

    function bindReviewCard(a) {
      if (a.hasReview || a.status === 'REVIEWED') {
        const host = document.getElementById('review-stars-display')
        if (host) host.appendChild(starBar(a.reviewRating || 0, false))
        return
      }
      let rating = 5
      const starHost = document.getElementById('star-row')
      function paintStars() {
        starHost.innerHTML = ''
        starHost.appendChild(starBar(rating, true, v => { rating = v; paintStars() }))
      }
      paintStars()

      document.getElementById('submit-review-btn').addEventListener('click', async () => {
        const comment = document.getElementById('review-comment').value.trim()
        const errEl   = document.getElementById('review-err')
        errEl.style.display = 'none'
        if (!comment) { errEl.textContent = 'Please enter a comment.'; errEl.style.display = 'block'; return }
        try {
          await reviewApi.submitReview(a.bookingId||a.id, { rating, comment })
          toast('Review submitted. Thank you!', 'success')
          load()
        } catch (e) { errEl.textContent = e.message || 'Failed.'; errEl.style.display = 'block' }
      })
    }

    load()
  })
}
