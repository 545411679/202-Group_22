import { renderLayout, toast } from '/app.js'
import { specialistApi, bookingApi } from '/api.js'
import { auth } from '/auth.js'

export function render(app, params) {
  renderLayout('Specialist Profile', container => {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading...</div>'
    specialistApi.getPublicProfile(params.id).then(p => {
      const certs = Array.isArray(p.certificates) ? p.certificates : []
      const certsBlock = certs.length ? `
        <div class="card">
          <div class="card-header"><div class="card-title">Certificates</div></div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${certs.map(f => `
              <a href="/api/files/${encodeURIComponent(f)}" target="_blank" rel="noopener"
                 style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:#faf6f1;border-radius:6px;font-size:13px;color:#2d1a0e;text-decoration:none">
                <span>📎</span><span style="text-decoration:underline">${f}</span>
              </a>
            `).join('')}
          </div>
        </div>
      ` : ''

      container.innerHTML = `
        <div class="card">
          <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
            <div class="specialist-avatar" style="width:72px;height:72px;font-size:28px">${(p.name||'?')[0].toUpperCase()}</div>
            <div style="flex:1">
              <h2 style="font-size:20px;font-weight:700;margin-bottom:4px">${p.name||'—'}</h2>
              <div style="color:#8c6a52;margin-bottom:8px">${p.specialty||'—'}</div>
              <div class="flex gap-8" style="flex-wrap:wrap;margin-bottom:12px">
                ${p.qualificationLevel ? `<span class="tag tag-info">${p.qualificationLevel}</span>` : ''}
                ${p.fee != null ? `<span class="tag tag-primary">¥${p.fee} / hour</span>` : ''}
              </div>
              <p style="color:#2d1a0e;font-size:14px;line-height:1.6">${p.bio||'No bio provided.'}</p>
            </div>
          </div>
        </div>
        ${certsBlock}
        ${auth.role === 'CLIENT' || auth.role === 'CUSTOMER' ? `
          <div class="card">
            <div class="card-header"><div class="card-title">Available Slots</div></div>
            <div id="slots-area"><div class="loading"><div class="spinner"></div></div></div>
          </div>
        ` : ''}
      `
      if (auth.role === 'CLIENT' || auth.role === 'CUSTOMER') {
        specialistApi.getSchedule(params.id).then(res => {
          const available = (res?.slots || []).filter(s => s.status === 'AVAILABLE' && !s.bookingStatus)
          const area = document.getElementById('slots-area')
          if (!available.length) { area.innerHTML = '<div class="empty">No available slots.</div>'; return }
          const slotHours = s => {
            if (!s.slotDate || !s.startTime || !s.endTime) return 0
            const start = new Date(`${s.slotDate}T${s.startTime}`)
            const end = new Date(`${s.slotDate}T${s.endTime}`)
            return Math.max(0, (end - start) / 3600000)
          }
          const feeText = s => {
            const hours = slotHours(s)
            const rate = Number(p.fee || 0)
            const total = Math.round(hours * rate * 100) / 100
            return `¥${total.toFixed(total % 1 === 0 ? 0 : 2)} (${hours.toFixed(hours % 1 === 0 ? 0 : 1)}h × ¥${rate}/hour)`
          }
          area.innerHTML = `<div class="slot-grid">${available.map(s => {
            const dt = new Date(`${s.slotDate}T${s.startTime}`)
            const date = dt.toLocaleDateString('en-GB')
            const startTime = String(s.startTime || '').slice(0, 5)
            const endTime = String(s.endTime || '').slice(0, 5)
            const timeRange = endTime ? `${startTime} - ${endTime}` : startTime
            return `
            <div class="slot-card" data-id="${s.slotId}" data-time="${s.slotDate}T${s.startTime}">
              <div class="slot-time">${date} ${timeRange}</div>
              <div class="slot-status">Available</div>
            </div>`
          }).join('')}</div>
          <div id="fee-summary" style="display:none;margin-top:14px;padding:12px 14px;background:#faf6f1;border:1px solid #eadfd2;border-radius:8px;color:#2d1a0e;font-size:14px"></div>
          <div style="margin-top:16px"><button class="btn btn-primary" id="book-btn" disabled>Go to booking →</button></div>`

          let selectedId = null
          area.querySelectorAll('.slot-card').forEach(card => {
            card.addEventListener('click', () => {
              area.querySelectorAll('.slot-card').forEach(c => c.classList.remove('selected'))
              card.classList.add('selected')
              selectedId = card.dataset.id
              const selected = available.find(s => String(s.slotId) === String(selectedId))
              const summary = document.getElementById('fee-summary')
              if (selected && summary) {
                summary.innerHTML = `<strong>Estimated fee:</strong> ${feeText(selected)}`
                summary.style.display = 'block'
              }
              document.getElementById('book-btn').disabled = false
            })
          })
          document.getElementById('book-btn').addEventListener('click', () => {
            if (!selectedId) return
            location.hash = `#/customer/book/${params.id}?slot=${selectedId}`
          })
        }).catch(() => { document.getElementById('slots-area').innerHTML = '<div class="empty">Failed to load slots.</div>' })
      }
    }).catch(() => { container.innerHTML = '<div class="empty">Failed to load profile.</div>' })
  })
}
