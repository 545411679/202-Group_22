import { authApi, specialistApi, reviewApi } from '/api.js'

const PALETTES = [
  ['#c4825a','#8b5e3c'],
  ['#6b8fa8','#4a6d85'],
  ['#7a9e7e','#5a7d5e'],
  ['#9b7bb8','#7a5a97'],
  ['#b89460','#8a6e3a'],
  ['#b05b6b','#8a3e4e'],
]

const STEP_IMAGES = [
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80',
  'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80',
]

const STEPS = [
  { num: '01', title: 'Search', body: 'Filter by category, qualification level and available date. Every profile shows verified credentials and a transparent fee.' },
  { num: '02', title: 'Book',   body: 'Choose an open slot that fits your calendar. Online or in-person - submit your booking in under two minutes.' },
  { num: '03', title: 'Meet',   body: 'Your specialist confirms with meeting details. Track status in real time from booked through conducted.' },
]

const FALLBACK_SPECIALISTS = [
  { specialistId:1, name:'Dr. Wei Chen',  specialty:'General Consultation', qualificationLevel:'Senior', fee:200 },
  { specialistId:2, name:'Sarah Miller',  specialty:'Mental Health',        qualificationLevel:'Expert', fee:280 },
  { specialistId:3, name:'James Park',    specialty:'Career Coaching',      qualificationLevel:'Senior', fee:350 },
  { specialistId:4, name:'Dr. Fang Liu',  specialty:'Nutrition & Diet',     qualificationLevel:'Mid',    fee:150 },
  { specialistId:5, name:'Emily Hart',    specialty:'Legal Advice',         qualificationLevel:'Senior', fee:400 },
  { specialistId:6, name:'Marcus Okafor', specialty:'Financial Planning',   qualificationLevel:'Expert', fee:320 },
]

const FALLBACK_REVIEWS = [
  { customerName:'Alice C.', specialty:'General Consultation', rating:5, comment:'Found the right specialist in under five minutes.' },
  { customerName:'Bob Z.',   specialty:'Career Coaching',      rating:5, comment:'Status tracking is genuinely useful - no chasing.' },
  { customerName:'Carol W.', specialty:'Mental Health',        rating:5, comment:'Transparent flow, specialist came prepared.' },
  { customerName:'Daniel L.',specialty:'Financial Planning',   rating:4, comment:'Confirmed within the hour. Smooth from start to finish.' },
]

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function injectStyles() {
  if (document.getElementById('home2-style')) return
  const s = document.createElement('style')
  s.id = 'home2-style'
  s.textContent = HOME_CSS
  document.head.appendChild(s)
}

