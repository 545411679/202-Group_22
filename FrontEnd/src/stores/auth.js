import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const role = ref(localStorage.getItem('role') || null)
  const userId = ref(localStorage.getItem('userId') || null)
  const specialistId = ref(localStorage.getItem('specialistId') || null)
  const userName = ref(localStorage.getItem('userName') || null)

  const isLoggedIn = computed(() => !!token.value)
  const isClient = computed(() => role.value === 'CLIENT')
  const isSpecialist = computed(() => role.value === 'SPECIALIST')
  const isAdmin = computed(() => role.value === 'ADMIN')

  function login(data) {
    token.value = data.token
    role.value = data.role
    userId.value = data.userId
    specialistId.value = data.specialistId || null
    userName.value = data.userName || data.name || data.email || 'User'

    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('userId', data.userId)
    if (data.specialistId) {
      localStorage.setItem('specialistId', data.specialistId)
    } else {
      localStorage.removeItem('specialistId')
    }
    localStorage.setItem('userName', userName.value)
  }

  function logout() {
    token.value = null
    role.value = null
    userId.value = null
    specialistId.value = null
    userName.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('specialistId')
    localStorage.removeItem('userName')
  }

  return {
    token,
    role,
    userId,
    specialistId,
    userName,
    isLoggedIn,
    isClient,
    isSpecialist,
    isAdmin,
    login,
    logout
  }
})
