<template>
  <div class="app-layout">
    <header class="app-header">
      <router-link to="/" class="brand">Consultation Booking</router-link>
      <nav class="header-nav"><slot name="nav" /></nav>
      <div class="header-right">
        <span v-if="userName" class="user-name">{{ userName }}</span>
        <el-tag v-if="roleLabel" size="small" type="info">{{ roleLabel }}</el-tag>
        <router-link to="/account/password" class="pw-link">Change password</router-link>
        <el-button size="small" @click="handleLogout">Sign out</el-button>
      </div>
    </header>
    <main class="app-main"><slot /></main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/index'

const router = useRouter()
const authStore = useAuthStore()
const userName  = computed(() => authStore.userName)
const roleLabel = computed(() => {
  const map = { CLIENT: 'Customer', SPECIALIST: 'Specialist', ADMIN: 'Admin' }
  return map[authStore.role] || ''
})
async function handleLogout() {
  try { await authApi.logout() } catch {}
  authStore.logout()
  router.push('/login')
  ElMessage.success('Signed out.')
}
</script>

<style scoped>
.app-layout { display: flex; flex-direction: column; min-height: 100vh; background: #f5f7fa; }
.app-header {
  display: flex; align-items: center; gap: 16px; padding: 0 24px; height: 56px;
  background: #fff; border-bottom: 1px solid #e4e7ed; flex-shrink: 0;
}
.brand { font-weight: 700; font-size: 15px; color: #303133; text-decoration: none; flex-shrink: 0; }
.header-nav { display: flex; gap: 4px; flex: 1; padding-left: 8px; }
.header-right { display: flex; align-items: center; gap: 10px; margin-left: auto; flex-shrink: 0; }
.user-name { font-size: 13px; color: #606266; }
.pw-link { font-size: 13px; color: #409eff; text-decoration: none; }
.app-main { flex: 1; padding: 24px; max-width: 1100px; width: 100%; margin: 0 auto; }
</style>
