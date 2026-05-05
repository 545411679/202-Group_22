import { renderLayout, toast } from '/app.js'
import { adminApi, fileApi } from '/api.js'

const VISIBILITY_OPTIONS = [
  { value: 'DRAFT',      audience: null,         label: 'Draft',                  desc: 'Saved but hidden from users. Only admins see it.' },
  { value: 'ALL',        audience: 'ALL',        label: 'Publish to Everyone',    desc: 'Visible to clients and specialists.' },
  { value: 'CLIENT',     audience: 'CLIENT',     label: 'Publish to Clients',     desc: 'Visible to clients only.' },
  { value: 'SPECIALIST', audience: 'SPECIALIST', label: 'Publish to Specialists', desc: 'Visible to specialists only.' }
]

function visibilityFor(a) {
  if (!a.published) return 'DRAFT'
  return a.audience || 'ALL'
}

function visibilityLabel(a) {
  return (VISIBILITY_OPTIONS.find(o => o.value === visibilityFor(a)) || { label: '—' }).label
}

function visibilityTag(a) {
  const v = visibilityFor(a)
  if (v === 'DRAFT')      return '<span class="tag tag-warning">Draft</span>'
  if (v === 'ALL')        return '<span class="tag tag-success">Published · Everyone</span>'
  if (v === 'CLIENT')     return '<span class="tag tag-success">Published · Clients</span>'
  if (v === 'SPECIALIST') return '<span class="tag tag-success">Published · Specialists</span>'
  return '<span class="tag tag-info">—</span>'
}

