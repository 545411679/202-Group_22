import { authApi } from '/api.js'
import { auth } from '/auth.js'
import { toast } from '/app.js'

export function render(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-box">
        <div class="auth-logo">Con<span>silium</span></div>
        <div class="auth-sub">Create your customer account</div>
        <div class="form-group">
          <label class="form-label">Name</label>
          <input class="form-input" id="name" placeholder="Your full name" />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" id="email" type="email" placeholder="you@example.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" id="password" type="password" placeholder="Min 8 characters" />
        </div>
        <div id="err" class="form-error" style="display:none;margin-bottom:12px"></div>
        <button class="btn btn-primary" id="reg-btn" style="width:100%">Register</button>
        <div class="auth-footer">
          Are you a professional? <a href="#/register/specialist">Join as a specialist →</a>
        </div>
        <div class="auth-footer">Already have an account? <a href="#/login">Sign in</a></div>
      </div>
    </div>
  `

  const btn = app.querySelector('#reg-btn')
  btn.addEventListener('click', async () => {
    const name     = app.querySelector('#name').value.trim()
    const email    = app.querySelector('#email').value.trim()
    const password = app.querySelector('#password').value
    const errEl    = app.querySelector('#err')
    errEl.style.display = 'none'
    if (!name || !email || !password) { errEl.textContent = 'All fields required.'; errEl.style.display = 'block'; return }
    if (password.length < 8) { errEl.textContent = 'Password must be at least 8 characters.'; errEl.style.display = 'block'; return }
    btn.disabled = true
    try {
      await authApi.register({ name, email, password, role: 'CLIENT' })
      toast('Account created! Please sign in.', 'success')
      setTimeout(() => { location.hash = '#/login' }, 800)
    } catch (e) {
      errEl.textContent = e.message || 'Registration failed.'
      errEl.style.display = 'block'
    } finally { btn.disabled = false }
  })
}
