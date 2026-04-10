<template>
  <AppLayout>
    <template #nav>
      <router-link to="/specialist/dashboard"><el-button text type="primary">Dashboard</el-button></router-link>
      <router-link to="/specialist/slots"><el-button text>My Slots</el-button></router-link>
      <router-link to="/specialist/sessions"><el-button text>Session Requests</el-button></router-link>
      <router-link to="/specialist/profile"><el-button text>Edit Profile</el-button></router-link>
    </template>

    <div v-loading="loading" class="dashboard-wrap">
      <!-- Profile status bar -->
      <el-card class="status-bar">
        <div class="status-row">
          <span>Profile:&nbsp;<el-tag :type="profileStatusType">{{ profile?.status || '—' }}</el-tag></span>
          <router-link to="/specialist/profile">
            <el-button size="small">Edit profile</el-button>
          </router-link>
        </div>
        <div v-if="profile?.status === 'PENDING'" class="pending-note">
          Your profile is under review. It will be visible to customers once approved.
        </div>
      </el-card>

      <!-- Upcoming sessions -->
      <el-card class="section-card">
        <template #header><span class="section-title">Upcoming sessions</span></template>
        <el-empty v-if="upcoming.length === 0" description="No upcoming sessions." :image-size="48" />
        <el-table v-else :data="upcoming" stripe>
          <el-table-column label="Customer" prop="customerName" />
          <el-table-column label="Date / Time" width="150">
            <template #default="{ row }">{{ formatDatetime(row.scheduledTime) }}</template>
          </el-table-column>
          <el-table-column label="Status" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="" width="100">
            <template #default>
              <router-link to="/specialist/sessions"><el-button text size="small" type="primary">View →</el-button></router-link>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <div class="quick-links">
        <router-link to="/specialist/slots"><el-button>Manage slots</el-button></router-link>
        <router-link to="/specialist/sessions"><el-button type="primary">View all session requests</el-button></router-link>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../../components/AppLayout.vue'
import { specialistApi } from '../../api/index'

const loading = ref(true)
const profile = ref(null)
const bookings = ref([])

const profileStatusType = computed(() => {
  return { ACTIVE: 'success', PENDING: 'warning', REJECTED: 'danger' }[profile.value?.status] || 'info'
})

const upcoming = computed(() =>
  bookings.value.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').slice(0, 5)
)

function statusType(s) {
  return { PENDING: 'warning', CONFIRMED: 'success', COMPLETED: 'info', CANCELLED: 'danger' }[s] || ''
}
function formatDatetime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(async () => {
  try {
    const [pRes, bRes] = await Promise.all([
      specialistApi.getOwnProfile(),
      specialistApi.getBookings()
    ])
    profile.value = pRes.data
    bookings.value = bRes.data || []
  } catch {} finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard-wrap { display: flex; flex-direction: column; gap: 16px; }
.status-bar { }
.status-row { display: flex; align-items: center; justify-content: space-between; }
.pending-note { margin-top: 8px; font-size: 13px; color: #e6a23c; }
.section-title { font-weight: 600; font-size: 14px; }
.section-card { }
.quick-links { display: flex; gap: 12px; }
</style>
