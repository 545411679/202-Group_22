import { renderLayout, toast } from '/app.js'
import { adminApi } from '/api.js'

function statusTag(s) {
  const map = { PENDING: 'warning', CONFIRMED: 'success', COMPLETED: 'info', CANCELLED: 'danger' }
  return `<span class="tag tag-${map[s]||'info'}">${s}</span>`
}

export function render(app) {
  renderLayout('Sessions', container => {
    let sessions = []
    let filterStatus = ''
    let page = 1
    const size = 10

    function load() {
      adminApi.getBookings(filterStatus ? { status: filterStatus } : {}).then(data => {
        sessions = Array.isArray(data) ? data : data?.content || []
        renderPage()
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load sessions.</div>' })
    }

    function renderPage() {
      const totalPages = Math.ceil(sessions.length / size)
      const slice = sessions.slice((page-1)*size, page*size)
      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-title">All Sessions</div>
            <select class="form-select" id="filter-sel" style="width:150px">
              <option value="">All statuses</option>
              ${['PENDING','CONFIRMED','COMPLETED','CANCELLED'].map(s =>
                `<option value="${s}" ${filterStatus===s?'selected':''}>${s}</option>`
              ).join('')}
            </select>
          </div>
          ${!slice.length ? '<div class="empty">No sessions found.</div>' : `
            <div class="table-wrap">
              <table>
                <thead><tr><th>Customer</th><th>Specialist</th><th>Date / Time</th><th>Fee</th><th>Status</th></tr></thead>
                <tbody>
                  ${slice.map(b => `<tr>
                    <td>${b.customerName||'—'}</td>
                    <td>${b.specialistName||'—'}</td>
                    <td>${b.scheduledTime ? new Date(b.scheduledTime).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                    <td>${b.feeAmount != null ? '¥'+b.feeAmount : '—'}</td>
                    <td>${statusTag(b.status)}</td>
                  </tr>`).join('')}
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
      document.getElementById('filter-sel').addEventListener('change', e => { filterStatus = e.target.value; page = 1; load() })
      document.getElementById('pg-prev')?.addEventListener('click', () => { page--; renderPage() })
      document.getElementById('pg-next')?.addEventListener('click', () => { page++; renderPage() })
      container.querySelectorAll('[data-pg]').forEach(btn => btn.addEventListener('click', () => { page = +btn.dataset.pg; renderPage() }))
    }
    load()
  })
}
