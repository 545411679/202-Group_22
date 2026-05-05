import { announcementApi, fileApi } from '/api.js'

function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
function fmtDate(iso) { if (!iso) return ''; try { return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return iso } }

export const SPARKLE_STYLE_ID = 'announcement-sparkle-style'

export function injectSparkleStyle() {
  if (document.getElementById(SPARKLE_STYLE_ID)) return
  const s = document.createElement('style')
  s.id = SPARKLE_STYLE_ID
  s.textContent = `
    @keyframes ann-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(232,114,42,0.55); }
      70%  { box-shadow: 0 0 0 10px rgba(232,114,42,0); }
      100% { box-shadow: 0 0 0 0 rgba(232,114,42,0); }
    }
    @keyframes ann-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .ann-item {
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #eadfd1;
      background: #fff;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
      position: relative;
    }
    .ann-item:hover { transform: translateY(-1px); border-color: #e8722a; }
    .ann-item.unread {
      border-color: #e8722a;
      background: linear-gradient(90deg, #fff8f1 0%, #fff 50%, #fff8f1 100%);
      background-size: 200% 100%;
      animation: ann-pulse 2s ease-in-out infinite, ann-shimmer 3s linear infinite;
    }
    .ann-unread-dot {
      position: absolute;
      top: 10px; right: 10px;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #e8722a;
      box-shadow: 0 0 6px rgba(232,114,42,0.8);
    }
    .ann-modal-body { white-space: pre-wrap; line-height: 1.6; color: #2d1a0e; font-size: 14px; }
    .ann-modal-img {
      max-width: 100%; max-height: 360px; border-radius: 8px; margin-top: 12px;
      border: 1px solid #eadfd1;
    }
  `
  document.head.appendChild(s)
}

export function renderAnnouncementsCard(hostEl, { limit = 3, showViewAll = true } = {}) {
  injectSparkleStyle()
  hostEl.innerHTML = '<div class="loading" style="padding:20px"><div class="spinner"></div></div>'

  announcementApi.getMine().then(list => {
    const all   = Array.isArray(list) ? list : []
    const shown = limit ? all.slice(0, limit) : all
    const unreadCount = all.filter(a => a.unread).length

    if (!all.length) {
      hostEl.innerHTML = `
        <div class="card" style="margin-bottom:0">
          <div class="card-header">
            <div class="card-title">📢 Announcements</div>
          </div>
          <div class="empty">No announcements yet.</div>
        </div>
      `
      return
    }

    hostEl.innerHTML = `
      <div class="card" style="margin-bottom:0">
        <div class="card-header">
          <div class="card-title">
            📢 Announcements
            ${unreadCount > 0 ? `<span class="tag tag-danger" style="margin-left:8px">${unreadCount} new</span>` : ''}
          </div>
          ${showViewAll ? '<a href="#/announcements" class="btn btn-text btn-sm">View all →</a>' : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${shown.map(a => `
            <div class="ann-item ${a.unread ? 'unread' : ''}" data-id="${a.announcementId}">
              ${a.unread ? '<span class="ann-unread-dot"></span>' : ''}
              <div style="font-weight:600;color:#2d1a0e;margin-bottom:4px;padding-right:20px">${esc(a.title)}</div>
              <div style="font-size:12px;color:#8c6a52;margin-bottom:6px">${fmtDate(a.createdAt)}</div>
              <div style="font-size:13px;color:#5c3e2b;line-height:1.5;max-height:40px;overflow:hidden;text-overflow:ellipsis">${esc(a.body)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `

    hostEl.querySelectorAll('.ann-item').forEach(item => {
      item.addEventListener('click', () => {
        const id  = Number(item.dataset.id)
        const ann = all.find(x => x.announcementId === id)
        if (!ann) return
        openAnnouncementModal(ann, async () => {
          if (ann.unread) {
            try {
              await announcementApi.markRead(id)
              item.classList.remove('unread')
              const dot = item.querySelector('.ann-unread-dot'); if (dot) dot.remove()
              ann.unread = false
              const badge = hostEl.querySelector('.card-header .tag-danger')
              const newCount = all.filter(a => a.unread).length
              if (badge) { if (newCount === 0) badge.remove(); else badge.textContent = `${newCount} new` }
            } catch {}
          }
        })
      })
    })
  }).catch(() => {
    hostEl.innerHTML = '<div class="empty">Failed to load announcements.</div>'
  })
}

export function openAnnouncementModal(ann, onOpened) {
  injectSparkleStyle()
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.innerHTML = `
    <div class="modal" style="max-width:560px">
      <div class="modal-title" style="display:flex;justify-content:space-between;align-items:center">
        <span>${esc(ann.title)}</span>
        <span style="font-size:12px;color:#8c6a52;font-weight:400">${fmtDate(ann.createdAt)}</span>
      </div>
      ${ann.imageUrl ? `<img src="${fileApi.url(ann.imageUrl)}" class="ann-modal-img" alt="" />` : ''}
      <div class="ann-modal-body" style="margin-top:12px">${esc(ann.body)}</div>
      <div class="modal-footer">
        <button class="btn btn-primary" data-close>Got it</button>
      </div>
    </div>
  `
  document.body.appendChild(overlay)
  const close = () => overlay.remove()
  overlay.addEventListener('click', e => { if (e.target === overlay) close() })
  overlay.querySelector('[data-close]').addEventListener('click', close)
  if (typeof onOpened === 'function') onOpened()
}
