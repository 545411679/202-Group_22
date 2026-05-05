import { renderLayout, toast } from '/app.js'
import { adminApi, fileApi } from '/api.js'

function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

export function render(app) {
  renderLayout('Profile Approvals', container => {
    let profiles = []
    let page = 1
    const size = 10
    let rejectModal = null
    let detailModal = null
    let certificateModal = null

    function load() {
      adminApi.getPendingProfiles().then(data => {
        profiles = Array.isArray(data) ? data : data?.content || []
        renderPage()
      }).catch(() => { container.innerHTML = '<div class="empty">Failed to load profiles.</div>' })
    }

    function renderPage() {
      const totalPages = Math.ceil(profiles.length / size)
      const slice = profiles.slice((page-1)*size, page*size)
      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-title">Pending specialist profiles</div>
            <button class="btn btn-secondary btn-sm" id="refresh-btn">Refresh</button>
          </div>
          ${!slice.length ? '<div class="empty">No pending profiles.</div>' : `
            <div class="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Specialty</th><th>Level</th><th>Fee (¥/hr)</th><th>Certs</th><th>Actions</th></tr></thead>
                <tbody>
                  ${slice.map(p => `<tr>
                    <td>${esc(p.name)||'—'}</td>
                    <td>${esc(p.specialty)||'—'}</td>
                    <td>${esc(p.qualificationLevel)||'—'}</td>
                    <td>${p.fee??'—'}</td>
                    <td>${Array.isArray(p.certificates) ? p.certificates.length : 0}</td>
                    <td class="row-actions">
                      <button class="btn btn-primary btn-sm"  data-action="view"    data-id="${p.specialistId||p.id}">View</button>
                      <button class="btn btn-success btn-sm"  data-action="approve" data-id="${p.specialistId||p.id}">Approve</button>
                      <button class="btn btn-danger btn-sm"   data-action="reject"  data-id="${p.specialistId||p.id}">Reject</button>
                    </td>
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
        ${detailModal ? renderDetailModal(detailModal) : ''}
        ${certificateModal ? renderCertificateModal(certificateModal) : ''}
        ${rejectModal ? renderRejectModal() : ''}
      `
      bindEvents()
    }

    function renderDetailModal(p) {
      const certs = Array.isArray(p.certificates) ? p.certificates : []
      return `
        <div class="modal-overlay" data-modal="detail">
          <div class="modal" style="max-width:620px">
            <div class="modal-title" style="display:flex;justify-content:space-between;align-items:center">
              <span>Specialist profile</span>
              <button class="btn btn-text btn-sm" data-close="detail">✕</button>
            </div>
            <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px">
              <div class="specialist-avatar" style="width:64px;height:64px;font-size:26px">${(p.name||'?')[0].toUpperCase()}</div>
              <div style="flex:1;min-width:200px">
                <h3 style="font-size:18px;font-weight:700;margin-bottom:4px">${esc(p.name)||'—'}</h3>
                <div style="color:#8c6a52;margin-bottom:8px">${esc(p.specialty)||'—'}</div>
                <div class="flex gap-8" style="flex-wrap:wrap">
                  ${p.qualificationLevel ? `<span class="tag tag-info">${esc(p.qualificationLevel)}</span>` : ''}
                  ${p.fee != null ? `<span class="tag tag-primary">¥${p.fee} / hour</span>` : ''}
                  ${p.status ? `<span class="tag tag-warning">${esc(p.status)}</span>` : ''}
                </div>
              </div>
            </div>

            <div style="margin-bottom:16px">
              <div style="font-weight:600;color:#2d1a0e;margin-bottom:6px">Bio</div>
              <div style="white-space:pre-wrap;background:#faf6f1;padding:10px 12px;border-radius:6px;font-size:13px;line-height:1.6;color:#2d1a0e;min-height:40px">${esc(p.bio)||'— (no bio provided)'}</div>
            </div>

            <div style="margin-bottom:16px">
              <div style="font-weight:600;color:#2d1a0e;margin-bottom:6px">Certificates (${certs.length})</div>
              ${certs.length ? `
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                  ${certs.map(f => `
                    <button type="button" data-cert="${esc(f)}"
                       style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:#faf6f1;border:1px solid #eadfd2;border-radius:6px;font-size:13px;color:#2d1a0e;text-decoration:none;cursor:pointer">
                      <span>📎</span><span style="text-decoration:underline">${esc(f)}</span>
                    </button>
                  `).join('')}
                </div>
              ` : '<div class="text-muted text-sm">No certificates uploaded.</div>'}
            </div>

            ${p.rejectionReason ? `
              <div style="margin-bottom:16px;padding:10px 12px;background:#fff1f0;border-left:3px solid #cf1322;border-radius:4px">
                <div style="font-weight:600;color:#5c0011;margin-bottom:4px">Previous rejection reason</div>
                <div style="font-size:13px;color:#2d1a0e">${esc(p.rejectionReason)}</div>
              </div>
            ` : ''}

            <div class="modal-footer">
              <button class="btn btn-secondary" data-close="detail">Close</button>
              <button class="btn btn-danger"    data-action="reject-from-modal"  data-id="${p.specialistId||p.id}">Reject</button>
              <button class="btn btn-success"   data-action="approve-from-modal" data-id="${p.specialistId||p.id}">Approve</button>
            </div>
          </div>
        </div>
      `
    }

    function renderCertificateModal(filename) {
      return `
        <div class="modal-overlay" data-modal="certificate" style="z-index:1200">
          <div class="modal" style="max-width:820px">
            <div class="modal-title" style="display:flex;justify-content:space-between;align-items:center;gap:16px">
              <span>Certificate preview</span>
              <button class="btn btn-text btn-sm" data-close="certificate">Close</button>
            </div>
            <div style="margin-bottom:10px;font-size:13px;color:#8c6a52;word-break:break-all">${esc(filename)}</div>
            <div style="background:#faf6f1;border:1px solid #eadfd2;border-radius:8px;padding:12px;max-height:70vh;overflow:auto">
              <img src="${fileApi.url(filename)}" alt="${esc(filename)}" style="display:block;max-width:100%;height:auto;margin:0 auto;border-radius:6px;background:#fff" />
            </div>
          </div>
        </div>
      `
    }

    function renderRejectModal() {
      return `
        <div class="modal-overlay" data-modal="reject">
          <div class="modal">
            <div class="modal-title">Reject profile</div>
            <div class="form-group">
              <label class="form-label">Reason *</label>
              <textarea class="form-textarea" id="reject-reason" placeholder="Explain why..." rows="3"></textarea>
            </div>
            <div id="reject-err" class="form-error" style="display:none"></div>
            <div class="modal-footer">
              <button class="btn btn-secondary" id="reject-cancel">Cancel</button>
              <button class="btn btn-danger"    id="reject-confirm">Reject</button>
            </div>
          </div>
        </div>
      `
    }

    function bindEvents() {
      document.getElementById('refresh-btn')?.addEventListener('click', load)
      document.getElementById('pg-prev')?.addEventListener('click', () => { page--; renderPage() })
      document.getElementById('pg-next')?.addEventListener('click', () => { page++; renderPage() })
      container.querySelectorAll('[data-pg]').forEach(btn => btn.addEventListener('click', () => { page = +btn.dataset.pg; renderPage() }))

      container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id     = btn.dataset.id
          const action = btn.dataset.action
          if (action === 'view') {
            const p = profiles.find(x => String(x.specialistId || x.id) === String(id))
            if (p) { detailModal = p; renderPage() }
          } else if (action === 'approve' || action === 'approve-from-modal') {
            try { await adminApi.approveProfile(id); toast('Profile approved.', 'success'); detailModal = null; load() }
            catch (e) { toast(e.message || 'Failed.', 'error') }
          } else if (action === 'reject' || action === 'reject-from-modal') {
            rejectModal = { specialistId: id }
            renderPage()
          }
        })
      })

      container.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.close === 'detail') { detailModal = null; renderPage() }
          if (btn.dataset.close === 'certificate') { certificateModal = null; renderPage() }
        })
      })

      container.querySelectorAll('[data-cert]').forEach(btn => {
        btn.addEventListener('click', () => {
          certificateModal = btn.dataset.cert
          renderPage()
        })
      })

      const detailOverlay = container.querySelector('[data-modal="detail"]')
      if (detailOverlay) detailOverlay.addEventListener('click', e => {
        if (e.target === detailOverlay) { detailModal = null; renderPage() }
      })

      const certificateOverlay = container.querySelector('[data-modal="certificate"]')
      if (certificateOverlay) certificateOverlay.addEventListener('click', e => {
        if (e.target === certificateOverlay) { certificateModal = null; renderPage() }
      })

      if (rejectModal) {
        document.getElementById('reject-cancel').addEventListener('click', () => { rejectModal = null; renderPage() })
        document.getElementById('reject-confirm').addEventListener('click', async () => {
          const reason = document.getElementById('reject-reason').value.trim()
          const errEl  = document.getElementById('reject-err')
          errEl.style.display = 'none'
          if (!reason) { errEl.textContent = 'Reason required.'; errEl.style.display = 'block'; return }
          try {
            await adminApi.rejectProfile(rejectModal.specialistId, reason)
            toast('Profile rejected.', 'info'); rejectModal = null; detailModal = null; load()
          } catch (e) { errEl.textContent = e.message || 'Failed.'; errEl.style.display = 'block' }
        })
      }
    }

    load()
  })
}
