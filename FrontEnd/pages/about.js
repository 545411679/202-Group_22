import { specialistApi, reviewApi, categoryApi } from '/api.js'

const PALETTES = [
  ['#c4825a','#8b5e3c'],
  ['#6b8fa8','#4a6d85'],
  ['#7a9e7e','#5a7d5e'],
  ['#9b7bb8','#7a5a97'],
  ['#b89460','#8a6e3a'],
  ['#b05b6b','#8a3e4e'],
]

const FALLBACK_CATS = [
  'General Consultation','Mental Health','Nutrition & Diet',
  'Legal Advice','Career Coaching','Financial Planning',
]

const FALLBACK_SPECIALISTS = [
  { specialistId:1, name:'Dr. Wei Chen',  specialty:'General Consultation', qualificationLevel:'Senior',       fee:200 },
  { specialistId:2, name:'Sarah Miller',  specialty:'Mental Health',        qualificationLevel:'Expert',       fee:280 },
  { specialistId:3, name:'James Park',    specialty:'Career Coaching',      qualificationLevel:'Senior',       fee:350 },
  { specialistId:4, name:'Dr. Fang Liu',  specialty:'Nutrition & Diet',     qualificationLevel:'Intermediate', fee:150 },
  { specialistId:5, name:'Emily Hart',    specialty:'Legal Advice',         qualificationLevel:'Senior',       fee:400 },
  { specialistId:6, name:'Marcus Okafor', specialty:'Financial Planning',   qualificationLevel:'Expert',       fee:320 },
]

const FALLBACK_REVIEWS = [
  { customerName:'Alice Chen', specialty:'General Consultation', rating:5, comment:"I found the right specialist in under five minutes. The booking was confirmed same day and the session was exactly what I needed." },
  { customerName:'Bob Zhang',  specialty:'Career Coaching',      rating:5, comment:"The status tracking is genuinely useful. I knew exactly where my booking stood — no emails, no chasing." },
  { customerName:'Carol Wang', specialty:'Mental Health',        rating:4, comment:"As a client, I appreciated how transparent the booking flow was. Confirmed quickly, and the specialist came prepared." },
]

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}

let state = { name:'', category:'', level:'', date:'' }
let nameTimer = null

function injectStyles() {
  if (document.getElementById('lv2-style')) return
  const s = document.createElement('style')
  s.id = 'lv2-style'
  s.textContent = LANDING_CSS
  document.head.appendChild(s)
}