function escAttr(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;') }
function escHtml(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

export function render(app) {
  renderLayout('Announcements', container => {
    let announcements = []
    let editModal = null

    function load() {
      adminApi.getAnnouncements().then(data => {
        announcements = Array.isArray(data) ? data : data?.content || []
        renderPage()
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load announcements.</div>' })
    }

    function renderPage() {
      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-title">Announcements</div>
            <button class="btn btn-primary btn-sm" id="add-btn">+ New announcement</button>
          </div>
          <div class="text-muted text-sm" style="margin-bottom:12px">
            <strong>Draft</strong> = saved but hidden from users. <strong>Published</strong> = visible to its audience on their dashboard.
          </div>
          ${!announcements.length ? '<div class="empty">No announcements.</div>' : `
            <div class="table-wrap">
              <table>
                <thead><tr>
                  <th>Title</th>
                  <th>Body</th>
                  <th>Visibility</th>
                  <th>Image</th>
                  <th style="min-width:240px">Actions</th>
                </tr></thead>
                <tbody>
                  ${announcements.map(a => {
                    const id = a.announcementId || a.id
                    return `<tr>
                      <td><strong>${escHtml(a.title)||'—'}</strong></td>
                      <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:#8c6a52">${escHtml(a.body)||'—'}</td>
                      <td>${visibilityTag(a)}</td>
                      <td>${a.imageUrl ? `<a href="${fileApi.url(a.imageUrl)}" target="_blank" rel="noopener" style="font-size:12px">📎 View</a>` : '—'}</td>
                      <td class="row-actions">
                        ${a.published
                          ? `<button class="btn btn-secondary btn-sm" data-action="unpublish" data-id="${id}">Unpublish</button>`
                          : `<button class="btn btn-success btn-sm"  data-action="publish"   data-id="${id}">Publish</button>`}
                        <button class="btn btn-secondary btn-sm" data-action="edit"   data-id="${id}">Edit</button>
                        <button class="btn btn-danger btn-sm"    data-action="delete" data-id="${id}">Delete</button>
                      </td>
                    </tr>`
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
        ${editModal !== null ? renderModal() : ''}
      `
      bindEvents()
    }

    function renderModal() {
      const m = editModal
      const currentVis = m.visibility || (m.published ? (m.audience || 'ALL') : 'DRAFT')
      return `
        <div class="modal-overlay" data-modal="edit">
          <div class="modal" style="max-width:600px">
            <div class="modal-title">${m.id ? 'Edit announcement' : 'New announcement'}</div>
            <div class="text-muted text-sm" style="margin:-6px 0 16px">
              Choose visibility below. <strong>Draft</strong> hides it from users; the published options show it on the chosen audience's dashboard.
            </div>

            <div class="form-group">
              <label class="form-label">Visibility *</label>
              <div id="vis-cards" style="display:flex;flex-direction:column;gap:8px">
                ${VISIBILITY_OPTIONS.map(o => `
                  <label data-vis="${o.value}" style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:2px solid ${currentVis===o.value?'#e8722a':'#eadfd1'};background:${currentVis===o.value?'#fff8f1':'#fff'};border-radius:8px;cursor:pointer;transition:border-color .15s">
                    <input type="radio" name="ann-visibility" value="${o.value}" ${currentVis===o.value?'checked':''} style="margin-top:3px" />
                    <div style="flex:1">
                      <div style="font-weight:600;color:#2d1a0e">${o.label}</div>
                      <div style="font-size:12px;color:#8c6a52;margin-top:2px">${o.desc}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Title *</label>
              <input class="form-input" id="ann-title" value="${escAttr(m.title)}" />
            </div>

            <div class="form-group">
              <label class="form-label">Body *</label>
              <textarea class="form-textarea" id="ann-body" rows="4">${escHtml(m.body)}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Image (optional)</label>
              <div class="flex gap-8" style="align-items:center;flex-wrap:wrap">
                <input type="file" id="ann-image-file" accept="image/*" />
                <button type="button" class="btn btn-secondary btn-sm" id="ann-upload-btn">Upload</button>
              </div>
              <div id="ann-image-preview" style="margin-top:10px">
                ${m.imageUrl ? `
                  <div class="flex gap-8" style="align-items:center">
                    <img src="${fileApi.url(m.imageUrl)}" style="max-width:120px;max-height:80px;border-radius:6px;border:1px solid #eadfd1" />
                    <span style="font-size:12px;color:#8c6a52">${escHtml(m.imageUrl)}</span>
                    <button type="button" class="btn btn-danger btn-sm" id="ann-remove-img">Remove</button>
                  </div>
                ` : ''}
              </div>
            </div>

            <div id="ann-err" class="form-error" style="display:none"></div>
            <div class="modal-footer">
              <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
              <button class="btn btn-primary"   id="modal-save">${currentVis === 'DRAFT' ? 'Save as Draft' : 'Save & Publish'}</button>
            </div>
          </div>
        </div>
      `
    }

    function captureFormState() {
      if (editModal === null) return
      const titleEl = document.getElementById('ann-title')
      const bodyEl  = document.getElementById('ann-body')
      const visEl   = document.querySelector('input[name="ann-visibility"]:checked')
      if (titleEl) editModal.title = titleEl.value
      if (bodyEl)  editModal.body  = bodyEl.value
      if (visEl)   editModal.visibility = visEl.value
    }

    function bindEvents() {
      document.getElementById('add-btn')?.addEventListener('click', () => {
        editModal = { id: null, title: '', body: '', visibility: 'DRAFT', imageUrl: '' }
        renderPage()
      })

      container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id     = btn.dataset.id
          const action = btn.dataset.action
          const a = announcements.find(x => String(x.announcementId || x.id) === String(id))

          if (action === 'edit') {
            if (!a) return
            editModal = {
              id,
              title:      a.title || '',
              body:       a.body || '',
              visibility: visibilityFor(a),
              imageUrl:   a.imageUrl || ''
            }
            renderPage()
          } else if (action === 'publish' || action === 'unpublish') {
            if (!a) return
            const payload = {
              title:     a.title,
              body:      a.body,
              audience:  a.audience || 'ALL',
              published: action === 'publish',
              imageUrl:  a.imageUrl || null
            }
            try { await adminApi.updateAnnouncement(id, payload); toast(action === 'publish' ? 'Published.' : 'Unpublished.', 'success'); load() }
            catch (e) { toast(e.message || 'Failed.', 'error') }
          } else if (action === 'delete') {
            if (!confirm('Delete this announcement?')) return
            try { await adminApi.deleteAnnouncement(id); toast('Deleted.', 'info'); load() }
            catch (e) { toast(e.message || 'Failed.', 'error') }
          }
        })
      })

      if (editModal !== null) {
        const overlay = document.querySelector('[data-modal="edit"]')
        overlay?.addEventListener('click', e => { if (e.target === overlay) { editModal = null; renderPage() } })

        document.querySelectorAll('#vis-cards [data-vis]').forEach(card => {
          card.addEventListener('click', () => {
            captureFormState()
            editModal.visibility = card.dataset.vis
            renderPage()
          })
        })

        document.getElementById('modal-cancel').addEventListener('click', () => { editModal = null; renderPage() })

        document.getElementById('ann-upload-btn').addEventListener('click', async () => {
          captureFormState()
          const input = document.getElementById('ann-image-file')
          const file = input?.files?.[0]
          if (!file) { toast('Choose a file first.', 'warning'); return }
          try {
            const resp = await fileApi.upload(file)
            editModal.imageUrl = resp.filename || resp.name || resp.url || resp
            renderPage()
          } catch (e) { toast(e.message || 'Upload failed.', 'error') }
        })

        document.getElementById('ann-remove-img')?.addEventListener('click', () => {
          captureFormState()
          editModal.imageUrl = ''
          renderPage()
        })

        document.getElementById('modal-save').addEventListener('click', async () => {
          captureFormState()
          const title = (editModal.title || '').trim()
          const body  = (editModal.body  || '').trim()
          const vis   = editModal.visibility || 'DRAFT'
          const opt   = VISIBILITY_OPTIONS.find(o => o.value === vis) || VISIBILITY_OPTIONS[0]
          const errEl = document.getElementById('ann-err')
          errEl.style.display = 'none'
          if (!title || !body) { errEl.textContent = 'Title and body required.'; errEl.style.display = 'block'; return }
          const payload = {
            title, body,
            audience:  opt.audience || 'ALL',
            published: vis !== 'DRAFT',
            imageUrl:  editModal.imageUrl || null
          }
          try {
            if (editModal.id) await adminApi.updateAnnouncement(editModal.id, payload)
            else              await adminApi.createAnnouncement(payload)
            toast(vis === 'DRAFT' ? 'Saved as draft.' : 'Published.', 'success')
            editModal = null
            load()
          } catch (e) { errEl.textContent = e.message || 'Failed.'; errEl.style.display = 'block' }
        })
      }
    }

    load()
  })
}
