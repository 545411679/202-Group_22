<script setup lang="ts">
import { User, Calendar, Clock } from '@element-plus/icons-vue'

const stats = [
  { label: 'Registered users', value: '—', icon: User, color: '#409eff' },
  { label: "Today's bookings", value: '—', icon: Calendar, color: '#67c23a' },
  { label: 'Pending', value: '—', icon: Clock, color: '#e6a23c' },
]
</script>

<template>
  <div class="page">
    <h2 class="page-title">Overview</h2>
    <el-row :gutter="16">
      <el-col v-for="s in stats" :key="s.label" :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <el-icon class="stat-icon" :style="{ color: s.color }">
              <component :is="s.icon" />
            </el-icon>
            <div>
              <div class="stat-label">{{ s.label }}</div>
              <div class="stat-value">{{ s.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="hint-card" shadow="never">
      <p>
        Connect your backend stats API to show live figures. The sidebar already includes routes for
        Users, Specialists, and Appointments.
      </p>
    </el-card>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 36px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  margin-top: 4px;
}

.hint-card {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}
</style>
