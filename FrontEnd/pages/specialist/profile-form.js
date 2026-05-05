import { categoryApi, fileApi } from '/api.js'

export const QUALIFICATION_LEVELS = ['JUNIOR', 'MID', 'SENIOR', 'EXPERT']

export function profileFieldsHtml(profile = {}, categories = []) {
  const p = profile
  const certs = Array.isArray(p.certificates) ? p.certificates : []
  return `
    <div class="form-group">
      <label class="form-label">Display Name</label>
      <input class="form-input" data-pf="name" value="${esc(p.name || '')}" placeholder="Your professional name" />
    </div>
    <div class="form-group">
      <label class="form-label">Specialty / Category</label>
      <select class="form-select" data-pf="specialty">
        <option value="">Select category</option>
        ${categories.map(c => {
          const val = c.name || c
          return `<option value="${esc(val)}" ${(p.specialty || '') === val ? 'selected' : ''}>${esc(val)}</option>`
        }).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Qualification level</label>
      <select class="form-select" data-pf="level">
        ${QUALIFICATION_LEVELS.map(l => `<option value="${l}" ${p.qualificationLevel === l ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Fee per hour (¥)</label>
      <input class="form-input" data-pf="fee" type="number" min="0" step="0.01" value="${p.fee ?? ''}" />
    </div>
    <div class="form-group">
      <label class="form-label">Bio</label>
      <textarea class="form-textarea" data-pf="bio" rows="4">${esc(p.bio || '')}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Certificates <span class="text-muted" style="font-weight:400">(optional · pdf / image, up to ~5 MB each)</span></label>
      <div data-pf-cert-list style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px">
        ${certs.map(f => certChipHtml(f)).join('')}
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="file" data-pf-cert-input accept=".pdf,image/*" style="flex:1" />
        <button type="button" class="btn btn-secondary btn-sm" data-pf-cert-upload>Upload</button>
      </div>
      <div data-pf-cert-err class="form-error" style="display:none;margin-top:6px"></div>
    </div>
  `
}

function certChipHtml(filename) {
  const safe = esc(filename)
  return `
    <div data-pf-cert-item="${safe}" style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#faf6f1;border-radius:6px;font-size:13px">
      <span>📎</span>
      <a href="${fileApi.url(filename)}" target="_blank" rel="noopener" style="flex:1;color:#2d1a0e;text-decoration:underline;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safe}</a>
      <button type="button" class="btn btn-danger btn-sm" data-pf-cert-remove="${safe}">Remove</button>
    </div>
  `
}

export function bindProfileFormEvents(container) {
  const uploadBtn = container.querySelector('[data-pf-cert-upload]')
  const fileInput = container.querySelector('[data-pf-cert-input]')
  const listEl    = container.querySelector('[data-pf-cert-list]')
  const errEl     = container.querySelector('[data-pf-cert-err]')

  if (uploadBtn && fileInput && listEl) {
    uploadBtn.addEventListener('click', async () => {
      errEl.style.display = 'none'
      const file = fileInput.files?.[0]
      if (!file) { errEl.textContent = 'Choose a file first.'; errEl.style.display = 'block'; return }
      uploadBtn.disabled = true
      const originalLabel = uploadBtn.textContent
      uploadBtn.textContent = 'Uploading…'
      try {
        const res = await fileApi.upload(file)
        const filename = res?.filename
        if (!filename) throw new Error('Upload returned no filename.')
        listEl.insertAdjacentHTML('beforeend', certChipHtml(filename))
        fileInput.value = ''
      } catch (e) {
        errEl.textContent = e.message || 'Upload failed.'
        errEl.style.display = 'block'
      } finally {
        uploadBtn.disabled = false
        uploadBtn.textContent = originalLabel
      }
    })
  }

  if (listEl) {
    listEl.addEventListener('click', e => {
      const btn = e.target.closest('[data-pf-cert-remove]')
      if (!btn) return
      const name = btn.getAttribute('data-pf-cert-remove')
      const item = listEl.querySelector(`[data-pf-cert-item="${cssEscape(name)}"]`)
      if (item) item.remove()
    })
  }
}

export function readProfileFields(container, errEl) {
  const get = sel => container.querySelector(`[data-pf="${sel}"]`)?.value ?? ''
  const name      = get('name').trim()
  const specialty = get('specialty')
  const level     = get('level')
  const fee       = parseFloat(get('fee')) || 0
  const bio       = get('bio').trim()

  const certs = Array.from(container.querySelectorAll('[data-pf-cert-item]'))
    .map(el => el.getAttribute('data-pf-cert-item'))

  if (errEl) errEl.style.display = 'none'
  const fail = msg => {
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block' }
    return null
  }
  if (!name)      return fail('Please enter a display name.')
  if (!specialty) return fail('Please select a specialty.')

  return { name, specialty, qualificationLevel: level, fee, bio, certificates: certs }
}

export function loadCategories() {
  return categoryApi.getAll()
    .then(data => Array.isArray(data) ? data : (data?.content || []))
    .catch(() => [])
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function cssEscape(s) {
  return String(s ?? '').replace(/["\\]/g, '\\$&')
}