export function render(app) {
  injectStyles()

  app.innerHTML = `
<div class="home2">
  <a class="home2-tour" href="#/about">
    <span class="home2-tour-eb">§ Product tour</span>
  </a>

  <!-- LEFT COL (60%) -->
  <section class="home2-left">

    <!-- top: hero -->
    <div class="home2-hero">
      <img src="/hero.jpg" alt="Two professionals in conversation" />
      <div class="home2-hero-veil"></div>

      <div class="home2-hero-corner top-left">
        <p class="home2-wordmark"><span>CON</span><span>SILIUM</span></p>
      </div>
      <div class="home2-hero-corner top-right">
        <p class="home2-mono">Search · Book · Meet</p>
      </div>

      <div class="home2-hero-body">
        <p class="home2-eyebrow light">Consilium · A specialist consultation booking platform</p>
        <h1 class="home2-h1">Clarity begins with<br />the right <em>conversation.</em></h1>
        <p class="home2-hero-lead">
          Verified specialists across every field. Book a consultation
          that fits your schedule — online or in person.
        </p>
      </div>

      <div class="home2-hero-foot">
        <span class="home2-mono">CPT202 · AY2025-26 · Group 22</span>
      </div>
    </div>

    <!-- bottom: three flip steps -->
    <div class="home2-steps">
      <div class="home2-steps-head">
        <div>
          <p class="home2-eyebrow">§ How it works</p>
          <h2 class="home2-h2">Three steps to the<br /><em>right answer.</em></h2>
        </div>
        <p class="home2-steps-aside">
          <span class="home2-mono">Hover any card to read more.</span>
        </p>
      </div>

      <div class="home2-flips">
        ${STEPS.map((s, i) => `
          <article class="home2-flip" tabindex="0">
            <div class="home2-flip-inner">
              <div class="home2-flip-front" style="background-image:url('${STEP_IMAGES[i]}')">
                <span class="home2-flip-num">${s.num}</span>
                <div class="home2-flip-title">${esc(s.title)}</div>
                <span class="home2-flip-hint">Hover →</span>
              </div>
              <div class="home2-flip-back">
                <span class="home2-flip-num dark">— ${s.num}</span>
                <h3>${esc(s.title)}</h3>
                <p>${esc(s.body)}</p>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>

  </section>

  <!-- RIGHT COL (40%) -->
  <section class="home2-right">

    <!-- top: specialists -->
    <div class="home2-strip">
      <div class="home2-strip-head">
        <div>
          <p class="home2-eyebrow">§ 03 — Directory</p>
          <h2 class="home2-right-h2">Find someone you would<br /><em>actually trust.</em></h2>
        </div>
      </div>
      <div class="home2-spec-row" id="home2-spec-row">
        <div class="home2-skeleton">Loading specialists…</div>
      </div>
    </div>

    <!-- middle: reviews -->
    <div class="home2-strip">
      <div class="home2-strip-head">
        <div>
          <p class="home2-eyebrow">§ 04 — In their words</p>
          <h2 class="home2-right-h2">Clarity, delivered.<br /><em>In their own words.</em></h2>
        </div>
      </div>
      <div class="home2-rev-row" id="home2-rev-row">
        <div class="home2-skeleton">Loading reviews…</div>
      </div>
    </div>

    <!-- bottom: sign in -->
    <div class="home2-signin-block">
      <div class="home2-signin-head">
        <div>
          <p class="home2-eyebrow">§ Begin a conversation</p>
          <h2 class="home2-right-h2">Connect the right person,<br /><em>right now.</em></h2>
        </div>
        <a href="#/login" class="home2-btn-dark">Sign in to book <span>→</span></a>
      </div>
    </div>

  </section>

  <p class="home2-caption">Consilium · Group 22 · CPT202 · XJTLU</p>
</div>`

  loadSpecialists()
  loadReviews()
}

async function loadSpecialists() {
  const row = document.getElementById('home2-spec-row')
  if (!row) return
  let list = FALLBACK_SPECIALISTS
  try {
    const data = await specialistApi.search({})
    const arr  = Array.isArray(data) ? data : (data?.content || data?.data || [])
    if (arr.length) list = shuffle(arr).slice(0, 6)
  } catch (_) {}
  if (!list.length) {
    row.innerHTML = '<div class="home2-skeleton">No specialists yet.</div>'
    return
  }
  row.innerHTML = list.slice(0, 6).map((sp, i) => buildSpec(sp, i)).join('')
  row.querySelectorAll('[data-spec]').forEach(card => {
    card.addEventListener('click', () => { location.hash = '#/login' })
  })
}

function buildSpec(sp, idx) {
  const palette = PALETTES[idx % PALETTES.length]
  const initial = (sp.name || '?').trim().charAt(0).toUpperCase()
  const fee     = sp.fee != null ? `¥${sp.fee}/hr` : '—'
  const cat     = sp.specialty || sp.specialtyCategory || ''
  const level   = sp.qualificationLevel || sp.level || ''
  const num     = String(idx + 1).padStart(2, '0')
  return `
<button type="button" class="home2-spec" data-spec="1" style="--c1:${palette[0]};--c2:${palette[1]}">
  <div class="home2-spec-avatar">
    <span class="home2-spec-initial">${esc(initial)}</span>
    <span class="home2-spec-num">${num}</span>
  </div>
  <div class="home2-spec-meta">
    <div class="home2-spec-name">${esc(sp.name || 'Specialist')}</div>
    <div class="home2-spec-cat">${esc(cat)}${level ? ' · ' + esc(level) : ''}</div>
    <div class="home2-spec-rate">${esc(fee)}</div>
  </div>
</button>`
}

async function loadReviews() {
  const row = document.getElementById('home2-rev-row')
  if (!row) return
  let list = FALLBACK_REVIEWS
  try {
    const data = await reviewApi.getRecentReviews()
    if (Array.isArray(data) && data.length) list = shuffle(data).slice(0, 4)
  } catch (_) {}
  row.innerHTML = list.slice(0, 4).map((r, i) => buildReview(r, i)).join('')
}

function buildReview(r, i) {
  const comment  = r.comment || r.content || ''
  const customer = r.customerName || r.clientName || 'Client'
  const role     = r.specialty || r.specialistSpecialty || (r.specialistName ? `Specialist · ${r.specialistName}` : 'Client')
  const rating   = Math.max(0, Math.min(5, Math.round(Number(r.rating) || 5)))
  const stars    = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const num      = String(i + 1).padStart(2, '0')
  return `
<figure class="home2-rev">
  <div class="home2-rev-top">
    <span class="home2-rev-num">— ${num}</span>
    <span class="home2-rev-stars">${stars}</span>
  </div>
  <blockquote><span class="q">“</span>${esc(comment)}<span class="q">”</span></blockquote>
  <figcaption>
    <span class="home2-rev-name">${esc(customer)}</span>
    <span class="home2-rev-role">${esc(role)}</span>
  </figcaption>
</figure>`
}

const HOME_CSS = `
.home2, .home2 * {
  box-sizing: border-box;
}
.home2 {
  --bg: #faf6f1;
  --ink: #2d1a0e;
  --ink-soft: #5a3d2a;
  --muted: #8c6a52;
  --line: #eadfd2;
  --clay: #e8722a;
  --clay-deep: #c25a18;
  --font-display: "Fraunces", "Cormorant Garamond", Georgia, serif;
  --font-sans: "Inter", "Helvetica Neue", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--ink);
  height: 100vh;
  overflow: hidden;
  padding: 14px;
  display: grid;
  grid-template-columns: 6fr 4fr;
  gap: 14px;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "ss01","cv11";
  position: relative;
}

