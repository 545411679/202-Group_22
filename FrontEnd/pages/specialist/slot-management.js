import { renderLayout, toast } from '/app.js'
import { specialistApi, authApi } from '/api.js'

function renderAccountBanBanner() {
  return `
    <div class="card" style="background:#fff0f0;border:1.5px solid #e74c3c;margin-bottom:20px;padding:20px">
      <div style="display:flex;align-items:flex-start;gap:14px">
        <span style="font-size:2rem;line-height:1">🚫</span>
        <div>
          <div style="font-weight:700;color:#c0392b;font-size:1.05rem;margin-bottom:4px">Account Suspended</div>
          <div style="color:#7b241c;font-size:0.9rem">Your account has been disabled by a system administrator. Slot management is currently unavailable. Please contact support if you believe this is a mistake.</div>
        </div>
      </div>
    </div>
  `
}

export function render(app) {
  renderLayout('My Slots', container => {
    let slots = []
    let showAdd = false
    let isBanned = false

    function load() {
      Promise.all([
        specialistApi.getSlots(),
        authApi.me().catch(() => null),
      ]).then(([data, me]) => {
        slots = Array.isArray(data) ? data : data?.content || []
        isBanned = me?.status === 'DISABLED' || me?.userStatus === 'DISABLED'
        renderPage()
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load slots.</div>' })
    }

    function renderPage() {
      container.innerHTML = `
        ${isBanned ? renderAccountBanBanner() : ''}
        <div class="card">
          <div class="card-header">
            <div class="card-title">My Time Slots</div>
            ${isBanned
              ? `<span class="tag tag-danger">Slot management disabled</span>`
              : `<button class="btn btn-primary btn-sm" id="add-btn">+ Add slot</button>`
            }
          </div>
          ${!isBanned && showAdd ? `
            <div style="background:#faf6f1;border-radius:8px;padding:16px;margin-bottom:16px">
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px">
                <div class="form-group" style="margin-bottom:0">
                  <label class="form-label">Date</label>
                  <input class="form-input" id="slot-date" type="text" placeholder="yyyy/mm/dd" inputmode="numeric" />
                </div>
                <div class="form-group" style="margin-bottom:0">
                  <label class="form-label">Start time</label>
                  <input class="form-input" id="slot-start" type="time" />
                </div>
                <div class="form-group" style="margin-bottom:0">
                  <label class="form-label">End time</label>
                  <input class="form-input" id="slot-end" type="time" />
                </div>
              </div>
              <div id="slot-err" class="form-error" style="display:none;margin:10px 0"></div>
              <div class="flex gap-8" style="margin-top:12px">
                <button class="btn btn-primary btn-sm" id="slot-save">Save</button>
                <button class="btn btn-secondary btn-sm" id="slot-cancel">Cancel</button>
              </div>
            </div>
          ` : ''}
          ${!slots.length ? '<div class="empty">No slots yet.</div>' : `
            <div class="slot-grid">
              ${slots.map(s => {
                const dt = s.slotDate && s.startTime ? new Date(`${s.slotDate}T${s.startTime}`) : null
                const dateLabel = dt ? dt.toLocaleDateString('en-GB', { dateStyle: 'short' }) : '—'
                const range     = (s.startTime && s.endTime) ? `${s.startTime.slice(0,5)} – ${s.endTime.slice(0,5)}` : ''
                return `
                  <div class="slot-card ${s.status==='UNAVAILABLE'?'unavailable':''}">
                    <div class="slot-time">${dateLabel}${range ? ` · ${range}` : ''}</div>
                    <div class="slot-status">${s.status}</div>
                    ${!isBanned ? `
                      <div class="flex gap-8" style="margin-top:8px">
                        ${s.status==='AVAILABLE'
                          ? `<button class="btn btn-secondary btn-sm" data-action="unavail" data-id="${s.slotId||s.id}">Mark unavailable</button>`
                          : `<button class="btn btn-success btn-sm" data-action="avail" data-id="${s.slotId||s.id}">Mark available</button>`}
                        <button class="btn btn-danger btn-sm" data-action="delete" data-id="${s.slotId||s.id}">Delete</button>
                      </div>
                    ` : ''}
                  </div>
                `
              }).join('')}
            </div>
          `}
        </div>
      `
      if (!isBanned) {
        document.getElementById('add-btn')?.addEventListener('click', () => { showAdd = !showAdd; renderPage() })
        if (showAdd) {
          document.getElementById('slot-cancel').addEventListener('click', () => { showAdd = false; renderPage() })
          document.getElementById('slot-save').addEventListener('click', async () => {
            const slotDate  = document.getElementById('slot-date').value.trim().replace(/\//g, '-')
            const startTime = document.getElementById('slot-start').value
            const endTime   = document.getElementById('slot-end').value
            const errEl     = document.getElementById('slot-err')
            errEl.style.display = 'none'
            if (!slotDate || !startTime || !endTime) {
              errEl.textContent = 'Please fill in date, start time, and end time.'; errEl.style.display = 'block'; return
            }
            if (endTime <= startTime) {
              errEl.textContent = 'End time must be after start time.'; errEl.style.display = 'block'; return
            }
            try {
              await specialistApi.addSlot({ slotDate, startTime, endTime })
              toast('Slot added.', 'success')
              showAdd = false
              load()
            } catch (e) { errEl.textContent = e.message || 'Failed.'; errEl.style.display = 'block' }
          })
        }
        container.querySelectorAll('[data-action]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id
            try {
              if (btn.dataset.action === 'avail')   { await specialistApi.markAvailable(id);   toast('Marked available.', 'success') }
              if (btn.dataset.action === 'unavail') { await specialistApi.markUnavailable(id); toast('Marked unavailable.', 'info') }
              if (btn.dataset.action === 'delete')  {
                if (!confirm('Delete this slot?')) return
                await specialistApi.deleteSlot(id)
                toast('Slot deleted.', 'info')
              }
              load()
            } catch (e) { toast(e.message || 'Failed.', 'error') }
          })
        })
      }
    }

    load()
  })
}