export function render(app) {
  state = { name:'', category:'', level:'', date:'' }
  injectStyles()

  app.innerHTML = `
<div class="lv2">
  <header class="site-header" id="siteHeader">
    <div class="inner">
      <a class="brand" href="#/">
        <span class="brand-mark">c</span>
        <span class="brand-name">Consilium</span>
      </a>
      <nav class="nav-primary">
        <a href="#how-it-works">How it works</a>
        <a href="#platform">Platform</a>
        <a href="#specialists">Specialists</a>
        <a href="#reviews">Reviews</a>
      </nav>
      <a class="btn-pill" href="#/login">Sign in <span class="arrow">→</span></a>
    </div>
  </header>

  <section class="hero">
    <img src="/hero.jpg" alt="Two professionals in deep conversation" width="1920" height="1080" />
    <div class="veil"></div>
    <div class="content">
      <div class="reveal" style="max-width:56rem">
        <p class="text-eyebrow eyebrow">Project · No. 0001 — Consilium</p>
        <h1>Clarity begins with<br />the right <em>conversation.</em></h1>
        <p class="lead">
          Consilium connects you with verified specialists across every field —
          book a consultation that fits your schedule, online or in person.
        </p>
        <div class="cta-row">
          <a href="#specialists" class="btn-solid">Browse specialists <span>→</span></a>
          <a href="#how-it-works" class="btn-outline-hero">How it works</a>
        </div>
      </div>
    </div>
    <div class="corner left"><p class="text-eyebrow">Edition I · MMXXVI</p></div>
    <div class="corner right"><p class="text-eyebrow">Search · Book · Meet</p></div>
  </section>

  <div class="marquee-band">
    <div class="marquee-track" id="marqueeTrack">
      <span>General Consultation<span class="dot"></span></span>
      <span>Mental Health<span class="dot"></span></span>
      <span>Nutrition &amp; Diet<span class="dot"></span></span>
      <span>Legal Advice<span class="dot"></span></span>
      <span>Career Coaching<span class="dot"></span></span>
      <span>Financial Planning<span class="dot"></span></span>
      <span>General Consultation<span class="dot"></span></span>
      <span>Mental Health<span class="dot"></span></span>
      <span>Nutrition &amp; Diet<span class="dot"></span></span>
      <span>Legal Advice<span class="dot"></span></span>
      <span>Career Coaching<span class="dot"></span></span>
      <span>Financial Planning<span class="dot"></span></span>
    </div>
  </div>

  <section id="how-it-works" class="section">
    <div class="container">
      <div class="section-head">
        <p class="text-eyebrow eyebrow">§ 01 — How it works</p>
        <h2>Three steps to the<br /><em>right answer.</em></h2>
      </div>
      <div class="services-grid">
        <article class="service-card">
          <div class="img-wrap">
            <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80" alt="Person searching on a laptop" loading="lazy" />
            <span class="num">01</span>
          </div>
          <h3>Search</h3>
          <p>Filter by category, qualification level, and available date. Every profile shows verified credentials and a transparent fee.</p>
          <a href="#specialists" class="link-underline">Find a specialist <span>→</span></a>
        </article>
        <article class="service-card">
          <div class="img-wrap">
            <img src="https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80" alt="Selecting a time slot" loading="lazy" />
            <span class="num">02</span>
          </div>
          <h3>Book</h3>
          <p>Choose an open slot that fits your calendar. Select online or in-person and submit your booking in under two minutes.</p>
          <a href="#specialists" class="link-underline">Book a slot <span>→</span></a>
        </article>
        <article class="service-card">
          <div class="img-wrap">
            <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80" alt="Client and specialist meeting" loading="lazy" />
            <span class="num">03</span>
          </div>
          <h3>Meet</h3>
          <p>Your specialist confirms the session with meeting details. Track status in real time from booked through conducted.</p>
          <a href="#how-it-works" class="link-underline">Learn more <span>→</span></a>
        </article>
      </div>
    </div>
  </section>

  <section id="platform" class="section section-dark">
    <div class="container">
      <div class="section-head">
        <p class="text-eyebrow eyebrow">§ 02 — Our platform</p>
        <h2>Built for trust,<br /><em>not just convenience.</em></h2>
      </div>
      <div class="promise-grid">
        <div class="promise-cell"><p class="key">— 01</p><h3>Vetted specialists</h3><p>Every specialist on the platform is credential-verified and assigned a qualification level before their first listing.</p></div>
        <div class="promise-cell"><p class="key">— 02</p><h3>Live status tracking</h3><p>Watch your booking move from Pending → Confirmed → Conducted. No wondering — every step is surfaced in your dashboard.</p></div>
        <div class="promise-cell"><p class="key">— 03</p><h3>Online &amp; offline</h3><p>Specialists share a meeting link or address when they confirm. Your format, your preference — the platform handles both.</p></div>
        <div class="promise-cell"><p class="key">— 04</p><h3>Verified reviews</h3><p>Clients can only leave a review after a session is marked Conducted. Every rating you read is from a real consultation.</p></div>
      </div>
    </div>
  </section>

  <section id="specialists" class="section">
    <div class="container">
      <div class="section-head">
        <p class="text-eyebrow eyebrow">§ 03 — Directory</p>
        <h2>Find someone you would<br /><em>actually trust.</em></h2>
      </div>
      <div class="search-bar">
        <div class="field">
          <span class="field-label">Search</span>
          <input id="nameInput" type="text" placeholder="A name, a field, a need…" autocomplete="off" />
        </div>
        <button class="btn-dark" type="button" id="searchBtn">Search directory →</button>
      </div>
      <div class="filter-rows">
        <div class="filter-row">
          <span class="filter-row-label">Category</span>
          <div class="chips" id="catChips">
            <button class="chip active" data-cat="">All</button>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-row-label">Level</span>
          <div class="chips" id="levelChips">
            <button class="chip active" data-level="">All levels</button>
            <button class="chip" data-level="JUNIOR">Junior</button>
            <button class="chip" data-level="MID">Mid</button>
            <button class="chip" data-level="SENIOR">Senior</button>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-row-label">Available on</span>
          <div class="date-wrap">
            <input id="dateInput" class="date-input-field" type="date" aria-label="Filter by available date" />
            <button class="date-clear-btn" id="dateClearBtn" type="button" style="display:none">Clear ×</button>
          </div>
        </div>
      </div>
      <div class="specialists-grid" id="specialistGrid">
        <p class="grid-loading">Loading specialists…</p>
      </div>
      <div class="see-all">
        <a href="#/login">View all specialists <span>→</span></a>
      </div>
    </div>
  </section>

  <section id="reviews" class="section section-secondary">
    <div class="container">
      <div class="section-head">
        <p class="text-eyebrow eyebrow">§ 04 — In their words</p>
        <h2>Clarity, delivered.<br /><em>In their own words.</em></h2>
      </div>
      <div class="reviews-grid" id="reviewsGrid">
        <p class="grid-loading">Loading reviews…</p>
      </div>
      <div class="numbers">
        <div><p class="stat">184</p><p class="text-eyebrow label">Specialists</p></div>
        <div><p class="stat">12,400+</p><p class="text-eyebrow label">Sessions</p></div>
        <div><p class="stat">4.92</p><p class="text-eyebrow label">Average rating</p></div>
        <div><p class="stat">98%</p><p class="text-eyebrow label">Would return</p></div>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <div class="inner">
      <div class="footer-grid">
        <div>
          <p class="text-eyebrow eyebrow">Begin a conversation</p>
          <h2>The right person,<br /><em>right now.</em></h2>
          <a href="#/login" class="footer-signin">Sign in to book <span>→</span></a>
        </div>
        <div class="footer-col">
          <p class="text-eyebrow eyebrow">Company</p>
          <ul><li>About</li><li>CPT202 Group 22</li><li>XJTLU</li></ul>
        </div>
        <div class="footer-col">
          <p class="text-eyebrow eyebrow">Index</p>
          <ul><li>Privacy</li><li>Terms</li></ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© <span id="year"></span> Consilium · CPT202 Group 22</p>
        <p class="lv2-mono">Project · 0001 · Edition I</p>
      </div>
    </div>
  </footer>
</div>`

  document.getElementById('year').textContent = new Date().getFullYear()
  initHeader()
  initMarquee()
  initFilters()
  loadSpecialists()
  loadReviews()

  document.getElementById('specialistGrid').addEventListener('click', e => {
    if (e.target.closest('.view')) location.hash = '#/login'
  })
}