.home2-mono {
  font-family: var(--font-mono);
  font-size: 9px; letter-spacing: .18em; text-transform: uppercase;
  color: rgba(255,255,255,.7); margin: 0;
}

.home2-eyebrow {
  font-family: var(--font-mono);
  font-size: 8px; letter-spacing: .18em; text-transform: uppercase;
  color: var(--clay-deep); margin: 0 0 3px;
  font-weight: 500;
}
.home2-eyebrow.light { color: rgba(255,255,255,.78); }

.home2-tour {
  position: absolute; top: 26px; right: 32px; z-index: 10;
  display: inline-flex; align-items: center;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--ink);
  text-decoration: none;
  font-family: var(--font-sans);
  transition: color .2s, border-color .2s;
}
.home2-tour-eb {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--ink);
}
.home2-tour:hover { border-color: var(--clay); }
.home2-tour:hover .home2-tour-eb { color: var(--clay); }

.home2-caption {
  position: absolute; bottom: 20px; right: 20px; z-index: 5;
  margin: 0;
  font-family: var(--font-mono); font-size: 8px;
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--muted);
  pointer-events: none;
}

/* LEFT COL */
.home2-left {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 14px;
  min-width: 0;
  min-height: 0;
  font-family: var(--font-sans);
}

/* hero - rounded to match flip cards below */
.home2-hero {
  position: relative; overflow: hidden;
  background: var(--ink);
  border-radius: 10px;
  min-height: 0;
  font-family: var(--font-sans);
}
.home2-hero img {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover; opacity: .9;
  animation: home2-zoomIn 18s ease-out forwards;
}
@keyframes home2-zoomIn {
  from { transform: scale(1.04); }
  to   { transform: scale(1); }
}
.home2-hero-veil {
  position: absolute; inset: 0;
  background: linear-gradient(170deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.4) 60%, rgba(0,0,0,.78) 100%);
}
.home2-hero-corner {
  position: absolute; z-index: 2; padding: 20px 28px;
  display: none;
  font-family: var(--font-mono);
}
@media (min-width: 1024px) { .home2-hero-corner { display: block; } }
.home2-hero-corner.top-left  { top: 0; left: 0; }
.home2-hero-corner.top-right { top: 0; right: 0; text-align: right; }
.home2-wordmark {
  margin: 0;
  font-family: var(--font-display);
  font-size: 24px;
  line-height: 1;
  letter-spacing: .08em;
  font-weight: 500;
  color: rgba(255,255,255,.9);
}
.home2-wordmark span:first-child { color: #fff; }
.home2-wordmark span:last-child { color: var(--clay); }

.home2-hero-body {
  position: relative; z-index: 2;
  height: 100%; padding: 40px 48px 68px;
  display: flex; flex-direction: column; justify-content: flex-end; gap: 18px;
  color: #fff;
  font-family: var(--font-sans);
  animation: home2-fadeUp .8s cubic-bezier(.2,.7,.2,1) both;
}
@keyframes home2-fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.home2-h1 {
  font-family: var(--font-display); font-weight: 400;
  font-size: clamp(2.8rem, 5.2vw, 5.8rem);
  line-height: .92; letter-spacing: -.025em;
  margin: 0; max-width: 18ch;
  color: #fff;
}
.home2-h1 em { font-style: italic; color: var(--clay); }
.home2-hero-lead {
  margin: 6px 0 0; max-width: 38ch;
  font-family: var(--font-sans);
  font-size: 14px; line-height: 1.55;
  color: rgba(255,255,255,.82);
}
.home2-hero-foot {
  position: absolute; left: 48px; right: 48px; bottom: 20px;
  display: flex; align-items: center; gap: 14px;
  z-index: 2; pointer-events: none;
  font-family: var(--font-mono);
}
.home2-hero-foot .home2-mono { color: rgba(255,255,255,.55); }
.home2-dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--clay);
}

