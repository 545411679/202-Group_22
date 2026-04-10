<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  DataBoard,
  User,
  Calendar,
  Setting,
  Medal,
  Fold,
  Expand,
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)

const menuItems = [
  { path: '/dashboard', title: 'Overview', icon: DataBoard },
  { path: '/users', title: 'Users', icon: User },
  { path: '/specialists', title: 'Specialists', icon: Medal },
  { path: '/appointments', title: 'Appointments', icon: Calendar },
  { path: '/settings', title: 'Settings', icon: Setting },
]
</script>

<template>
  <el-container class="admin-shell">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="aside">
      <div class="brand">
        <span v-if="!appStore.sidebarCollapsed" class="brand-text">Consultation</span>
        <span v-else class="brand-mini">C</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        background-color="#1d1e23"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container direction="vertical" class="main-wrap">
      <el-header class="header">
        <div class="header-left">
          <el-button
            text
            class="collapse-btn"
            @click="appStore.toggleSidebar"
          >
            <el-icon :size="18">
              <Fold v-if="!appStore.sidebarCollapsed" />
              <Expand v-else />
            </el-icon>
          </el-button>
          <span class="breadcrumb">{{ route.meta.title as string }}</span>
        </div>
        <div class="header-right">
          <el-tag type="info" size="small">Admin</el-tag>
        </div>
      </el-header>
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-shell {
  height: 100%;
  min-height: 100vh;
}

.aside {
  background: #1d1e23;
  transition: width 0.2s ease;
  overflow: hidden;
}

.brand {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.02em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.brand-mini {
  font-size: 18px;
}

.el-menu {
  border-right: none;
}

.main-wrap {
  background: #f0f2f5;
  min-width: 0;
}

.header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-btn {
  padding: 8px;
}

.breadcrumb {
  font-size: 15px;
  color: #303133;
}

.main {
  padding: 20px;
  box-sizing: border-box;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
