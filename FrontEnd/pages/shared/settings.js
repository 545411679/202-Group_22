import { renderLayout, toast } from '/app.js'
import { authApi } from '/api.js'
import { auth } from '/auth.js'

export function render(app) {
  renderLayout('Settings', container => {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading...</div>'
    authApi.me().then(data => {
      const me = data || {}
      container.innerHTML = `
        <div class="card" style="max-width:480px">
          <div class="card-title" style="margin-bottom:20px">Profile Information</div>
          <div class="form-group">
            <label class="form-label">Name</label>
            <input class="form-input" id="name" value="${me.name||auth.userName||''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" id="email" value="${me.email||''}" />
          </div>
          <div id="profile-err" class="form-error" style="display:none;margin-bottom:8px"></div>
          <button class="btn btn-primary" id="save-profile-btn">Save changes</button>
        </div>
        <div class="card" style="max-width:480px">
          <div class="card-title" style="margin-bottom:20px">Change Password</div>
          <div class="form-group">
            <label class="form-label">Current password</label>
            <input class="form-input" id="old-pw" type="password" />
          </div>
          <div class="form-group">
            <label class="form-label">New password (min 8 chars)</label>
            <input class="form-input" id="new-pw" type="password" />
          </div>
          <div id="pw-err" class="form-error" style="display:none;margin-bottom:8px"></div>
          <button class="btn btn-primary" id="save-pw-btn">Update password</button>
        </div>
      `
      document.getElementById('save-profile-btn').addEventListener('click', async () => {
        const name  = document.getElementById('name').value.trim()
        const email = document.getElementById('email').value.trim()
        const errEl = document.getElementById('profile-err')
        errEl.style.display = 'none'
        if (!name || !email) { errEl.textContent = 'Name and email required.'; errEl.style.display = 'block'; return }
        try {
          const updated = await authApi.updateProfile({ name, email })
          localStorage.setItem('userName', updated?.name || name)
          toast('Profile updated.', 'success')
        } catch (e) { errEl.textContent = e.message || 'Failed.'; errEl.style.display = 'block' }
      })
      document.getElementById('save-pw-btn').addEventListener('click', async () => {
        const oldPassword = document.getElementById('old-pw').value
        const newPassword = document.getElementById('new-pw').value
        const errEl = document.getElementById('pw-err')
        errEl.style.display = 'none'
        if (!oldPassword || !newPassword) { errEl.textContent = 'Both fields required.'; errEl.style.display = 'block'; return }
        if (newPassword.length < 8) { errEl.textContent = 'Min 8 characters.'; errEl.style.display = 'block'; return }
        try {
          await authApi.changePassword({ oldPassword, newPassword })
          toast('Password updated. Please sign in again.', 'success')
          auth.logout()
          location.hash = '#/login'
        } catch (e) { errEl.textContent = e.message || 'Failed.'; errEl.style.display = 'block' }
      })
    }).catch(() => { container.innerHTML = '<div class="empty">Failed to load settings.</div>' })
  })
}
