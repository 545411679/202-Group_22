import { authApi, specialistApi } from '/api.js'
import { auth } from '/auth.js'
import { toast } from '/app.js'
import { profileFieldsHtml, readProfileFields, loadCategories, bindProfileFormEvents } from '/pages/specialist/profile-form.js'

export function render(app) {
  let step = (auth.isLoggedIn && auth.role === 'SPECIALIST') ? 2 : 1
  let cats = []
  const acct = { name: '', email: '', password: '' }

  app.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading…</div>'
  loadCategories().then(c => { cats = c; renderStep() })

  function renderStepper() {
    const labels = ['Account', 'Specialist profile']
    return `
      <div class="bwiz-stepper" style="margin-bottom:24px">
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
    app.innerHTML = `
      <div class="auth-page">
        <div class="auth-box" style="max-width:560px">
          <div class="auth-logo">Con<span>silium</span></div>
          <div class="auth-sub">Join as a specialist</div>
          ${renderStepper()}
          ${step === 1 ? html1() : html2()}
        </div>
      </div>
    `
    bind()
  }

  function html1() {
    return `
      <div class="form-group">
        <label class="form-label">Name</label>
        <input class="form-input" id="acct-name" placeholder="Your full name" value="${esc(acct.name)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="acct-email" type="email" placeholder="you@example.com" value="${esc(acct.email)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input class="form-input" id="acct-password" type="password" placeholder="Min 8 characters" value="${esc(acct.password)}" />
      </div>
      <div id="err1" class="form-error" style="display:none;margin-bottom:12px"></div>
      <button class="btn btn-primary" id="next-btn" style="width:100%">Next →</button>
      <div class="auth-footer">Already have an account? <a href="#/login">Sign in</a></div>
    `
  }

  function html2() {
    return `
      <div style="position:relative;min-height:24px;margin-bottom:8px">
        <a id="skip-link" href="javascript:void(0)" style="position:absolute;top:0;right:0;color:#888;text-decoration:underline;font-size:13px">Skip for now</a>
      </div>
      <div id="profile-fields-host">
        ${profileFieldsHtml({}, cats)}
      </div>
      <div id="err2" class="form-error" style="display:none;margin-bottom:12px"></div>
      <button class="btn btn-primary" id="submit-btn" style="width:100%">Submit for review</button>
    `
  }

  function bind() {
    if (step === 1) {
      const btn = document.getElementById('next-btn')
      btn.addEventListener('click', doStep1)
      ;['acct-name', 'acct-email', 'acct-password'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') btn.click() })
      })
    } else {
      document.getElementById('submit-btn').addEventListener('click', doStep2Submit)
      document.getElementById('skip-link').addEventListener('click', doSkip)
      bindProfileFormEvents(document.getElementById('profile-fields-host'))
    }
  }

  async function doStep1() {
    const errEl = document.getElementById('err1')
    errEl.style.display = 'none'
    acct.name     = document.getElementById('acct-name').value.trim()
    acct.email    = document.getElementById('acct-email').value.trim()
    acct.password = document.getElementById('acct-password').value
    if (!acct.name || !acct.email || !acct.password) {
      errEl.textContent = 'All fields required.'; errEl.style.display = 'block'; return
    }
    if (acct.password.length < 8) {
      errEl.textContent = 'Password must be at least 8 characters.'; errEl.style.display = 'block'; return
    }

    const btn = document.getElementById('next-btn')
    btn.disabled = true
    try {
      await authApi.register({ name: acct.name, email: acct.email, password: acct.password, role: 'SPECIALIST' })
      const loginData = await authApi.login({ email: acct.email, password: acct.password })
      auth.login(loginData)
      step = 2
      renderStep()
    } catch (e) {
      errEl.textContent = e.message || 'Registration failed.'
      errEl.style.display = 'block'
      btn.disabled = false
    }
  }

  async function doStep2Submit() {
    const host  = document.getElementById('profile-fields-host')
    const errEl = document.getElementById('err2')
    const data  = readProfileFields(host, errEl)
    if (!data) return

    const btn = document.getElementById('submit-btn')
    btn.disabled = true
    try {
      await specialistApi.createProfile(data)
      const own = await specialistApi.getOwnProfile().catch(() => null)
      if (own?.id) localStorage.setItem('specialistId', own.id)
      toast('Profile submitted for review.', 'success')
      location.hash = '#/specialist/dashboard'
    } catch (e) {
      errEl.textContent = e.message || 'Failed to submit profile.'
      errEl.style.display = 'block'
      btn.disabled = false
    }
  }

  function doSkip() {
    showSkipModal()
  }

  function showSkipModal() {
    const modal = document.createElement('div')
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999'
    modal.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:28px;max-width:440px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
        <div style="font-size:18px;font-weight:700;margin-bottom:12px;color:#2d1a0e">Skip profile setup?</div>
        <div style="font-size:14px;color:#555;line-height:1.6;margin-bottom:24px">
          Your profile will join our specialists pool only after you submit a complete profile.
          You can finish it any time from your dashboard.
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button class="btn btn-secondary" id="skip-cancel">Cancel</button>
          <button class="btn btn-primary" id="skip-confirm">Skip →</button>
        </div>
      </div>
    `
    document.body.appendChild(modal)

    const close = () => modal.remove()
    modal.querySelector('#skip-cancel').addEventListener('click', close)
    modal.addEventListener('click', e => { if (e.target === modal) close() })
    modal.querySelector('#skip-confirm').addEventListener('click', () => {
      close()
      toast('You can complete your profile later from your dashboard.', 'info')
      location.hash = '#/specialist/dashboard'
    })
  }

  function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }
}
