<template>
  <AppLayout>
    <div class="dashboard">
      <div class="page-header">
        <h2>My Appointments</h2>
      </div>

      <!-- Upcoming alert -->
      <el-alert
        v-if="upcomingCount > 0"
        :title="`You have ${upcomingCount} upcoming appointment(s) within the next 24 hours.`"
        type="warning"
        show-icon
        :closable="false"
        class="upcoming-alert"
      />

      <!-- Filters -->
      <el-card class="filter-card">
        <el-row :gutter="16" align="middle">
          <el-col :span="6">
            <el-select v-model="filterStatus" placeholder="Filter by status" clearable style="width: 100%" @change="loadAppointments">
              <el-option label="All" value="" />
              <el-option label="PENDING" value="PENDING" />
              <el-option label="CONFIRMED" value="CONFIRMED" />
              <el-option label="CANCELLED" value="CANCELLED" />
              <el-option label="REJECTED" value="REJECTED" />
              <el-option label="COMPLETED" value="COMPLETED" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="sortBy" placeholder="Sort by" style="width: 100%" @change="loadAppointments">
              <el-option label="Booking ID" value="id" />
              <el-option label="Date" value="date" />
              <el-option label="Fee" value="fee" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="sortOrder" placeholder="Order" style="width: 100%" @change="loadAppointments">
              <el-option label="Ascending" value="asc" />
              <el-option label="Descending" value="desc" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" :icon="Refresh" @click="loadAppointments">Refresh</el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- Appointments table -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="appointments"
          stripe
          border
          style="width: 100%"
          empty-text="No appointments found"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="Specialist" min-width="150">
            <template #default="{ row }">
              {{ row.specialistName || row.specialist?.name || '—' }}
            </template>
          </el-table-column>
          <el-table-column label="Date" width="120">
            <template #default="{ row }">
              {{ formatDate(row.date || row.slotDate) }}
            </template>
          </el-table-column>
          <el-table-column label="Time" width="130">
            <template #default="{ row }">
              {{ formatTime(row.startTime) }} - {{ formatTime(row.endTime) }}
            </template>
          </el-table-column>
          <el-table-column label="Fee" width="100">
            <template #default="{ row }">
              {{ row.fee != null ? `¥${row.fee}` : '—' }}
            </template>
          </el-table-column>
          <el-table-column label="Status" width="130">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="130" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                plain
                @click="viewDetail(row.id)"
              >
                View Detail
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import AppLayout from '../../components/AppLayout.vue'
import { dashboardApi } from '../../api/index'

const router = useRouter()
const loading = ref(false)
const appointments = ref([])
const filterStatus = ref('')
const sortBy = ref('id')
const sortOrder = ref('desc')

const upcomingCount = computed(() => {
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  return appointments.value.filter((a) => {
    if (a.status !== 'CONFIRMED' && a.status !== 'PENDING') return false
    const dateStr = a.date || a.slotDate
    const timeStr = a.startTime
    if (!dateStr) return false
    const dt = new Date(`${dateStr}T${timeStr || '00:00'}`)
    return dt >= now && dt <= in24h
  }).length
})

function statusTagType(status) {
  const map = {
    CONFIRMED: 'success',
    PENDING: 'warning',
    CANCELLED: 'danger',
    REJECTED: 'danger',
    COMPLETED: 'info'
  }
  return map[status] || ''
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dateStr.slice(0, 10)
}

function formatTime(timeStr) {
  if (!timeStr) return '—'
  return timeStr.slice(0, 5)
}

function viewDetail(id) {
  router.push(`/client/booking/${id}`)
}

async function loadAppointments() {
  loading.value = true
  try {
    const params = {}
    if (filterStatus.value) params.status = filterStatus.value
    if (sortBy.value) params.sortBy = sortBy.value
    if (sortOrder.value) params.order = sortOrder.value
    const res = await dashboardApi.getAppointments(params)
    appointments.value = res.data || []
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to load appointments')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.upcoming-alert {
  border-radius: 8px;
}

.filter-card :deep(.el-card__body) {
  padding: 16px;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}
</style>