/* steps */
.home2-steps {
  padding: 14px 12px 4px;
  display: flex; flex-direction: column; gap: 16px;
  min-height: 0; min-width: 0;
  background: var(--bg);
  font-family: var(--font-sans);
}
.home2-steps-head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;
}
.home2-steps-aside {
  margin: 0; color: var(--muted);
  font-family: var(--font-mono);
}
.home2-steps-aside .home2-mono { color: var(--muted); }
.home2-h2 {
  font-family: var(--font-display); font-weight: 400;
  font-size: clamp(1.9rem, 3vw, 3rem);
  line-height: 1; letter-spacing: -.025em;
  margin: 4px 0 0;
  color: var(--ink);
}
.home2-h2 em { font-style: italic; color: var(--clay); }
.home2-flips {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  flex: 1 1 auto; min-height: 0;
  animation: home2-fadeUp .9s .15s cubic-bezier(.2,.7,.2,1) both;
}
.home2-flip {
  perspective: 1200px; position: relative;
  border-radius: 10px; overflow: hidden;
  outline: none;
  font-family: var(--font-sans);
}
.home2-flip-inner {
  position: relative; width: 100%; height: 100%;
  transform-style: preserve-3d;
  transition: transform .65s cubic-bezier(.4,.0,.2,1);
}
.home2-flip:hover .home2-flip-inner,
.home2-flip:focus-visible .home2-flip-inner {
  transform: rotateY(180deg);
}
.home2-flip-front, .home2-flip-back {
  position: absolute; inset: 0;
  -webkit-backface-visibility: hidden; backface-visibility: hidden;
  border-radius: 10px;
  display: flex; flex-direction: column; padding: 16px;
}
.home2-flip-front {
  background-size: cover; background-position: center;
  color: #fff;
  box-shadow: inset 0 -100px 90px -30px rgba(0,0,0,.75);
  justify-content: flex-end;
}
.home2-flip-num {
  font-family: var(--font-mono); font-size: 9px; letter-spacing: .2em;
  color: rgba(255,255,255,.85);
  position: absolute; top: 14px; left: 14px;
}
.home2-flip-num.dark { color: var(--clay-deep); position: static; margin-bottom: 8px; }
.home2-flip-hint {
  position: absolute; top: 14px; right: 14px;
  font-family: var(--font-mono); font-size: 8px;
  letter-spacing: .2em; text-transform: uppercase;
  color: rgba(255,255,255,.7);
  opacity: .85; transition: opacity .25s;
}
.home2-flip:hover .home2-flip-hint { opacity: 0; }
.home2-flip-title {
  font-family: var(--font-display); font-size: clamp(1.1rem, 1.5vw, 1.6rem);
  line-height: 1.05; letter-spacing: -.01em;
  color: #fff;
}
.home2-flip-back {
  background: var(--ink); color: #f5ede6;
  transform: rotateY(180deg);
  justify-content: center;
  font-family: var(--font-sans);
}
.home2-flip-back h3 {
  font-family: var(--font-display); font-weight: 400;
  font-size: clamp(1rem, 1.4vw, 1.4rem); margin: 0 0 8px;
  color: #fff;
}
.home2-flip-back p {
  font-family: var(--font-sans);
  font-size: 12px; line-height: 1.55;
  color: rgba(255,255,255,.78); margin: 0;
}