function initHeader() {
  const header = document.getElementById('siteHeader')
  if (!header) return
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40) }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  window.addEventListener('hashchange', () => window.removeEventListener('scroll', onScroll), { once: true })
}

async function initMarquee() {
  let cats = FALLBACK_CATS
  try {
    const data = await categoryApi.getAll()
    if (Array.isArray(data) && data.length) cats = data.map(c => typeof c === 'string' ? c : c.name || String(c))
  } catch (_) {}
  const track = document.getElementById('marqueeTrack')
  if (!track) return
  track.innerHTML = [...cats, ...cats].map(c => `<span>${esc(c)}<span class="dot"></span></span>`).join('')
}

async function initFilters() {
  let cats = FALLBACK_CATS
  try {
    const data = await categoryApi.getAll()
    if (Array.isArray(data) && data.length) cats = data.map(c => typeof c === 'string' ? c : c.name || String(c))
  } catch (_) {}

  const catContainer = document.getElementById('catChips')
  if (catContainer) {
    catContainer.innerHTML = `<button class="chip active" data-cat="">All</button>` +
      cats.map(c => `<button class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join('')
    catContainer.addEventListener('click', e => {
      const chip = e.target.closest('.chip')
      if (!chip) return
      catContainer.querySelectorAll('.chip').forEach(b => b.classList.remove('active'))
      chip.classList.add('active')
      state.category = chip.dataset.cat
      loadSpecialists()
    })
  }

  const levelContainer = document.getElementById('levelChips')
  if (levelContainer) {
    levelContainer.addEventListener('click', e => {
      const chip = e.target.closest('.chip')
      if (!chip) return
      levelContainer.querySelectorAll('.chip').forEach(b => b.classList.remove('active'))
      chip.classList.add('active')
      state.level = chip.dataset.level
      loadSpecialists()
    })
  }

  const nameInput = document.getElementById('nameInput')
  const searchBtn = document.getElementById('searchBtn')
  if (nameInput && searchBtn) {
    const trigger = () => { state.name = nameInput.value.trim(); loadSpecialists() }
    nameInput.addEventListener('input', () => { clearTimeout(nameTimer); nameTimer = setTimeout(trigger, 420) })
    searchBtn.addEventListener('click', () => { clearTimeout(nameTimer); trigger() })
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(nameTimer); trigger() } })
  }

  const dateInput = document.getElementById('dateInput')
  const clearBtn  = document.getElementById('dateClearBtn')
  if (dateInput && clearBtn) {
    dateInput.addEventListener('change', () => {
      state.date = dateInput.value
      clearBtn.style.display = state.date ? 'inline' : 'none'
      loadSpecialists()
    })
    clearBtn.addEventListener('click', () => {
      dateInput.value = ''; state.date = ''
      clearBtn.style.display = 'none'
      loadSpecialists()
    })
  }
}

async function loadSpecialists() {
  const grid = document.getElementById('specialistGrid')
  if (!grid) return
  grid.innerHTML = '<p class="grid-loading">Loading specialists…</p>'

  let list = FALLBACK_SPECIALISTS
  try {
    const params = {}
    if (state.name)     params.name     = state.name
    if (state.category) params.category = state.category
    if (state.level)    params.level    = state.level
    if (state.date)     params.slotDate = state.date
    const data = await specialistApi.search(params)
    const arr = Array.isArray(data) ? data : (data?.content || data?.data || [])
    if (arr.length) list = arr
  } catch (_) {}

  if (!list.length) { grid.innerHTML = '<p class="grid-empty">No specialists match your filters.</p>'; return }
  grid.innerHTML = list.slice(0, 8).map((sp, i) => buildCard(sp, i)).join('')
}

function buildCard(sp, idx) {
  const palette = PALETTES[idx % PALETTES.length]
  const initial = (sp.name || '?').trim().charAt(0).toUpperCase()
  const fee     = sp.fee != null ? `¥${sp.fee}/hr` : '—'
  const level   = sp.qualificationLevel || sp.level || ''
  const cat     = sp.specialty || sp.specialtyCategory || ''
  const num     = String(idx + 1).padStart(2, '0')
  return `
<article class="specialist">
  <div class="img-wrap avatar-wrap" style="--av-c1:${palette[0]};--av-c2:${palette[1]}">
    <span class="avatar-initial">${esc(initial)}</span>
    <span class="badge">${num}</span>
  </div>
  <div class="meta">
    <h3>${esc(sp.name || 'Specialist')}</h3>
    <span class="rate">${esc(fee)}</span>
  </div>
  <p class="field">${esc(cat)}${level ? ' · ' + esc(level) : ''}</p>
  <button type="button" class="view">View profile →</button>
</article>`
}

async function loadReviews() {
  let list = FALLBACK_REVIEWS
  try {
    const data = await reviewApi.getRecentReviews()
    if (Array.isArray(data) && data.length) list = data
  } catch (_) {}
  const grid = document.getElementById('reviewsGrid')
  if (!grid) return
  grid.innerHTML = list.slice(0, 3).map((r, i) => buildReview(r, i)).join('')
}

function buildReview(r, i) {
  const num      = `— ${String(i + 1).padStart(2, '0')}`
  const comment  = r.comment || r.content || ''
  const customer = r.customerName || r.clientName || 'Client'
  const role     = r.specialty || r.specialistSpecialty || (r.specialistName ? `Specialist · ${r.specialistName}` : 'Platform client')
  return `
<figure class="review">
  <p class="num">${num}</p>
  <blockquote><span class="q">“</span>${esc(comment)}<span class="q">”</span></blockquote>
  <figcaption>
    <p class="name">${esc(customer)}</p>
    <p class="role">${esc(role)}</p>
  </figcaption>
</figure>`
}

/* ── Scoped CSS (all rules prefixed with .lv2 to avoid conflicts) ── */

const LANDING_CSS = `
.lv2 {
  --background:       oklch(0.97 0.012 80);
  --foreground:       oklch(0.18 0.015 50);
  --secondary:        oklch(0.92 0.018 75);
  --muted:            oklch(0.93 0.015 75);
  --muted-foreground: oklch(0.45 0.025 55);
  --clay:             oklch(0.55 0.16 38);
  --clay-foreground:  oklch(0.97 0.012 80);
  --border:           oklch(0.85 0.015 75);
  --font-display: "Fraunces", "Cormorant Garamond", Georgia, serif;
  --font-sans:    "Inter", "Helvetica Neue", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;
  font-family: var(--font-sans);
  background: var(--background);
  color: var(--foreground);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "ss01","cv11";
}
.lv2 img { display: block; max-width: 100%; height: auto; }
.lv2 a { color: inherit; text-decoration: none; }
.lv2 button { font: inherit; color: inherit; background: none; cursor: pointer; }
.lv2 input { font: inherit; color: inherit; background: transparent; outline: none; border: 0; }
.lv2 em { font-style: normal; }
.lv2 ul { list-style: none; padding: 0; margin: 0; }

.lv2 .text-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.7rem; letter-spacing: 0.18em;
  text-transform: uppercase; font-weight: 500;
}
.lv2-mono { font-family: "JetBrains Mono", ui-monospace, monospace; }

/* layout */
.lv2 .container { max-width: 1600px; margin: 0 auto; padding: 0 1.5rem; }
@media (min-width: 768px) { .lv2 .container { padding: 0 3rem; } }

/* header */
.lv2 .site-header {
  position: fixed; inset: 0 0 auto 0; z-index: 50;
  transition: background-color .5s, border-color .5s, backdrop-filter .5s;
}
.lv2 .site-header.scrolled {
  background: color-mix(in oklab, var(--background) 85%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in oklab, var(--border) 60%, transparent);
}
.lv2 .site-header .inner {
  max-width: 1600px; margin: 0 auto; padding: 1.25rem 1.5rem;
  display: flex; align-items: center; justify-content: space-between;
}
@media (min-width: 768px) { .lv2 .site-header .inner { padding: 1.5rem 3rem; } }
.lv2 .brand { display: inline-flex; align-items: center; gap: .5rem; }
.lv2 .brand-mark {
  width: 1.75rem; height: 1.75rem;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px; background: var(--clay); color: var(--clay-foreground);
  font-family: var(--font-display); font-size: .9rem;
}
.lv2 .brand-name { font-family: var(--font-display); font-size: 1.25rem; letter-spacing: -0.02em; }
.lv2 .nav-primary { display: none; gap: 2.25rem; align-items: center; }
.lv2 .nav-primary a { font-size: .875rem; transition: color .2s; }
.lv2 .nav-primary a:hover { color: var(--clay); }
@media (min-width: 768px) { .lv2 .nav-primary { display: inline-flex; } }
.lv2 .btn-pill {
  display: inline-flex; align-items: center; gap: .5rem;
  border: 1px solid var(--foreground); border-radius: 999px;
  padding: .625rem 1.25rem; font-size: .875rem; font-weight: 500;
  transition: background-color .2s, color .2s;
}
.lv2 .btn-pill:hover { background: var(--foreground); color: var(--background); }
.lv2 .btn-pill .arrow { transition: transform .2s; }
.lv2 .btn-pill:hover .arrow { transform: translateX(2px); }

/* hero */
.lv2 .hero {
  position: relative; height: 100svh; min-height: 640px;
  width: 100%; overflow: hidden;
  background: var(--foreground); color: var(--background);
}
.lv2 .hero img {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover; opacity: .85;
}
.lv2 .hero .veil {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom,
    color-mix(in oklab, var(--foreground) 10%, transparent),
    color-mix(in oklab, var(--foreground) 20%, transparent),
    color-mix(in oklab, var(--foreground) 72%, transparent)
  );
}
.lv2 .hero .content {
  position: relative; z-index: 1; height: 100%;
  max-width: 1600px; margin: 0 auto; padding: 0 1.5rem 4rem;
  display: flex; flex-direction: column; justify-content: flex-end;
}
@media (min-width: 768px) { .lv2 .hero .content { padding: 0 3rem 6rem; } }
.lv2 .hero .eyebrow { color: color-mix(in oklab, var(--background) 80%, transparent); }
.lv2 .hero h1 {
  margin-top: 1.5rem; font-family: var(--font-display); font-weight: 400;
  font-size: 3.25rem; line-height: .92; letter-spacing: -0.02em; max-width: 56rem;
}
@media (min-width: 768px)  { .lv2 .hero h1 { font-size: 6.5rem; } }
@media (min-width: 1024px) { .lv2 .hero h1 { font-size: 8rem; } }
.lv2 .hero h1 em { color: var(--clay); }
.lv2 .hero p.lead {
  margin-top: 2rem; max-width: 36rem; font-size: 1rem;
  color: color-mix(in oklab, var(--background) 85%, transparent);
}
@media (min-width: 768px) { .lv2 .hero p.lead { font-size: 1.125rem; } }
.lv2 .hero .cta-row { margin-top: 2.5rem; display: flex; flex-wrap: wrap; gap: 1rem; }
.lv2 .btn-solid, .lv2 .btn-outline-hero {
  display: inline-flex; align-items: center; gap: .5rem;
  border-radius: 999px; padding: .875rem 1.75rem;
  font-size: .875rem; font-weight: 500;
  transition: background-color .2s, color .2s, border-color .2s;
}
.lv2 .btn-solid { background: var(--background); color: var(--foreground); }
.lv2 .btn-solid:hover { background: var(--clay); color: var(--clay-foreground); }
.lv2 .btn-outline-hero {
  border: 1px solid color-mix(in oklab, var(--background) 40%, transparent);
  color: var(--background);
}
.lv2 .btn-outline-hero:hover {
  border-color: var(--background);
  background: color-mix(in oklab, var(--background) 10%, transparent);
}
.lv2 .hero .corner {
  position: absolute; top: 6rem; z-index: 1;
  color: color-mix(in oklab, var(--background) 70%, transparent); display: none;
}
@media (min-width: 768px) { .lv2 .hero .corner { display: block; } }
.lv2 .hero .corner.left  { left: 3rem; }
.lv2 .hero .corner.right { right: 3rem; text-align: right; }

/* marquee */
.lv2 .marquee-band {
  overflow: hidden;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  background: var(--background); padding: 1.25rem 0;
}
.lv2 .marquee-track {
  display: flex; width: max-content; gap: 3rem; white-space: nowrap;
  font-family: var(--font-display); font-size: 1.875rem;
  color: color-mix(in oklab, var(--foreground) 70%, transparent);
  animation: lv2-marquee 36s linear infinite;
}
@media (min-width: 768px) { .lv2 .marquee-track { font-size: 2.25rem; } }
.lv2 .marquee-track > span { display: inline-flex; align-items: center; gap: 3rem; }
.lv2 .dot {
  width: .375rem; height: .375rem;
  background: var(--clay); border-radius: 999px; display: inline-block;
}
@keyframes lv2-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* section shared */
.lv2 .section { padding: 6rem 0; }
@media (min-width: 768px) { .lv2 .section { padding: 9rem 0; } }
.lv2 .section-dark      { background: var(--foreground); color: var(--background); }
.lv2 .section-secondary { background: var(--secondary); }
.lv2 .section-head { display: grid; gap: 2rem; grid-template-columns: 1fr; align-items: end; }
@media (min-width: 768px) { .lv2 .section-head { grid-template-columns: 3fr 9fr; gap: 2.5rem; } }
.lv2 .section-head .eyebrow { color: var(--clay); }
.lv2 .section-head h2 {
  font-family: var(--font-display); font-weight: 400;
  letter-spacing: -0.02em; font-size: 3rem; line-height: .95;
}
@media (min-width: 768px) { .lv2 .section-head h2 { font-size: 4.5rem; } }
.lv2 .section-head h2 em { color: var(--clay); }
.lv2 .link-underline {
  margin-top: 1.5rem; display: inline-flex; align-items: center; gap: .5rem;
  width: max-content; padding-bottom: .25rem;
  border-bottom: 1px solid var(--foreground);
  font-size: .875rem; font-weight: 500;
  transition: color .2s, border-color .2s;
}
.lv2 .link-underline:hover { color: var(--clay); border-color: var(--clay); }

/* §01 service cards */
.lv2 .services-grid { margin-top: 5rem; display: grid; gap: 4rem 2.5rem; grid-template-columns: 1fr; }
@media (min-width: 768px) { .lv2 .services-grid { grid-template-columns: repeat(3,1fr); } }
.lv2 .service-card { display: flex; flex-direction: column; }
.lv2 .service-card .img-wrap {
  position: relative; aspect-ratio: 4/5; overflow: hidden; background: var(--muted);
}
.lv2 .service-card img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 1.2s cubic-bezier(.2,.7,.2,1);
}
.lv2 .service-card:hover img { transform: scale(1.04); }
.lv2 .service-card .num {
  position: absolute; top: 1rem; left: 1rem;
  font-family: var(--font-mono); font-size: .75rem;
  color: color-mix(in oklab, var(--background) 90%, transparent);
}
.lv2 .service-card h3 {
  margin-top: 1.5rem; font-family: var(--font-display); font-weight: 400;
  font-size: 1.875rem; line-height: 1.1; letter-spacing: -0.02em;
}
.lv2 .service-card p { margin-top: .75rem; max-width: 28rem; color: var(--muted-foreground); line-height: 1.6; }

