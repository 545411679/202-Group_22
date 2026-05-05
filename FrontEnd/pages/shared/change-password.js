import { renderLayout, toast } from '/app.js'
import { authApi } from '/api.js'

export function render(app) {
  renderLayout('Change Password', container => {
    container.innerHTML = `
      <div class="card" style="max-width:480px">
        <div class="card-title" style="margin-bottom:20px">Change Password</div>
        <div class="form-group">
          <label class="form-label">Current password</label>
          <input class="form-input" id="old-pw" type="password" />
        </div>
        <div class="form-group">
          <label class="form-label">New password</label>
          <input class="form-input" id="new-pw" type="password" />
        </div>
        <div class="form-group">
          <label class="form-label">Confirm new password</label>
          <input class="form-input" id="confirm-pw" type="password" />
        </div>
        <div id="err" class="form-error" style="display:none;margin-bottom:12px"></div>
        <button class="btn btn-primary" id="save-btn">Update password</button>
      </div>
    `
    document.getElementById('save-btn').addEventListener('click', async () => {
      const oldPw  = document.getElementById('old-pw').value
      const newPw  = document.getElementById('new-pw').value
      const confPw = document.getElementById('confirm-pw').value
      const errEl  = document.getElementById('err')
      errEl.style.display = 'none'
      if (!oldPw || !newPw) { errEl.textContent = 'All fields required.'; errEl.style.display = 'block'; return }
      if (newPw !== confPw) { errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; return }
      if (newPw.length < 8) { errEl.textContent = 'New password must be at least 8 characters.'; errEl.style.display = 'block'; return }
      try {
        await authApi.changePassword({ oldPassword: oldPw, newPassword: newPw })
        toast('Password updated.', 'success')
        document.getElementById('old-pw').value = ''
        document.getElementById('new-pw').value = ''
        document.getElementById('confirm-pw').value = ''
      } catch (e) { errEl.textContent = e.message || 'Failed.'; errEl.style.display = 'block' }
    })
  })
}
