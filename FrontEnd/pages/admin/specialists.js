import { renderLayout, toast } from '/app.js'
import { adminApi } from '/api.js'

export function render(app) {
  renderLayout('Specialist Approvals', container => {
    function load() {
      container.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading...</div>'
      adminApi.getPendingSpecialists().then(data => {
        const list = Array.isArray(data) ? data : data?.content || []
        if (!list.length) {
          container.innerHTML = `
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">Specialists</div>
                  <div class="text-muted text-sm">No pending approvals. Use Users to disable or enable specialist accounts.</div>
                </div>
                <a class="btn btn-primary btn-sm" href="#/admin/users">Manage users</a>
              </div>
            </div>`
          return
        }
        container.innerHTML = `
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Pending Specialist Approvals</div>
                <div class="text-muted text-sm">Use Users to disable or enable approved specialist accounts.</div>
              </div>
              <a class="btn btn-primary btn-sm" href="#/admin/users">Manage users</a>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Specialty</th><th>Bio</th><th>Fee</th><th>Actions</th></tr></thead>
                <tbody>
                  ${list.map(s => `<tr>
                    <td>${s.name||'—'}</td>
                    <td>${s.specialty||'—'}</td>
                    <td style="max-width:200px">${s.bio||'—'}</td>
                    <td>${s.fee != null ? '¥'+s.fee : '—'}</td>
                    <td class="row-actions">
                      <button class="btn btn-success btn-sm" data-action="approve" data-id="${s.specialistId||s.id}">Approve</button>
                      <button class="btn btn-danger btn-sm"  data-action="reject"  data-id="${s.specialistId||s.id}">Reject</button>
                    </td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `
        container.querySelectorAll('[data-action]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id     = btn.dataset.id
            const action = btn.dataset.action
            if (action === 'approve') {
              try {
                await adminApi.reviewSpecialist(id, { status: 'APPROVED' })
                toast('Specialist approved.', 'success')
                load()
              } catch (e) { toast(e.message || 'Failed.', 'error') }
            } else {
              const reason = prompt('Rejection reason (optional):') ?? ''
              try {
                await adminApi.reviewSpecialist(id, { status: 'REJECTED', reason })
                toast('Specialist rejected.', 'info')
                load()
              } catch (e) { toast(e.message || 'Failed.', 'error') }
            }
          })
        })
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load specialists.</div>' })
    }
    load()
  })
}
