<template>
  <AppLayout>
    <template #nav>
      <router-link to="/customer/dashboard"><el-button text>Dashboard</el-button></router-link>
      <router-link to="/customer/search"><el-button text>Find Specialists</el-button></router-link>
    </template>

    <el-button text @click="$router.push('/customer/dashboard')">← All my sessions</el-button>

    <div v-loading="loading" class="detail-wrap">
      <template v-if="session">
        <div class="booking-id">Booking #{{ session.bookingId }} · <el-tag :type="statusType(session.status)">{{ session.status }}</el-tag></div>

        <el-card class="detail-card">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Specialist">
              <router-link :to="`/specialists/${session.specialistId}`" class="spec-link">{{ session.specialistName }} ↗</router-link>
            </el-descriptions-item>
            <el-descriptions-item label="Specialty">{{ session.specialty }}</el-descriptions-item>
            <el-descriptions-item label="Slot">{{ session.scheduledTime ? formatDatetime(session.scheduledTime) : '—' }}</el-descriptions-item>
            <el-descriptions-item label="Contact">{{ session.contact }}</el-descriptions-item>
            <el-descriptions-item label="Topic">{{ session.topic || '—' }}</el-descriptions-item>
            <el-descriptions-item label="Notes">{{ session.notes || '—' }}</el-descriptions-item>
            <el-descriptions-item label="Session fee"><strong>¥{{ session.feeAmount }}</strong></el-descriptions-item>
            <el-descriptions-item label="Booked on">{{ formatDate(session.createdAt) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <div class="action-row" v-if="canCancel">
          <el-popconfirm title="Cancel this booking?" @confirm="handleCancel">
            <template #reference>
              <el-button type="danger" :loading="cancelling">Cancel booking</el-button>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { dashboardApi, bookingApi } from '../../api/index'

const route = useRoute()
const loading = ref(true)
const cancelling = ref(false)
const session = ref(null)

const canCancel = computed(() =>
  session.value && ['PENDING', 'CONFIRMED'].includes(session.value.status)
)

function statusType(s) {
  return { PENDING: 'warning', CONFIRMED: 'success', COMPLETED: 'info', CANCELLED: 'danger' }[s] || ''
}
function formatDate(dt) { return dt ? String(dt).slice(0, 10) : '—' }
function formatDatetime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

async function load() {
  try {
    session.value = (await dashboardApi.getAppointment(route.params.id)).data
  } catch {
    ElMessage.error('Failed to load session.')
  } finally {
    loading.value = false
  }
}

async function handleCancel() {
  cancelling.value = true
  try {
    await bookingApi.updateStatus(session.value.bookingId, { action: 'CANCEL' })
    ElMessage.success('Booking cancelled.')
    await load()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Cancel failed.')
  } finally {
    cancelling.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.detail-wrap { margin-top: 12px; }
.booking-id { font-size: 16px; font-weight: 600; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
.detail-card { margin-bottom: 16px; }
.spec-link { color: #409eff; text-decoration: none; }
.action-row { margin-top: 4px; }
</style>
