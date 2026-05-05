import { renderLayout, toast } from '/app.js'
import { specialistApi, bookingApi, authApi } from '/api.js'

export function render(app, params) {
  renderLayout('Book a Session', container => {
    let step = params.slot ? 2 : 1
    let specialist = null
    let slots = []
    let selectedSlot = null
    let formData = { contact: '', topic: '', notes: '' }

    container.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading…</div>'

    specialistApi.getPublicProfile(params.specId)
      .then(p => {
        specialist = p
        const titleEl = document.querySelector('.topbar-title')
        if (titleEl) titleEl.textContent = `Book a Session · ${p.name || ''}`
        return specialistApi.getSchedule(params.specId)
      })
      .then(data => {
        slots = (data?.slots || data?.content || (Array.isArray(data) ? data : []))
          .filter(s => s.status === 'AVAILABLE' && !s.bookingStatus)

        if (params.slot) {
          selectedSlot = slots.find(s => String(s.slotId ?? s.id) === String(params.slot)) ?? null
          if (!selectedSlot) step = 1
        }

        renderStep()
      })
      .catch(() => { container.innerHTML = '<div class="empty">Failed to load specialist.</div>' })

    function slotDT(s) {
      return new Date(`${s.slotDate}T${s.startTime}`)
    }

    function slotEndDT(s) {
      return s.endTime ? new Date(`${s.slotDate}T${s.endTime}`) : null
    }

    function slotHours(s) {
      const start = slotDT(s)
      const end   = slotEndDT(s)
      if (!end) return 0
      return Math.max(0, (end - start) / 3600000)
    }

    function slotRangeLabel(s) {
      const start = slotDT(s)
      const end   = slotEndDT(s)
      const dateStr = start.toLocaleDateString('en-GB', { dateStyle: 'short' })
      const fmt = d => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      return end ? `${dateStr} · ${fmt(start)} – ${fmt(end)}` : `${dateStr} · ${fmt(start)}`
    }

    function computeFee(s) {
      const hours = slotHours(s)
      const rate  = Number(specialist?.fee ?? 0)
      return Math.round(hours * rate * 100) / 100
    }

    function renderStepper() {
      const labels = ['Select slot(s)', 'Your details', 'Review & confirm']
      return `
        <div class="bwiz-stepper">
          ${labels.map((label, i) => {
            const n = i + 1
            const done   = n < step
            const active = n === step
            return `
              ${i > 0 ? `<div class="bwiz-line${done ? ' done' : ''}"></div>` : ''}
              <div class="bwiz-step${done ? ' done' : active ? ' active' : ''}">
                <div class="bwiz-circle">${done ? '✓' : n}</div>
                <div class="bwiz-label">${label}</div>
              </div>
            `
          }).join('')}
        </div>
      `
    }

    function renderStep() {
      const name = specialist?.name || ''
      container.innerHTML = `
        <div style="max-width:700px;margin:0 auto">
          <h2 class="bwiz-title">Book a session${name ? ` · ${name}` : ''}</h2>
          ${renderStepper()}
          <div class="card bwiz-card">
            ${step === 1 ? html1() : step === 2 ? html2() : html3()}
          </div>
        </div>
      `
      bind()
    }

    function html1() {
      if (!slots.length) return `
        <div class="empty" style="padding:32px 0">No available slots for this specialist at the moment.</div>
        <div style="margin-top:8px">
          <button class="btn btn-secondary" onclick="history.back()">← Back</button>
        </div>
      `
      return `
        <div class="slot-grid" style="margin-bottom:24px">
          ${slots.map(s => {
            const id  = String(s.slotId ?? s.id)
            const sel = selectedSlot && String(selectedSlot.slotId ?? selectedSlot.id) === id
            return `
              <div class="slot-card${sel ? ' selected' : ''}" data-id="${id}">
                <div class="slot-time">${slotRangeLabel(s)}</div>
                <div class="slot-status">Available</div>
              </div>
            `
          }).join('')}
        </div>
        <div style="display:flex;justify-content:flex-end">
          <button class="btn btn-primary" id="next-btn"${!selectedSlot ? ' disabled' : ''}>Next →</button>
        </div>
      `
    }

    function html2() {
      return `
        <div class="form-group">
          <label class="form-label">
            <span style="color:#c0392b;margin-right:2px">*</span>Contact (phone or email)
          </label>
          <input class="form-input" id="contact-input"
            placeholder="+86 139 0000 0000 or you@example.com"
            value="${esc(formData.contact)}" />
        </div>
        <div class="form-group">
          <label class="form-label">
            Topic
            <span class="text-muted" style="font-weight:400">&thinsp;(optional · max 100 chars)</span>
          </label>
          <div style="position:relative">
            <input class="form-input" id="topic-input" maxlength="100"
              value="${esc(formData.topic)}" style="padding-right:60px" />
            <span id="topic-count" class="bwiz-counter">${formData.topic.length} / 100</span>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:28px">
          <label class="form-label">
            Notes
            <span class="text-muted" style="font-weight:400">&thinsp;(optional · max 500 chars)</span>
          </label>
          <div style="position:relative">
            <textarea class="form-textarea" id="notes-input" maxlength="500" rows="5"
              style="padding-bottom:28px">${esc(formData.notes)}</textarea>
            <span id="notes-count" class="bwiz-counter" style="top:auto;bottom:10px">${formData.notes.length} / 500</span>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between">
          <button class="btn btn-secondary" id="back-btn">← Back</button>
          <button class="btn btn-primary" id="review-btn">Review →</button>
        </div>
      `
    }

    function html3() {
      const dt    = selectedSlot ? slotDT(selectedSlot) : null
      const hours = selectedSlot ? slotHours(selectedSlot) : 0
      const fee   = selectedSlot ? computeFee(selectedSlot) : 0
      const rate  = specialist?.fee
      return `
        <table class="desc-table" style="margin-bottom:28px">
          <tr><td>Specialist</td><td>${specialist?.name || '—'}</td></tr>
          <tr><td>Specialty</td><td>${specialist?.specialty || '—'}</td></tr>
          <tr><td>Date / Time</td><td>${selectedSlot ? slotRangeLabel(selectedSlot) : '—'}</td></tr>
          <tr><td>Duration</td><td>${hours ? `${hours} hour${hours === 1 ? '' : 's'}` : '—'}</td></tr>
          <tr><td>Hourly rate</td><td>${rate != null ? '¥' + rate : '—'}</td></tr>
          <tr><td><strong>Total fee</strong></td><td><strong>${rate != null && hours ? '¥' + fee : '—'}</strong></td></tr>
          ${formData.contact ? `<tr><td>Contact</td><td>${esc(formData.contact)}</td></tr>` : ''}
          ${formData.topic   ? `<tr><td>Topic</td><td>${esc(formData.topic)}</td></tr>` : ''}
          ${formData.notes   ? `<tr><td>Notes</td><td style="white-space:pre-wrap">${esc(formData.notes)}</td></tr>` : ''}
        </table>
        <div style="display:flex;justify-content:space-between">
          <button class="btn btn-secondary" id="back-btn">← Back</button>
          <button class="btn btn-primary" id="confirm-btn">Confirm booking</button>
        </div>
      `
    }

    function bind() {
      // Step 1 — slot selection
      container.querySelectorAll('.slot-card').forEach(card => {
        card.addEventListener('click', () => {
          container.querySelectorAll('.slot-card').forEach(c => c.classList.remove('selected'))
          card.classList.add('selected')
          selectedSlot = slots.find(s => String(s.slotId ?? s.id) === card.dataset.id) ?? null
          const btn = document.getElementById('next-btn')
          if (btn) btn.disabled = false
        })
      })

      // Step 2 — character counters
      document.getElementById('topic-input')?.addEventListener('input', e => {
        const el = document.getElementById('topic-count')
        if (el) el.textContent = `${e.target.value.length} / 100`
      })
      document.getElementById('notes-input')?.addEventListener('input', e => {
        const el = document.getElementById('notes-count')
        if (el) el.textContent = `${e.target.value.length} / 500`
      })

      // Navigation
      document.getElementById('next-btn')?.addEventListener('click', () => {
        if (!selectedSlot) return
        step = 2; renderStep()
      })

      document.getElementById('back-btn')?.addEventListener('click', () => {
        step--; renderStep()
      })

      document.getElementById('review-btn')?.addEventListener('click', () => {
        const contact = document.getElementById('contact-input')?.value.trim() || ''
        if (!contact) {
          toast('Contact info is required.', 'error')
          document.getElementById('contact-input')?.focus()
          return
        }
        formData = {
          contact,
          topic: document.getElementById('topic-input')?.value.trim() || '',
          notes: document.getElementById('notes-input')?.value.trim() || '',
        }
        step = 3; renderStep()
      })

      document.getElementById('confirm-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('confirm-btn')
        if (btn) { btn.disabled = true; btn.textContent = 'Confirming…' }
        try {
          const me = await authApi.me()
          if (me?.status === 'DISABLED' || me?.userStatus === 'DISABLED') {
            toast('You are banned by system administrator. Booking is not allowed.', 'error')
            if (btn) { btn.disabled = false; btn.textContent = 'Confirm booking' }
            return
          }
          await bookingApi.create({
            specialistId: params.specId,
            slotIds: [selectedSlot.slotId ?? selectedSlot.id],
            contact: formData.contact,
            topic:   formData.topic,
            notes:   formData.notes,
          })
          toast('Booking confirmed!', 'success')
          location.hash = '#/customer/dashboard'
        } catch (e) {
          if (btn) { btn.disabled = false; btn.textContent = 'Confirm booking' }
          toast(e.message || 'Booking failed.', 'error')
        }
      })
    }

    function esc(s) {
      return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    }
  })
}