/* §02 promise grid */
.lv2 .promise-grid {
  margin-top: 5rem; display: grid; gap: 1px;
  background: color-mix(in oklab, var(--background) 10%, transparent);
  grid-template-columns: 1fr;
}
@media (min-width: 768px) { .lv2 .promise-grid { grid-template-columns: repeat(4,1fr); } }
.lv2 .promise-cell { background: var(--foreground); padding: 2rem; }
@media (min-width: 768px) { .lv2 .promise-cell { padding: 2.5rem; } }
.lv2 .promise-cell .key { font-family: var(--font-mono); font-size: .75rem; color: var(--clay); }
.lv2 .promise-cell h3 {
  margin-top: 1.5rem; font-family: var(--font-display); font-weight: 400;
  font-size: 1.5rem; line-height: 1.15; letter-spacing: -0.02em;
}
.lv2 .promise-cell p {
  margin-top: 1rem; font-size: .875rem; line-height: 1.6;
  color: color-mix(in oklab, var(--background) 70%, transparent);
}

/* §03 search + filters + grid */
.lv2 .search-bar {
  margin-top: 3.5rem;
  border-top: 1px solid var(--foreground); border-bottom: 1px solid var(--foreground);
  padding: 1rem 0; display: flex; flex-direction: column; gap: 1rem;
}
@media (min-width: 768px) { .lv2 .search-bar { flex-direction: row; align-items: center; } }
.lv2 .search-bar .field { flex: 1; display: flex; align-items: center; gap: 1rem; }
.lv2 .search-bar .field-label {
  font-family: var(--font-mono); font-size: .75rem;
  letter-spacing: .18em; text-transform: uppercase; color: var(--muted-foreground);
  white-space: nowrap;
}
.lv2 .search-bar input {
  width: 100%; font-family: var(--font-display); font-size: 1.5rem; color: var(--foreground);
  background: transparent; border: 0; outline: none;
}
.lv2 .search-bar input::placeholder { color: color-mix(in oklab, var(--foreground) 30%, transparent); }
@media (min-width: 768px) { .lv2 .search-bar input { font-size: 1.875rem; } }
.lv2 .btn-dark {
  align-self: flex-start; border-radius: 999px;
  background: var(--foreground); color: var(--background);
  padding: .75rem 1.5rem; font-size: .875rem; transition: background-color .2s; border: 0;
}
.lv2 .btn-dark:hover { background: var(--clay); }
@media (min-width: 768px) { .lv2 .btn-dark { align-self: auto; } }
.lv2 .filter-rows { margin-top: 2rem; display: flex; flex-direction: column; gap: 1.25rem; }
.lv2 .filter-row  { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; }
.lv2 .filter-row-label {
  font-family: var(--font-mono); font-size: .65rem; letter-spacing: .18em;
  text-transform: uppercase; color: var(--muted-foreground); min-width: 6rem; flex-shrink: 0;
}
.lv2 .chips { display: flex; flex-wrap: wrap; gap: .5rem; }
.lv2 .chip {
  border: 1px solid var(--border); border-radius: 999px;
  padding: .375rem 1rem; font-size: .75rem; color: var(--muted-foreground);
  transition: background-color .2s, color .2s, border-color .2s; cursor: pointer; background: none;
}
.lv2 .chip:hover { border-color: var(--foreground); color: var(--foreground); }
.lv2 .chip.active { background: var(--foreground); color: var(--background); border-color: var(--foreground); }
.lv2 .date-wrap { display: flex; align-items: center; gap: .75rem; }
.lv2 .date-input-field {
  font-family: var(--font-mono); font-size: .8rem; color: var(--foreground);
  border: 1px solid var(--border); border-radius: 999px;
  padding: .375rem 1rem; cursor: pointer; transition: border-color .2s; background: transparent;
  -webkit-appearance: none;
}
.lv2 .date-input-field:hover, .lv2 .date-input-field:focus { border-color: var(--foreground); outline: none; }
.lv2 .date-clear-btn {
  font-family: var(--font-mono); font-size: .65rem; letter-spacing: .1em;
  color: var(--muted-foreground); text-transform: uppercase;
  cursor: pointer; transition: color .2s; border: 0; background: none; padding: 0;
}
.lv2 .date-clear-btn:hover { color: var(--clay); }
.lv2 .specialists-grid { margin-top: 4rem; display: grid; gap: 3.5rem 2rem; grid-template-columns: 1fr; }
@media (min-width: 640px)  { .lv2 .specialists-grid { grid-template-columns: repeat(2,1fr); } }
@media (min-width: 1024px) { .lv2 .specialists-grid { grid-template-columns: repeat(4,1fr); } }
.lv2 .specialist .img-wrap {
  position: relative; aspect-ratio: 4/5; overflow: hidden; background: var(--muted);
}
.lv2 .specialist img {
  width: 100%; height: 100%; object-fit: cover;
  filter: grayscale(1); transition: filter .7s, transform .7s;
}
.lv2 .specialist:hover img { filter: grayscale(0); transform: scale(1.03); }
.lv2 .specialist .badge {
  position: absolute; top: .75rem; right: .75rem;
  background: color-mix(in oklab, var(--background) 90%, transparent);
  border-radius: 999px; padding: .25rem .625rem;
  font-family: var(--font-mono); font-size: .625rem; color: var(--foreground);
}
.lv2 .specialist .meta {
  margin-top: 1.25rem; display: flex; align-items: baseline; justify-content: space-between; gap: .75rem;
}
.lv2 .specialist h3 {
  font-family: var(--font-display); font-weight: 400;
  font-size: 1.25rem; line-height: 1.15; letter-spacing: -0.02em;
}
.lv2 .specialist .rate { font-family: var(--font-mono); font-size: .75rem; color: var(--clay); }
.lv2 .specialist .field { margin-top: .25rem; font-size: .875rem; color: var(--muted-foreground); }
.lv2 .specialist .view {
  margin-top: .75rem; font-size: .75rem; font-weight: 500;
  letter-spacing: .18em; text-transform: uppercase;
  color: color-mix(in oklab, var(--foreground) 70%, transparent);
  transition: color .2s; border: 0; background: none; cursor: pointer; padding: 0; text-align: left;
}
.lv2 .specialist .view:hover { color: var(--clay); }
.lv2 .avatar-wrap {
  background: linear-gradient(160deg, var(--av-c1, var(--clay)), var(--av-c2, var(--foreground)));
  display: flex; align-items: center; justify-content: center;
}
.lv2 .avatar-initial {
  font-family: var(--font-display); font-size: 5rem; font-weight: 300;
  color: oklch(0.97 0.012 80); opacity: .75; letter-spacing: -0.03em;
  pointer-events: none; user-select: none;
}
.lv2 .grid-loading, .lv2 .grid-empty {
  grid-column: 1 / -1; font-family: var(--font-mono); font-size: .8rem; letter-spacing: .1em;
  color: var(--muted-foreground); text-transform: uppercase; padding: 3rem 0; text-align: center;
}
.lv2 .see-all { margin-top: 3.5rem; display: flex; justify-content: center; }
.lv2 .see-all a {
  display: inline-flex; align-items: center; gap: .75rem;
  font-family: var(--font-display); font-size: 1.5rem;
  border-bottom: 1px solid var(--foreground); padding-bottom: .25rem;
  transition: color .2s, border-color .2s;
}
.lv2 .see-all a:hover { color: var(--clay); border-color: var(--clay); }
.lv2 .see-all a span { display: inline-block; transition: transform .2s; }
.lv2 .see-all a:hover span { transform: translateX(4px); }

