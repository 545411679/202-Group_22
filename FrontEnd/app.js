import { auth } from '/auth.js'
import { createIcons, icons } from 'lucide'

const routes = {
  '/':                        () => import('/pages/home.js'),
  '/about':                   () => import('/pages/about.js'),
  '/login':                   () => import('/pages/login.js'),
  '/register':                () => import('/pages/register.js'),
  '/register/specialist':     () => import('/pages/register-specialist.js'),
  '/specialists/:id':         () => import('/pages/shared/specialist-public.js'),
  '/account/password':        () => import('/pages/shared/change-password.js'),
  '/account/settings':        () => import('/pages/shared/settings.js'),
  '/announcements':           () => import('/pages/announcements.js'),
  '/customer/dashboard':      () => import('/pages/customer/dashboard.js'),
  '/customer/search':         () => import('/pages/customer/search.js'),
  '/customer/book/:specId':   () => import('/pages/customer/booking-wizard.js'),
  '/customer/sessions/:id':   () => import('/pages/customer/session-detail.js'),
  '/specialist/dashboard':    () => import('/pages/specialist/dashboard.js'),
  '/specialist/profile':      () => import('/pages/specialist/edit-profile.js'),
  '/specialist/slots':        () => import('/pages/specialist/slot-management.js'),
  '/specialist/sessions':     () => import('/pages/specialist/session-requests.js'),
  '/admin/dashboard':         () => import('/pages/admin/dashboard.js'),
  '/admin/profiles':          () => import('/pages/admin/profile-approval.js'),
  '/admin/users':             () => import('/pages/admin/users.js'),
  '/admin/sessions':          () => import('/pages/admin/sessions.js'),
  '/admin/categories':        () => import('/pages/admin/categories.js'),
  '/admin/announcements':     () => import('/pages/admin/announcements.js'),
  '/admin/reviews':           () => import('/pages/admin/reviews.js'),
  '/admin/logs':              () => import('/pages/admin/logs.js'),
}

const guestRoutes = ['/', '/about', '/login', '/register', '/register/specialist']
const rolePrefix  = { CUSTOMER: '/customer', SPECIALIST: '/specialist', CLIENT: '/customer', ADMIN: '/admin' }

function matchRoute(path) {
  const [pathname, search] = path.split('?')
  const query = Object.fromEntries(new URLSearchParams(search || ''))
  for (const [pattern, loader] of Object.entries(routes)) {
    const keys = []
    const re = new RegExp('^' + pattern.replace(/:([^/]+)/g, (_, k) => { keys.push(k); return '([^/]+)' }) + '$')
    const m = pathname.match(re)
    if (m) {
      const params = { ...query }
      keys.forEach((k, i) => params[k] = m[i + 1])
      return { loader, params }
    }
  }
  return null
}

async function navigate() {
  const hash = location.hash.slice(1) || '/'
  if (!hash.startsWith('/')) return  // in-page anchor (e.g. #how-it-works), let browser scroll
  const app  = document.getElementById('app')

  const match = matchRoute(hash)
  if (!match) { app.innerHTML = '<div class="empty" style="padding:80px">Page not found.</div>'; return }

  const isGuest = guestRoutes.includes(hash.split('?')[0])
  if (!isGuest && !auth.isLoggedIn) { location.hash = '#/login'; return }
  if (auth.isLoggedIn && (hash === '/' || hash === '/login' || hash === '/register')) {
    location.hash = auth.roleHome(); return
  }

  try {
    const mod = await match.loader()
    mod.render(app, match.params)
  } catch (e) {
    console.error(e)
    app.innerHTML = '<div class="empty" style="padding:80px">Failed to load page.</div>'
  }
}

window.addEventListener('hashchange', navigate)
window.addEventListener('load', navigate)

// ── Layout ──────────────────────────────────────────────────────────────────
const navItems = {
  CLIENT:     [
    { icon: 'layout-dashboard', label: 'Dashboard',       href: '#/customer/dashboard' },
    { icon: 'search',           label: 'Find Specialists', href: '#/customer/search' },
    { icon: 'settings',         label: 'Settings',         href: '#/account/settings' },
  ],
  CUSTOMER:   [
    { icon: 'layout-dashboard', label: 'Dashboard',       href: '#/customer/dashboard' },
    { icon: 'search',           label: 'Find Specialists', href: '#/customer/search' },
    { icon: 'settings',         label: 'Settings',         href: '#/account/settings' },
  ],
  SPECIALIST: [
    { icon: 'layout-dashboard', label: 'Dashboard',        href: '#/specialist/dashboard' },
    { icon: 'calendar',         label: 'My Slots',          href: '#/specialist/slots' },
    { icon: 'clipboard-list',   label: 'Session Requests',  href: '#/specialist/sessions' },
    { icon: 'user-round',       label: 'Edit Profile',      href: '#/specialist/profile' },
    { icon: 'settings',         label: 'Settings',          href: '#/account/settings' },
  ],
  ADMIN: [
    { icon: 'layout-dashboard', label: 'Dashboard',         href: '#/admin/dashboard' },
    { icon: 'check-circle',     label: 'Profile Approvals', href: '#/admin/profiles' },
    { icon: 'users',            label: 'Users',             href: '#/admin/users' },
    { icon: 'clipboard',        label: 'Sessions',          href: '#/admin/sessions' },
    { icon: 'tag',              label: 'Categories',        href: '#/admin/categories' },
    { icon: 'megaphone',        label: 'Announcements',     href: '#/admin/announcements' },
    { icon: 'star',             label: 'Reviews',           href: '#/admin/reviews' },
    { icon: 'scroll-text',      label: 'Logs',              href: '#/admin/logs' },
  ]
}

export function renderLayout(title, contentFn) {
  const app   = document.getElementById('app')
  const items = navItems[auth.role] || []
  const hash  = location.hash

  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-logo">Con<span>silium</span></div>
        <nav class="sidebar-nav">
          ${items.map(i => `
            <a class="nav-item ${hash === i.href ? 'active' : ''}" href="${i.href}">
              <span class="nav-icon"><i data-lucide="${i.icon}"></i></span>
              <span>${i.label}</span>
            </a>
          `).join('')}
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user"><strong>${auth.userName || 'User'}</strong>${auth.role || ''}</div>
          <button class="btn btn-secondary btn-sm" id="logout-btn" style="width:100%">Logout</button>
        </div>
      </aside>
      <div class="main-wrap">
        <header class="topbar">
          <div class="topbar-title">${title}</div>
        </header>
        <main class="page-content" id="page-container"></main>
      </div>
    </div>
  `

  createIcons({ icons })

  document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout()
    location.hash = '#/login'
  })

  contentFn(document.getElementById('page-container'))
}

// ── Toast ────────────────────────────────────────────────────────────────────
export function toast(message, type = 'info') {
  const tc = document.getElementById('toast-container')
  const el = document.createElement('div')
  el.className = `toast toast-${type}`
  el.textContent = message
  tc.appendChild(el)
  setTimeout(() => el.remove(), 3000)
}
