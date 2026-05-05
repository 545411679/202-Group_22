import { renderLayout, toast } from '/app.js'
import { adminApi } from '/api.js'

export function render(app) {
  renderLayout('Categories', container => {
    let categories = []
    let editModal = null

    function load() {
      adminApi.getCategories().then(data => {
        categories = Array.isArray(data) ? data : data?.content || []
        renderPage()
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load categories.</div>' })
    }

    function renderPage() {
      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-title">Specialty categories</div>
            <button class="btn btn-primary btn-sm" id="add-btn">+ Add category</button>
          </div>
          ${!categories.length ? '<div class="empty">No categories.</div>' : `
            <div class="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Actions</th></tr></thead>
                <tbody>
                  ${categories.map(c => `<tr>
                    <td>${c.name||c}</td>
                    <td class="row-actions">
                      <button class="btn btn-secondary btn-sm" data-action="edit"   data-id="${c.categoryId||c.id||''}" data-name="${c.name||c}">Edit</button>
                      <button class="btn btn-danger btn-sm"    data-action="delete" data-id="${c.categoryId||c.id||''}">Delete</button>
                    </td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
        ${editModal !== null ? `
          <div class="modal-overlay">
            <div class="modal">
              <div class="modal-title">${editModal.id ? 'Edit category' : 'Add category'}</div>
              <div class="form-group">
                <label class="form-label">Name *</label>
                <input class="form-input" id="cat-name" value="${editModal.name||''}" placeholder="e.g. Mental Health" />
              </div>
              <div id="cat-err" class="form-error" style="display:none"></div>
              <div class="modal-footer">
                <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
                <button class="btn btn-primary"   id="modal-save">Save</button>
              </div>
            </div>
          </div>
        ` : ''}
      `
      document.getElementById('add-btn').addEventListener('click', () => { editModal = { id: null, name: '' }; renderPage() })
      container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id
          if (btn.dataset.action === 'edit') {
            editModal = { id, name: btn.dataset.name }; renderPage()
          } else {
            if (!confirm('Delete this category?')) return
            try { await adminApi.deleteCategory(id); toast('Category deleted.', 'info'); load() }
            catch (e) { toast(e.message || 'Failed.', 'error') }
          }
        })
      })
      if (editModal !== null) {
        document.getElementById('modal-cancel').addEventListener('click', () => { editModal = null; renderPage() })
        document.getElementById('modal-save').addEventListener('click', async () => {
          const name  = document.getElementById('cat-name').value.trim()
          const errEl = document.getElementById('cat-err')
          errEl.style.display = 'none'
          if (!name) { errEl.textContent = 'Name required.'; errEl.style.display = 'block'; return }
          try {
            if (editModal.id) await adminApi.updateCategory(editModal.id, { name })
            else              await adminApi.createCategory({ name })
            toast('Category saved.', 'success'); editModal = null; load()
          } catch (e) { errEl.textContent = e.message || 'Failed.'; errEl.style.display = 'block' }
        })
      }
    }
    load()
  })
}
