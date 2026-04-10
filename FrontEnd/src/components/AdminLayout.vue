<template>
  <div class="admin-layout">
    <header class="app-header">
      <span class="brand">Consultation Booking</span>
      <div class="header-right">
        <span class="user-name">{{ authStore.userName }}</span>
        <el-tag size="small" type="danger">Admin</el-tag>
        <router-link to="/account/password" class="pw-link">Change password</router-link>
        <el-button size="small" @click="handleLogout">Sign out</el-button>
      </div>
    </header>
    <div class="admin-body">
      <aside class="sidebar">
        <el-menu :default-active="$route.path" router class="side-menu">
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataAnalysis /></el-icon><span>Dashboard</span>
          </el-menu-item>
          <el-menu-item index="/admin/profiles">
            <el-icon><UserFilled /></el-icon><span>Profile Approval</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon><span>Users</span>
          </el-menu-item>
          <el-menu-item index="/admin/sessions">
            <el-icon><Calendar /></el-icon><span>Sessions</span>
          </el-menu-item>
          <el-menu-item index="/admin/categories">
            <el-icon><Grid /></el-icon><span>Categories</span>
          </el-menu-item>
          <el-menu-item index="/admin/announcements">
            <el-icon><Bell /></el-icon><span>Announcements</span>
          </el-menu-item>
          <el-menu-item index="/admin/logs">
            <el-icon><Document /></el-icon><span>Activity Logs</span>
          </el-menu-item>
        </el-menu>
      </aside>
      <main class="admin-main"><slot /></main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DataAnalysis, UserFilled, User, Calendar, Grid, Bell, Document } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/index'

const router = useRouter()
const authStore = useAuthStore()
async function handleLogout() {
  try { await authApi.logout() } catch {}
  authStore.logout()
  router.push('/login')
  ElMessage.success('Signed out.')
}
</script>

<style scoped>
.admin-layout { display: flex; flex-direction: column; min-height: 100vh; background: #f0f2f5; }
.app-header {
  display: flex; align-items: center; padding: 0 24px; height: 56px;
  background: #fff; border-bottom: 1px solid #e4e7ed; flex-shrink: 0; gap: 12px;
}
.brand { font-weight: 700; font-size: 15px; color: #303133; flex: 1; }
.header-right { display: flex; align-items: center; gap: 10px; }
.user-name { font-size: 13px; color: #606266; }
.pw-link { font-size: 13px; color: #409eff; text-decoration: none; }
.admin-body { display: flex; flex: 1; overflow: hidden; }
.sidebar { width: 200px; flex-shrink: 0; background: #fff; border-right: 1px solid #e4e7ed; }
.side-menu { border-right: none; height: 100%; }
.admin-main { flex: 1; padding: 24px; overflow-y: auto; }
</style>