/* RIGHT COL */
.home2-right {
  display: grid;
  grid-template-rows: minmax(0, 1.3fr) minmax(0, 1.45fr) minmax(0, 1.25fr);
  gap: 14px;
  background: var(--bg);
  min-width: 0; min-height: 0;
  font-family: var(--font-sans);
}

.home2-strip {
  padding: 10px 12px;
  display: flex; flex-direction: column; gap: 10px;
  min-height: 0; min-width: 0;
  font-family: var(--font-sans);
}
.home2-right .home2-strip:last-child {
  padding-bottom: 26px;
}
.home2-strip-head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 10px;
}
.home2-strip-title {
  font-family: var(--font-display); font-size: 18px; line-height: 1;
  letter-spacing: -.015em; color: var(--ink); margin: 0;
  font-weight: 400;
}
.home2-strip-link {
  font-family: var(--font-mono); font-size: 9px;
  letter-spacing: .2em; text-transform: uppercase;
  color: var(--ink-soft); text-decoration: none;
  transition: color .2s;
}
.home2-strip-link span { display: inline-block; transition: transform .2s; }
.home2-strip-link:hover { color: var(--clay); }
.home2-strip-link:hover span { transform: translateX(3px); }
.home2-strip-link-under {
  display: inline-flex;
  margin-top: 6px;
  padding-bottom: 2px;
  border-bottom: 1px solid currentColor;
}

.home2-skeleton {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: .14em;
  color: var(--muted); text-align: center; padding: 28px 0;
  text-transform: uppercase;
}

