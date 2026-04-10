<template>
  <AppLayout>
    <div class="bookings-view">
      <div class="page-header">
        <h2>My Bookings</h2>
      </div>

      <!-- Filter -->
      <el-card class="filter-card">
        <el-row :gutter="16" align="middle">
          <el-col :span="6">
            <el-select
              v-model="filterStatus"
              placeholder="Filter by status"
              clearable
              style="width: 100%"
              @change="loadBookings"
            >
              <el-option label="All" value="" />
              <el-option label="PENDING" value="PENDING" />
              <el-option label="CONFIRMED" value="CONFIRMED" />
              <el-option label="COMPLETED" value="COMPLETED" />
              <el-option label="CANCELLED" value="CANCELLED" />
              <el-option label="REJECTED" value="REJECTED" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button :icon="Refresh" @click="loadBookings">Refresh</el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- Bookings table -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="bookings"
          stripe
          border
          style="width: 100%"
          empty-text="No bookings found"
        >
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column label="Customer" min-width="140">
            <template #default="{ row }">
              {{ row.clientName || row.client?.name || '—' }}
            </template>
          </el-table-column>
          <el-table-column label="Date" width="120">
            <template #default="{ row }">{{ formatDate(row.date || row.slotDate) }}</template>
          </el-table-column>
          <el-table-column label="Time" width="130">
            <template #default="{ row }">
              {{ formatTime(row.startTime) }} - {{ formatTime(row.endTime) }}
            </template>
          </el-table-column>
          <el-table-column label="Fee" width="90">
            <template #default="{ row }">
              {{ row.fee != null ? `¥${row.fee}` : '—' }}
            </template>
          </el-table-column>
          <el-table-column label="Topic" min-width="140">
            <template #default="{ row }">{{ row.topic || '—' }}</template>
          </el-table-column>
          <el-table-column label="Status" width="130">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="240" fixed="right">
            <template #default="{ row }">
              <template v-if="row.status === 'PENDING'">
                <el-button
                  type="success"
                  size="small"
                  :loading="actionLoadingId === row.id + '_confirm'"
                  @click="handleAction(row, 'CONFIRM')"
                >
                  Confirm
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :loading="actionLoadingId === row.id + '_reject'"
                  @click="handleAction(row, 'REJECT')"
                >
                  Reject
                </el-button>
              </template>
              <template v-else-if="row.status === 'CONFIRMED'">
                <el-button
                  type="primary"
                  size="small"
                  :loading="actionLoadingId === row.id + '_complete'"
                  @click="handleAction(row, 'COMPLETE')"
                >
                  Complete
                </el-button>
              </template>
              <span v-else class="no-action">—</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import AppLayout from '../../components/AppLayout.vue'
import { specialistApi, bookingApi } from '../../api/index'

const loading = ref(false)
const bookings = ref([])
const filterStatus = ref('')
const actionLoadingId = ref('')

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

async function loadBookings() {
  loading.value = true
  try {
    const params = {}
    if (filterStatus.value) params.status = filterStatus.value
    const res = await specialistApi.getMyBookings(params)
    bookings.value = res.data || []
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to load bookings')
  } finally {
    loading.value = false
  }
}

async function handleAction(row, action) {
  const actionLabels = {
    CONFIRM: 'confirm',
    REJECT: 'reject',
    COMPLETE: 'mark as complete'
  }

  if (action === 'REJECT') {
    try {
      await ElMessageBox.confirm(
        `Are you sure you want to reject this booking?`,
        'Reject Booking',
        {
          confirmButtonText: 'Reject',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
    } catch {
      return
    }
  }

  const loadingKey = `${row.id}_${action.toLowerCase()}`
  actionLoadingId.value = loadingKey
  try {
    await bookingApi.updateStatus(row.id, { action })
    ElMessage.success(`Booking ${actionLabels[action]}ed successfully`)
    await loadBookings()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || `Failed to ${actionLabels[action]} booking`)
  } finally {
    actionLoadingId.value = ''
  }
}

onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.bookings-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.filter-card :deep(.el-card__body) {
  padding: 16px;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.no-action {
  color: #bbb;
  font-size: 14px;
}
</style>