/* §04 reviews */
.lv2 .reviews-grid {
  margin-top: 5rem; display: grid; gap: 1px; background: var(--border); grid-template-columns: 1fr;
}
@media (min-width: 768px) { .lv2 .reviews-grid { grid-template-columns: repeat(3,1fr); } }
.lv2 .review { background: var(--background); padding: 2rem; }
@media (min-width: 768px) { .lv2 .review { padding: 3rem; } }
.lv2 .review .num { font-family: var(--font-mono); font-size: .75rem; color: var(--clay); }
.lv2 .review blockquote {
  margin-top: 2rem; font-family: var(--font-display); font-weight: 400;
  font-size: 1.5rem; line-height: 1.3; letter-spacing: -0.02em;
}
@media (min-width: 768px) { .lv2 .review blockquote { font-size: 1.875rem; } }
.lv2 .review blockquote .q { color: var(--clay); }
.lv2 .review figcaption { margin-top: 2.5rem; border-top: 1px solid var(--border); padding-top: 1.25rem; }
.lv2 .review figcaption .name { font-family: var(--font-display); font-size: 1.125rem; }
.lv2 .review figcaption .role {
  margin-top: .25rem; font-size: .75rem; letter-spacing: .18em;
  text-transform: uppercase; color: var(--muted-foreground);
}

