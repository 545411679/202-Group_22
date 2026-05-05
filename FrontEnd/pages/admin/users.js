import { renderLayout, toast } from '/app.js'
import { adminApi } from '/api.js'

export function render(app) {
  renderLayout('Users', container => {
    let users = []
    let page = 1
    const size = 15

    function isDisabled(u) {
      return String(u.status || '').toUpperCase() === 'DISABLED'
    }

    function load() {
      adminApi.getUsers({}).then(data => {
        users = Array.isArray(data) ? data : data?.content || []
        renderPage()
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load users.</div>' })
    }

    function renderPage() {
      const totalPages = Math.ceil(users.length / size)
      const slice = users.slice((page-1)*size, page*size)
      container.innerHTML = `
        <div class="card">
          <div class="card-header"><div class="card-title">All Users</div></div>
          ${!slice.length ? '<div class="empty">No users found.</div>' : `
            <div class="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  ${slice.map(u => {
                    const disabled = isDisabled(u)
                    return `<tr>
                    <td>${u.name||'—'}</td>
                    <td>${u.email||'—'}</td>
                    <td><span class="tag tag-info">${u.role||'—'}</span></td>
                    <td><span class="tag tag-${disabled?'danger':'success'}">${disabled?'Disabled':'Active'}</span></td>
                    <td class="row-actions">
                      <button class="btn btn-${disabled?'success':'danger'} btn-sm"
                        data-action="toggle" data-id="${u.userId||u.id}" data-status="${u.status || 'ACTIVE'}">
                        ${disabled?'Enable':'Disable'}
                      </button>
                    </td>
                  </tr>`
                  }).join('')}
                </tbody>
              </table>
            </div>
            ${totalPages > 1 ? `
              <div class="pagination">
                <button class="page-btn" ${page===1?'disabled':''} id="pg-prev">‹</button>
                ${Array.from({length:totalPages},(_,i)=>`<button class="page-btn ${i+1===page?'active':''}" data-pg="${i+1}">${i+1}</button>`).join('')}
                <button class="page-btn" ${page===totalPages?'disabled':''} id="pg-next">›</button>
              </div>
            ` : ''}
          `}
        </div>
      `
      document.getElementById('pg-prev')?.addEventListener('click', () => { page--; renderPage() })
      document.getElementById('pg-next')?.addEventListener('click', () => { page++; renderPage() })
      container.querySelectorAll('[data-pg]').forEach(btn => btn.addEventListener('click', () => { page = +btn.dataset.pg; renderPage() }))
      container.querySelectorAll('[data-action="toggle"]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id      = btn.dataset.id
          const disabled = String(btn.dataset.status || '').toUpperCase() === 'DISABLED'
          try {
            await adminApi.updateUserStatus(id, { status: disabled ? 'ACTIVE' : 'DISABLED' })
            toast(disabled ? 'User enabled.' : 'User disabled.', 'info')
            load()
          } catch (e) { toast(e.message || 'Failed.', 'error') }
        })
      })
    }
    load()
  })
}
