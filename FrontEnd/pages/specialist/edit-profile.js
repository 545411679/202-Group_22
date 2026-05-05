import { renderLayout, toast } from '/app.js'
import { specialistApi } from '/api.js'
import { profileFieldsHtml, readProfileFields, loadCategories, bindProfileFormEvents } from '/pages/specialist/profile-form.js'
import { SPECIALIST_STATUS } from '/status.js'

const STATUS_INFO = {
  PENDING:  { tag: 'warning', msg: 'Your profile is awaiting admin approval. You will be visible to clients once approved.' },
  ACTIVE:   { tag: 'success', msg: 'Your profile is active and visible to clients.' },
  PAUSED:   { tag: 'info',    msg: 'Your profile is paused. Clients cannot find or book you. Activate to resume.' },
  REJECTED: { tag: 'danger',  msg: 'Your profile was rejected. Please contact the admin for more information.' },
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

export function render(app) {
  renderLayout('Edit Profile', container => {
    let profile  = null
    let cats     = []
    let editMode = false
    let isNew    = false

    function load() {
      container.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading...</div>'
      Promise.all([
        specialistApi.getOwnProfile().catch(() => null),
        loadCategories()
      ]).then(([p, catsData]) => {
        profile  = p || null
        cats     = catsData
        isNew    = !profile
        editMode = isNew
        renderPage()
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load profile.</div>' })
    }

    function statusCard() {
      if (!profile?.status) return ''
      const s = SPECIALIST_STATUS[profile.status] || { tag: 'info', label: profile.status, msg: '' }
      const reasonHtml = (profile.status === 'REJECTED' && profile.rejectionReason)
        ? `<div style="margin-top:10px;padding:10px 12px;background:#fff;border-left:3px solid ${s.color};border-radius:4px;font-size:13px"><strong>Admin's reason:</strong> ${escapeHtml(profile.rejectionReason)}</div>`
        : ''
      return `
        <div class="card" style="margin-bottom:0;border-left:4px solid ${s.color};background:${s.bg}">
          <div class="flex gap-8" style="align-items:center;margin-bottom:10px;flex-wrap:wrap">
            <span style="font-weight:600;color:#555">Profile Status:</span>
            <span class="tag tag-${s.tag}">${s.label}</span>
            ${profile.status === 'ACTIVE'
              ? `<button class="btn btn-secondary btn-sm" id="pause-btn">Pause Profile</button>`
              : profile.status === 'PAUSED'
              ? `<button class="btn btn-success btn-sm" id="activate-btn">Activate Profile</button>`
              : ''}
          </div>
          <p style="font-size:13px;color:#666">${s.msg || ''}</p>
          ${reasonHtml}
        </div>
      `
    }

    function viewCard() {
      const p = profile
      const certs = Array.isArray(p.certificates) ? p.certificates : []
      return `
        <div class="card" style="margin-bottom:0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div class="card-title">Profile Information</div>
            <button class="btn btn-secondary btn-sm" id="edit-btn">Edit Profile</button>
          </div>
          <table class="desc-table">
            <tr><td>Name</td><td>${p.name||'—'}</td></tr>
            <tr><td>Specialty</td><td>${p.specialty||'—'}</td></tr>
            <tr><td>Level</td><td>${p.qualificationLevel||'—'}</td></tr>
            <tr><td>Fee</td><td>${p.fee != null ? '¥'+p.fee+' / hour' : '—'}</td></tr>
            <tr><td>Bio</td><td style="white-space:pre-wrap">${p.bio||'—'}</td></tr>
            <tr><td>Certificates</td><td>${certs.length
              ? certs.map(f => `<a href="/api/files/${encodeURIComponent(f)}" target="_blank" rel="noopener" style="display:inline-block;margin:2px 6px 2px 0;padding:4px 8px;background:#faf6f1;border-radius:4px;font-size:12px;color:#2d1a0e;text-decoration:underline">📎 ${f}</a>`).join('')
              : '—'}</td></tr>
          </table>
        </div>
      `
    }

    function editCard() {
      return `
        <div class="card" style="max-width:560px;margin-bottom:0">
          <div class="card-title" style="margin-bottom:20px">${isNew ? 'Create Profile' : 'Edit Profile'}</div>
          <div id="profile-fields-host">
            ${profileFieldsHtml(profile || {}, cats)}
          </div>
          <div id="err" class="form-error" style="display:none;margin-bottom:12px"></div>
          <div class="flex gap-8">
            <button class="btn btn-primary" id="save-btn">${isNew ? 'Submit for review' : 'Save changes'}</button>
            ${!isNew ? '<button class="btn btn-secondary" id="cancel-btn">Cancel</button>' : ''}
          </div>
        </div>
      `
    }

    function renderPage() {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px">
          ${profile ? statusCard() : ''}
          ${editMode ? editCard() : viewCard()}
        </div>
      `

      document.getElementById('edit-btn')?.addEventListener('click', () => { editMode = true; renderPage() })
      document.getElementById('cancel-btn')?.addEventListener('click', () => { editMode = false; renderPage() })

      const host = document.getElementById('profile-fields-host')
      if (host) bindProfileFormEvents(host)

      document.getElementById('pause-btn')?.addEventListener('click', async () => {
        try {
          await specialistApi.updateStatus({ status: 'PAUSED' })
          toast('Profile paused.', 'info')
          load()
        } catch (e) { toast(e.message || 'Failed.', 'error') }
      })
      document.getElementById('activate-btn')?.addEventListener('click', async () => {
        try {
          await specialistApi.updateStatus({ status: 'ACTIVE' })
          toast('Profile activated.', 'success')
          load()
        } catch (e) { toast(e.message || 'Failed.', 'error') }
      })

      document.getElementById('save-btn')?.addEventListener('click', async () => {
        const host    = document.getElementById('profile-fields-host')
        const errEl   = document.getElementById('err')
        const payload = readProfileFields(host, errEl)
        if (!payload) return
        try {
          if (isNew) await specialistApi.createProfile(payload)
          else       await specialistApi.updateProfile(payload)
          toast('Profile saved.', 'success')
          load()
        } catch (e) { errEl.textContent = e.message || 'Failed.'; errEl.style.display = 'block' }
      })
    }

    load()
  })
}
