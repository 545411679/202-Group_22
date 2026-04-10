<template>
  <AppLayout>
    <div class="booking-detail">
      <div class="page-header">
        <el-button :icon="ArrowLeft" @click="router.push('/client/dashboard')">
          Back to Dashboard
        </el-button>
        <h2>Booking Detail</h2>
      </div>

      <el-card v-loading="loading" class="detail-card">
        <template v-if="booking">
          <div class="status-row">
            <span class="status-label">Status:</span>
            <el-tag :type="statusTagType(booking.status)" size="large">
              {{ booking.status }}
            </el-tag>
          </div>

          <el-descriptions
            :column="2"
            border
            class="booking-descriptions"
          >
            <el-descriptions-item label="Booking ID">
              {{ booking.id }}
            </el-descriptions-item>
            <el-descriptions-item label="Specialist">
              {{ booking.specialistName || booking.specialist?.name || '—' }}
            </el-descriptions-item>
            <el-descriptions-item label="Specialty">
              {{ booking.specialty || booking.specialist?.specialty || '—' }}
            </el-descriptions-item>
            <el-descriptions-item label="Date">
              {{ formatDate(booking.date || booking.slotDate) }}
            </el-descriptions-item>
            <el-descriptions-item label="Time">
              {{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="Fee">
              {{ booking.fee != null ? `¥${booking.fee}` : '—' }}
            </el-descriptions-item>
            <el-descriptions-item label="Contact">
              {{ booking.contact || '—' }}
            </el-descriptions-item>
            <el-descriptions-item label="Topic">
              {{ booking.topic || '—' }}
            </el-descriptions-item>
            <el-descriptions-item label="Notes" :span="2">
              {{ booking.notes || '—' }}
            </el-descriptions-item>
            <el-descriptions-item label="Created At" :span="2">
              {{ booking.createdAt || '—' }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="action-row">
            <el-button
              v-if="booking.status === 'PENDING' || booking.status === 'CONFIRMED'"
              type="danger"
              :loading="cancelling"
              @click="handleCancel"
            >
              Cancel Booking
            </el-button>
          </div>
        </template>

        <el-empty v-else-if="!loading" description="Booking not found" />
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import AppLayout from '../../components/AppLayout.vue'
import { dashboardApi, bookingApi } from '../../api/index'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const cancelling = ref(false)
const booking = ref(null)

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

async function loadDetail() {
  loading.value = true
  try {
    const res = await dashboardApi.getAppointmentDetail(route.params.id)
    booking.value = res.data
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to load booking detail')
  } finally {
    loading.value = false
  }
}

async function handleCancel() {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      'Cancel Booking',
      {
        confirmButtonText: 'Yes, Cancel',
        cancelButtonText: 'Keep Booking',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  cancelling.value = true
  try {
    await bookingApi.updateStatus(booking.value.id, { action: 'CANCEL' })
    ElMessage.success('Booking cancelled successfully')
    await loadDetail()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to cancel booking')
  } finally {
    cancelling.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.booking-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.detail-card {
  border-radius: 8px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.status-label {
  font-weight: 600;
  font-size: 15px;
  color: #555;
}

.booking-descriptions {
  margin-bottom: 24px;
}

.action-row {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
