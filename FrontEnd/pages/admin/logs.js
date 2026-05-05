import { renderLayout, toast } from '/app.js'
import { adminApi } from '/api.js'

export function render(app) {
  renderLayout('Activity Logs', container => {
    let startDate = ''
    let endDate = ''

    function load() {
      container.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading...</div>'
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate)   params.endDate   = endDate
      adminApi.getLogs(params).then(data => {
        const logs = Array.isArray(data) ? data : data?.content || []
        container.innerHTML = `
          <div class="card">
            <div class="card-header">
              <div class="card-title">Activity Logs</div>
              <div class="flex gap-8">
                <input type="date" class="form-input" id="start-date" value="${startDate}" style="width:150px" />
                <input type="date" class="form-input" id="end-date"   value="${endDate}"   style="width:150px" />
                <button class="btn btn-primary btn-sm" id="filter-btn">Filter</button>
                <button class="btn btn-secondary btn-sm" id="reset-btn">Reset</button>
              </div>
            </div>
            ${!logs.length ? '<div class="empty">No logs found.</div>' : `
              <div class="table-wrap">
                <table>
                  <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Detail</th></tr></thead>
                  <tbody>
                    ${logs.map(l => `<tr>
                      <td style="white-space:nowrap">${l.createdAt ? new Date(l.createdAt).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                      <td>${l.userName||l.userId||'—'}</td>
                      <td><span class="tag tag-info">${l.action||'—'}</span></td>
                      <td style="max-width:320px">${l.detail||l.description||'—'}</td>
                    </tr>`).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        `
        document.getElementById('filter-btn').addEventListener('click', () => {
          startDate = document.getElementById('start-date').value
          endDate   = document.getElementById('end-date').value
          load()
        })
        document.getElementById('reset-btn').addEventListener('click', () => {
          startDate = ''; endDate = ''; load()
        })
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load logs.</div>' })
    }
    load()
  })
}
