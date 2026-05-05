import { renderLayout, toast } from '/app.js'
import { specialistApi, categoryApi } from '/api.js'

export function render(app) {
  renderLayout('Find Specialists', container => {
    let categories = []
    let results    = []
    let loading    = false
    let q          = ''
    let cat        = ''   // category name string — backend matches against specialty
    let level      = ''
    let slotDate   = ''
    let startTime  = ''
    let endTime    = ''

    function doSearch() {
      loading = true
      renderPage()
      const params = {}
      if (q)         params.name      = q
      if (cat)       params.category  = cat
      if (level)     params.level     = level
      if (slotDate) {
        params.date = slotDate
        params.slotDate = slotDate
      }
      if (startTime) params.startTime = startTime
      if (endTime)   params.endTime   = endTime
      specialistApi.search(params).then(data => {
        results = Array.isArray(data) ? data : data?.content || []
        loading = false
        renderPage()
      }).catch(e => {
        loading = false
        toast(e.message || 'Search failed.', 'error')
        renderPage()
      })
    }

    function renderPage() {
      container.innerHTML = `
        <div class="card" style="margin-bottom:20px">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;align-items:flex-end">
            <div>
              <label class="form-label">Name</label>
              <input class="form-input" id="q" placeholder="Search by name..." value="${q}" />
            </div>
            <div>
              <label class="form-label">Category</label>
              <select class="form-select" id="cat">
                <option value="">All categories</option>
                ${categories.map(c => {
                  const name = typeof c === 'string' ? c : (c.name || '')
                  return `<option value="${name}" ${cat === name ? 'selected' : ''}>${name}</option>`
                }).join('')}
              </select>
            </div>
            <div>
              <label class="form-label">Level</label>
              <select class="form-select" id="level-sel">
                <option value="">All levels</option>
                <option value="JUNIOR" ${level === 'JUNIOR' ? 'selected' : ''}>Junior</option>
                <option value="MID"    ${level === 'MID'    ? 'selected' : ''}>Mid</option>
                <option value="SENIOR" ${level === 'SENIOR' ? 'selected' : ''}>Senior</option>
              </select>
            </div>
            <div>
              <label class="form-label">Available date</label>
              <input class="form-input" type="text" id="slot-date" placeholder="yyyy/mm/dd" value="${slotDate.replace(/-/g, '/')}" inputmode="numeric" />
            </div>
            <div>
              <label class="form-label" style="color:${slotDate ? 'inherit' : '#bbb'}">From time</label>
              <input class="form-input" type="time" id="start-time" value="${startTime}" ${!slotDate ? 'disabled style="opacity:0.4"' : ''} />
            </div>
            <div>
              <label class="form-label" style="color:${slotDate ? 'inherit' : '#bbb'}">To time</label>
              <input class="form-input" type="time" id="end-time" value="${endTime}" ${!slotDate ? 'disabled style="opacity:0.4"' : ''} />
            </div>
            <div style="display:flex;gap:8px;align-items:flex-end">
              <button class="btn btn-primary" id="search-btn">Search</button>
              ${slotDate ? `<button class="btn btn-secondary" id="clear-date-btn">Clear</button>` : ''}
            </div>
          </div>
          ${slotDate ? `<div style="margin-top:8px;font-size:12px;color:#8c6a52">
            Showing specialists with available slots on <strong>${slotDate}</strong>${startTime ? ` from ${startTime}` : ''}${endTime ? ` to ${endTime}` : ''}
          </div>` : ''}
        </div>
        <div id="results-area">
          ${loading
            ? '<div class="loading"><div class="spinner"></div><br>Searching...</div>'
            : results.length === 0
              ? '<div class="empty">No specialists found. Try adjusting your filters.</div>'
              : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
                  ${results.map(s => `
                    <div class="specialist-card" onclick="location.hash='#/specialists/${s.specialistId || s.id}'">
                      <div class="specialist-avatar">${(s.name || '?')[0].toUpperCase()}</div>
                      <div class="specialist-info">
                        <h3>${s.name || '—'}</h3>
                        <p>${s.specialty || s.categoryName || '—'}</p>
                        <div class="flex gap-8" style="flex-wrap:wrap;margin-bottom:6px">
                          ${s.qualificationLevel || s.level ? `<span class="tag tag-info">${s.qualificationLevel || s.level}</span>` : ''}
                          ${s.fee != null ? `<span class="tag tag-primary">¥${s.fee} / hour</span>` : ''}
                        </div>
                        ${s.bio ? `<p style="font-size:12px;color:#8c6a52;line-height:1.4;margin-top:4px">${s.bio.slice(0, 80)}${s.bio.length > 80 ? '...' : ''}</p>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>`
          }
        </div>
      `

      document.getElementById('search-btn').addEventListener('click', () => {
        q         = document.getElementById('q').value.trim()
        cat       = document.getElementById('cat').value
        level     = document.getElementById('level-sel').value
        slotDate  = document.getElementById('slot-date').value.trim().replace(/\//g, '-')
        startTime = slotDate ? document.getElementById('start-time').value : ''
        endTime   = slotDate ? document.getElementById('end-time').value   : ''
        doSearch()
      })

      document.getElementById('q').addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('search-btn').click()
      })

      document.getElementById('cat').addEventListener('change', e => {
        cat = e.target.value; doSearch()
      })

      document.getElementById('level-sel').addEventListener('change', e => {
        level = e.target.value; doSearch()
      })

      document.getElementById('slot-date').addEventListener('change', e => {
        slotDate = e.target.value.trim().replace(/\//g, '-')
        if (!slotDate) { startTime = ''; endTime = '' }
        doSearch()
      })

      document.getElementById('slot-date').addEventListener('input', e => {
        const hasDate = !!e.target.value.trim()
        const startEl = document.getElementById('start-time')
        const endEl = document.getElementById('end-time')
        startEl.disabled = !hasDate
        endEl.disabled = !hasDate
        startEl.style.opacity = hasDate ? '' : '0.4'
        endEl.style.opacity = hasDate ? '' : '0.4'
        if (!hasDate) {
          startEl.value = ''
          endEl.value = ''
        }
      })

      const clearBtn = document.getElementById('clear-date-btn')
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          slotDate = ''; startTime = ''; endTime = ''
          doSearch()
        })
      }
    }

    categoryApi.getAll()
      .then(data => { categories = Array.isArray(data) ? data : data?.content || [] })
      .catch(() => {})
      .finally(() => doSearch())
  })
}
