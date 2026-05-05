import { authApi } from '/api.js'
import { auth } from '/auth.js'
import { toast } from '/app.js'

export function render(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-box">
        <div class="auth-logo">Con<span>silium</span></div>
        <div class="auth-sub">Sign in to your account</div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" id="email" type="email" placeholder="you@example.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" id="password" type="password" placeholder="••••••••" />
        </div>
        <div id="err" class="form-error" style="display:none;margin-bottom:12px"></div>
        <button class="btn btn-primary" id="login-btn" style="width:100%">Sign in</button>

        <div style="display:flex;align-items:center;gap:10px;margin:20px 0 14px;color:#aaa;font-size:12px">
          <div style="flex:1;height:1px;background:#eadfd2"></div>
          <span>New here?</span>
          <div style="flex:1;height:1px;background:#eadfd2"></div>
        </div>
        <a href="#/register" class="btn btn-secondary" style="width:100%;margin-bottom:8px;display:block;text-align:center">Create customer account</a>
        <a href="#/register/specialist" class="btn btn-secondary" style="width:100%;display:block;text-align:center;border-color:#e8722a;color:#e8722a">Join as a specialist →</a>
      </div>
    </div>
  `

  const btn = app.querySelector('#login-btn')
  btn.addEventListener('click', async () => {
    const email    = app.querySelector('#email').value.trim()
    const password = app.querySelector('#password').value
    const errEl    = app.querySelector('#err')
    errEl.style.display = 'none'
    if (!email || !password) { errEl.textContent = 'Email and password required.'; errEl.style.display = 'block'; return }
    btn.disabled = true
    try {
      const data = await authApi.login({ email, password })
      auth.login(data)
      location.hash = auth.roleHome()
    } catch (e) {
      errEl.textContent = e.message || 'Login failed.'
      errEl.style.display = 'block'
    } finally { btn.disabled = false }
  })

  app.querySelector('#password').addEventListener('keydown', e => { if (e.key === 'Enter') btn.click() })
}
