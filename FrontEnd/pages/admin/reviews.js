import { renderLayout, toast } from '/app.js'
import { reviewApi } from '/api.js'

export function render(app) {
  renderLayout('Reviews', container => {
    function load() {
      container.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading...</div>'
      reviewApi.adminGetAll().then(data => {
        const reviews = Array.isArray(data) ? data : data?.content || []
        if (!reviews.length) { container.innerHTML = '<div class="empty">No reviews found.</div>'; return }
        container.innerHTML = `
          <div class="card">
            <div class="card-header"><div class="card-title">All Reviews</div></div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Customer</th><th>Specialist</th><th>Rating</th><th>Comment</th><th>Visible</th><th>Actions</th></tr></thead>
                <tbody>
                  ${reviews.map(r => `<tr>
                    <td>${r.customerName||'—'}</td>
                    <td>${r.specialistName||'—'}</td>
                    <td>${'★'.repeat(r.rating||0)}${'☆'.repeat(5-(r.rating||0))}</td>
                    <td style="max-width:240px">${r.comment||'—'}</td>
                    <td><span class="tag tag-${r.visible?'success':'danger'}">${r.visible?'Visible':'Hidden'}</span></td>
                    <td>
                      <button class="btn btn-sm btn-secondary" data-id="${r.id||r.reviewId}" data-visible="${r.visible}">
                        ${r.visible ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `
        container.querySelectorAll('[data-id]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id      = btn.dataset.id
            const visible = btn.dataset.visible === 'true'
            try {
              await reviewApi.adminSetVisibility(id, !visible)
              toast(`Review ${!visible ? 'shown' : 'hidden'}.`, 'success')
              load()
            } catch (e) { toast(e.message || 'Failed.', 'error') }
          })
        })
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load reviews.</div>' })
    }
    load()
  })
}
