import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: 'Overview' },
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/UsersView.vue'),
          meta: { title: 'Users' },
        },
        {
          path: 'specialists',
          name: 'Specialists',
          component: () => import('@/views/SpecialistsView.vue'),
          meta: { title: 'Specialists' },
        },
        {
          path: 'appointments',
          name: 'Appointments',
          component: () => import('@/views/AppointmentsView.vue'),
          meta: { title: 'Appointments' },
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/SettingsView.vue'),
          meta: { title: 'Settings' },
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: 'Sign in', public: true },
    },
  ],
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · Admin` : 'Admin'
})

export default router
