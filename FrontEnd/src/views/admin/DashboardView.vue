<template>
  <AdminLayout>
    <div class="page-title">Dashboard</div>

    <div v-loading="loading">
      <!-- Stats row -->
      <el-row :gutter="16" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-num">{{ stats.totalUsers ?? '—' }}</div>
            <div class="stat-label">Total Users</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-num pending-color">{{ stats.pendingApprovals ?? '—' }}</div>
            <div class="stat-label">Pending Approvals</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-num">{{ stats.totalSessions ?? '—' }}</div>
            <div class="stat-label">Total Sessions</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-num">{{ stats.totalSpecialists ?? '—' }}</div>
            <div class="stat-label">Active Specialists</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Pending approvals shortcut -->
      <el-card class="section-card" v-if="pendingProfiles.length > 0">
        <template #header>
          <div class="card-header-row">
            <span class="section-title">Pending profile approvals <el-badge :value="pendingProfiles.length" type="warning" /></span>
            <router-link to="/admin/profiles"><el-button size="small" type="primary">Review all</el-button></router-link>
          </div>
        </template>
        <el-table :data="pendingProfiles.slice(0, 5)" stripe>
          <el-table-column label="Specialist" prop="name" />
          <el-table-column label="Specialty" prop="specialty" />
          <el-table-column label="Submitted" width="130">
            <template #default="{ row }">{{ formatDate(row.updatedAt || row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="" width="100">
            <router-link to="/admin/profiles"><el-button text size="small" type="primary">Review →</el-button></router-link>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Recent logs -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header-row">
            <span class="section-title">Recent activity</span>
            <router-link to="/admin/logs"><el-button size="small">View all logs</el-button></router-link>
          </div>
        </template>
        <el-empty v-if="recentLogs.length === 0" description="No recent activity." :image-size="40" />
        <el-table v-else :data="recentLogs" stripe>
          <el-table-column label="Actor" width="140">
            <template #default="{ row }">{{ row.actorName || `User #${row.actorId}` }}</template>
          </el-table-column>
          <el-table-column label="Action" min-width="160">
            <template #default="{ row }"><el-tag type="info" size="small">{{ row.action }}</el-tag></template>
          </el-table-column>
          <el-table-column label="Time" width="150">
            <template #default="{ row }">{{ formatDatetime(row.timestamp || row.createdAt) }}</template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import { adminApi } from '../../api/index'

const loading = ref(true)
const stats = ref({})
const pendingProfiles = ref([])
const recentLogs = ref([])

function formatDate(dt) { return dt ? String(dt).slice(0, 10) : '—' }
function formatDatetime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(async () => {
  try {
    const [usersRes, pendingRes, logsRes, sessionsRes] = await Promise.allSettled([
      adminApi.getUsers({}),
      adminApi.getPendingProfiles(),
      adminApi.getLogs({ page: 0, size: 8 }),
      adminApi.getBookings({})
    ])

    const users = usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : []
    const pending = pendingRes.status === 'fulfilled' ? (pendingRes.value.data || []) : []
    const logs = logsRes.status === 'fulfilled' ? (logsRes.value.data || []) : []
    const sessions = sessionsRes.status === 'fulfilled' ? (sessionsRes.value.data || []) : []

    pendingProfiles.value = pending
    recentLogs.value = Array.isArray(logs) ? logs.slice(0, 8) : (logs.content || []).slice(0, 8)

    stats.value = {
      totalUsers: users.length,
      pendingApprovals: pending.length,
      totalSessions: Array.isArray(sessions) ? sessions.length : (sessions.totalElements ?? sessions.length ?? 0),
      totalSpecialists: users.filter(u => u.role === 'SPECIALIST').length
    }
  } catch {} finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.stats-row { margin-bottom: 16px; }
.stat-card { text-align: center; padding: 8px 0; }
.stat-num { font-size: 28px; font-weight: 700; color: #409eff; }
.pending-color { color: #e6a23c; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
.section-card { margin-bottom: 16px; }
.card-header-row { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-weight: 600; font-size: 14px; }
</style>