/* numbers */
.lv2 .numbers {
  margin-top: 6rem; border-top: 1px solid var(--border); padding-top: 3rem;
  display: grid; gap: 2.5rem; grid-template-columns: repeat(2,1fr);
}
@media (min-width: 768px) { .lv2 .numbers { grid-template-columns: repeat(4,1fr); } }
.lv2 .numbers .stat {
  font-family: var(--font-display); font-size: 3rem; line-height: 1; letter-spacing: -0.02em;
}
@media (min-width: 768px) { .lv2 .numbers .stat { font-size: 3.75rem; } }
.lv2 .numbers .label { margin-top: .5rem; color: var(--muted-foreground); }

/* footer */
.lv2 .site-footer { background: var(--foreground); color: var(--background); }
.lv2 .site-footer .inner { max-width: 1600px; margin: 0 auto; padding: 5rem 1.5rem; }
@media (min-width: 768px) { .lv2 .site-footer .inner { padding: 7rem 3rem; } }
.lv2 .footer-grid { display: grid; gap: 4rem; grid-template-columns: 1fr; }
@media (min-width: 768px) { .lv2 .footer-grid { grid-template-columns: 7fr 2fr 3fr; } }
.lv2 .footer-grid .eyebrow { color: color-mix(in oklab, var(--background) 50%, transparent); }
.lv2 .footer-grid h2 {
  margin-top: 1.5rem; font-family: var(--font-display); font-weight: 400;
  font-size: 3rem; line-height: .95; letter-spacing: -0.02em;
}
@media (min-width: 768px) { .lv2 .footer-grid h2 { font-size: 4.5rem; } }
.lv2 .footer-grid h2 em { color: var(--clay); }
.lv2 .footer-signin {
  margin-top: 2.5rem; display: inline-flex; align-items: center; gap: .75rem;
  border-radius: 999px; border: 1px solid color-mix(in oklab, var(--background) 30%, transparent);
  padding: .75rem 1.5rem; font-size: .875rem;
  color: color-mix(in oklab, var(--background) 80%, transparent);
  transition: color .2s, border-color .2s;
}
.lv2 .footer-signin:hover { color: var(--clay); border-color: var(--clay); }
.lv2 .footer-col .eyebrow { color: color-mix(in oklab, var(--background) 50%, transparent); }
.lv2 .footer-col ul {
  margin-top: 1.25rem; display: grid; gap: .625rem;
  font-size: .875rem; color: color-mix(in oklab, var(--background) 70%, transparent);
}
.lv2 .footer-bottom {
  margin-top: 5rem;
  border-top: 1px solid color-mix(in oklab, var(--background) 15%, transparent);
  padding-top: 1.5rem; display: flex; flex-direction: column; gap: .75rem;
  font-size: .75rem; color: color-mix(in oklab, var(--background) 50%, transparent);
}
@media (min-width: 768px) {
  .lv2 .footer-bottom { flex-direction: row; align-items: center; justify-content: space-between; }
}

/* reveal */
.lv2 .reveal {
  opacity: 0; transform: translateY(20px);
  animation: lv2-reveal .9s cubic-bezier(.2,.7,.2,1) forwards;
}
@keyframes lv2-reveal { to { opacity: 1; transform: translateY(0); } }
`