/* specialists row - 3 cards per row, 2 rows */
.home2-spec-row {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  flex: 1 1 auto; min-height: 0;
  grid-auto-rows: minmax(86px, 1fr);
}
.home2-spec {
  border: 1px solid var(--line); border-radius: 8px;
  background: #fff;
  padding: 9px;
  display: flex; flex-direction: column; gap: 7px;
  text-align: left; cursor: pointer;
  font-family: var(--font-sans); color: inherit;
  opacity: .82; filter: saturate(.85);
  min-width: 0; overflow: hidden;
  transition: opacity .35s, filter .35s, transform .35s, box-shadow .35s, border-color .35s;
}
.home2-spec:hover {
  opacity: 1; filter: saturate(1.18);
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 12px 26px rgba(61,35,20,.16);
  border-color: var(--clay);
  z-index: 2;
}
.home2-spec-avatar {
  position: relative;
  width: 42px; height: 42px; border-radius: 6px;
  background: linear-gradient(160deg, var(--c1, var(--clay)), var(--c2, var(--ink)));
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.home2-spec-initial {
  font-family: var(--font-display); font-size: 21px;
  color: rgba(255,255,255,.92); font-weight: 300; letter-spacing: -.02em;
  pointer-events: none; user-select: none;
}
.home2-spec-num {
  position: absolute; top: 3px; right: 4px;
  font-family: var(--font-mono); font-size: 6px;
  letter-spacing: .14em; color: rgba(255,255,255,.85);
}
.home2-spec-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.home2-spec-name {
  font-family: var(--font-display); font-size: 11px; font-weight: 500;
  line-height: 1.15; color: var(--ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.home2-spec-cat {
  font-family: var(--font-sans);
  font-size: 9px; color: var(--muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.home2-spec-rate {
  font-family: var(--font-mono); font-size: 9px;
  color: var(--clay); margin-top: 1px; letter-spacing: .04em;
}

/* reviews row */
.home2-rev-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  flex: 1 1 auto; min-height: 0;
}
.home2-rev {
  margin: 0; padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--line); border-radius: 10px;
  display: flex; flex-direction: column; gap: 6px;
  font-family: var(--font-sans);
  font-size: 12px; line-height: 1.5;
  transition: transform .3s, box-shadow .3s, border-color .3s;
}
.home2-rev:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(61,35,20,.10);
  border-color: var(--clay);
}
.home2-rev-top {
  display: flex; align-items: center; justify-content: space-between;
}
.home2-rev-num {
  font-family: var(--font-mono); font-size: 8px;
  letter-spacing: .2em; text-transform: uppercase;
  color: var(--clay-deep);
}
.home2-rev-stars {
  color: var(--clay); font-size: 11px; letter-spacing: 1px;
  font-family: var(--font-sans);
}
.home2-rev blockquote {
  margin: 0; font-family: var(--font-display); font-weight: 400;
  font-size: 11px; line-height: 1.35; color: var(--ink);
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;
  overflow: hidden;
}
.home2-rev blockquote .q { color: var(--clay); }
.home2-rev figcaption {
  display: flex; flex-direction: column; gap: 2px; margin-top: auto;
  border-top: 1px solid var(--line); padding-top: 6px;
}
.home2-rev-name { font-family: var(--font-display); font-size: 12px; color: var(--ink); }
.home2-rev-role {
  font-family: var(--font-mono); font-size: 8px; letter-spacing: .16em;
  text-transform: uppercase; color: var(--muted);
}

/* right-col headings — match /about section-head h2 */
.home2-right-h2 {
  font-family: var(--font-display); font-weight: 400;
  font-size: clamp(1.45rem, 2vw, 2.1rem);
  line-height: 1.05; letter-spacing: -.02em;
  margin: 4px 0 0; color: var(--ink);
}
.home2-right-h2 em { font-style: italic; color: var(--clay); }

/* sign-in block */
.home2-signin-block {
  padding: 16px 12px 26px;
  display: flex; flex-direction: column; justify-content: center;
  min-height: 0; min-width: 0;
  font-family: var(--font-sans);
  animation: home2-fadeUp .9s .25s cubic-bezier(.2,.7,.2,1) both;
  border-top: 1px solid var(--line);
}
.home2-signin-head {
  display: flex; align-items: center; justify-content: space-between; gap: 18px;
}

.home2-btn-dark {
  display: inline-flex; align-items: center; gap: 8px;
  border-radius: 999px; border: 0;
  background: var(--ink); color: #fff;
  padding: 10px 22px;
  font-family: var(--font-sans);
  font-size: 13px; font-weight: 500; letter-spacing: .02em;
  cursor: pointer; transition: background-color .2s, transform .2s;
}
.home2-btn-dark span { display: inline-block; transition: transform .2s; }
.home2-btn-dark:hover { background: var(--clay); }
.home2-btn-dark:hover span { transform: translateX(3px); }
.home2-btn-dark:disabled { opacity: .55; cursor: not-allowed; }


/* responsive fallback */
@media (max-width: 1023px) {
  .home2 {
    height: auto; min-height: 100vh; overflow: visible;
    grid-template-columns: 1fr;
    padding: 12px;
  }
  .home2-left, .home2-right { grid-template-rows: auto; }
  .home2-hero { min-height: 360px; }
  .home2-flips { min-height: 280px; }
  .home2-flip { min-height: 200px; }
  .home2-spec-row { grid-template-columns: repeat(3, 1fr); }
  .home2-rev-row  { grid-template-columns: repeat(2, 1fr); }
  .home2-hero-foot { position: static; padding: 12px 48px 18px; }
}
@media (max-width: 540px) {
  .home2-hero-body { padding: 26px 22px 60px; }
  .home2-steps { padding: 14px 8px; }
  .home2-strip, .home2-signin-block { padding: 10px 8px; }
  .home2-spec-row { grid-template-columns: repeat(2, 1fr); }
  .home2-rev-row  { grid-template-columns: 1fr; }
}
`
