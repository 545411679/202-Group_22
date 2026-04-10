import { createRouter, createWebHistory } from 'vue-router'

import LandingView               from '../views/shared/LandingView.vue'
import LoginView                 from '../views/LoginView.vue'
import RegisterView              from '../views/RegisterView.vue'
import SpecialistPublicView      from '../views/shared/SpecialistPublicView.vue'
import ChangePasswordView        from '../views/shared/ChangePasswordView.vue'

import CustomerDashboardView     from '../views/customer/DashboardView.vue'
import CustomerSearchView        from '../views/customer/SearchView.vue'
import BookingWizardView         from '../views/customer/BookingWizardView.vue'
import SessionDetailView         from '../views/customer/SessionDetailView.vue'

import SpecialistDashboardView   from '../views/specialist/DashboardView.vue'
import EditProfileView           from '../views/specialist/EditProfileView.vue'
import SlotManagementView        from '../views/specialist/SlotManagementView.vue'
import SessionRequestsView       from '../views/specialist/SessionRequestsView.vue'

import AdminDashboardView        from '../views/admin/DashboardView.vue'
import AdminProfileApprovalView  from '../views/admin/ProfileApprovalView.vue'
import AdminUsersView            from '../views/admin/UsersView.vue'
import AdminSessionsView         from '../views/admin/SessionsView.vue'
import AdminCategoriesView       from '../views/admin/CategoriesView.vue'
import AdminAnnouncementsView    from '../views/admin/AnnouncementsView.vue'
import AdminLogsView             from '../views/admin/LogsView.vue'

export function roleHome(role) {
  if (role === 'CLIENT')     return '/customer/dashboard'
  if (role === 'SPECIALIST') return '/specialist/dashboard'
  if (role === 'ADMIN')      return '/admin/dashboard'
  return '/login'
}

const routes = [
  { path: '/',                   component: LandingView,              meta: { public: true } },
  { path: '/login',              component: LoginView,                meta: { public: true } },
  { path: '/register',           component: RegisterView,             meta: { public: true } },
  { path: '/specialists/:id',    component: SpecialistPublicView,     meta: { public: true } },
  { path: '/account/password',   component: ChangePasswordView,       meta: { auth: true } },

  { path: '/customer/dashboard', component: CustomerDashboardView,    meta: { role: 'CLIENT' } },
  { path: '/customer/search',    component: CustomerSearchView,       meta: { role: 'CLIENT' } },
  { path: '/customer/book/:specId', component: BookingWizardView,     meta: { role: 'CLIENT' } },
  { path: '/customer/sessions/:id', component: SessionDetailView,     meta: { role: 'CLIENT' } },

  { path: '/specialist/dashboard', component: SpecialistDashboardView, meta: { role: 'SPECIALIST' } },
  { path: '/specialist/profile',   component: EditProfileView,         meta: { role: 'SPECIALIST' } },
  { path: '/specialist/slots',     component: SlotManagementView,      meta: { role: 'SPECIALIST' } },
  { path: '/specialist/sessions',  component: SessionRequestsView,     meta: { role: 'SPECIALIST' } },

  { path: '/admin/dashboard',     component: AdminDashboardView,       meta: { role: 'ADMIN' } },
  { path: '/admin/profiles',      component: AdminProfileApprovalView, meta: { role: 'ADMIN' } },
  { path: '/admin/users',         component: AdminUsersView,           meta: { role: 'ADMIN' } },
  { path: '/admin/sessions',      component: AdminSessionsView,        meta: { role: 'ADMIN' } },
  { path: '/admin/categories',    component: AdminCategoriesView,      meta: { role: 'ADMIN' } },
  { path: '/admin/announcements', component: AdminAnnouncementsView,   meta: { role: 'ADMIN' } },
  { path: '/admin/logs',          component: AdminLogsView,            meta: { role: 'ADMIN' } },

  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role  = localStorage.getItem('role')

  if (to.meta.public) return next()
  if (!token) return next('/login')
  if (to.meta.role && to.meta.role !== role) return next(roleHome(role))
  next()
})

export default router
