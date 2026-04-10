<template>
  <AppLayout>
    <template #nav>
      <router-link to="/specialist/dashboard"><el-button text>Dashboard</el-button></router-link>
      <router-link to="/specialist/slots"><el-button text>My Slots</el-button></router-link>
      <router-link to="/specialist/sessions"><el-button text type="primary">Session Requests</el-button></router-link>
      <router-link to="/specialist/profile"><el-button text>Edit Profile</el-button></router-link>
    </template>

    <div class="page-title">Session Requests</div>

    <el-card class="section-card">
      <template #header>
        <div class="card-header-row">
          <span class="section-title">All bookings</span>
          <div class="header-actions">
            <el-select v-model="filterStatus" placeholder="Filter status" clearable size="small" style="width:150px" @change="applyFilter">
              <el-option label="All" value="" />
              <el-option label="Pending" value="PENDING" />
              <el-option label="Confirmed" value="CONFIRMED" />
              <el-option label="Completed" value="COMPLETED" />
              <el-option label="Cancelled" value="CANCELLED" />
            </el-select>
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <el-empty v-if="!loading && filteredBookings.length === 0" description="No session requests." :image-size="48" />
        <el-table v-else :data="pageData" stripe border>
          <el-table-column label="Customer" min-width="120">
            <template #default="{ row }">{{ row.customerName || '—' }}</template>
          </el-table-column>
          <el-table-column label="Slot" width="180">
            <template #default="{ row }">{{ formatDatetime(row.scheduledTime) }}</template>
          </el-table-column>
          <el-table-column label="Topic" min-width="140">
            <template #default="{ row }">{{ row.topic || '—' }}</template>
          </el-table-column>
          <el-table-column label="Status" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="220">
            <template #default="{ row }">
              <template v-if="row.status === 'PENDING'">
                <el-button size="small" type="success" :loading="actionId === row.bookingId" @click="updateStatus(row, 'CONFIRMED')">Confirm</el-button>
                <el-button size="small" type="danger"  :loading="actionId === row.bookingId" @click="updateStatus(row, 'CANCELLED')">Reject</el-button>
              </template>
              <template v-else-if="row.status === 'CONFIRMED'">
                <el-button size="small" type="primary" :loading="actionId === row.bookingId" @click="updateStatus(row, 'COMPLETED')">Complete</el-button>
                <el-button size="small" type="danger"  :loading="actionId === row.bookingId" @click="updateStatus(row, 'CANCELLED')">Cancel</el-button>
              </template>
              <span v-else class="dash">—</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-row" v-if="filteredBookings.length > size">
          <el-pagination v-model:current-page="currentPage" :page-size="size" :total="filteredBookings.length" layout="prev, pager, next" small />
        </div>
      </div>
    </el-card>

    <!-- Detail drawer -->
    <el-drawer v-model="showDetail" title="Booking detail" size="380px" direction="rtl">
      <div v-if="detail" class="detail-body">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="Booking ID">#{{ detail.bookingId }}</el-descriptions-item>
          <el-descriptions-item label="Customer">{{ detail.customerName }}</el-descriptions-item>
          <el-descriptions-item label="Slot">{{ formatDatetime(detail.scheduledTime) }}</el-descriptions-item>
          <el-descriptions-item label="Contact">{{ detail.contact }}</el-descriptions-item>
          <el-descriptions-item label="Topic">{{ detail.topic || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Notes">{{ detail.notes || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag :type="statusType(detail.status)" size="small">{{ detail.status }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { specialistApi, bookingApi } from '../../api/index'
import { usePagination } from '../../composables/usePagination'

const { currentPage, size, paginate, reset } = usePagination(10)
const loading = ref(true)
const bookings = ref([])
const filterStatus = ref('')
const actionId = ref(null)
const showDetail = ref(false)
const detail = ref(null)

const filteredBookings = computed(() => {
  if (!filterStatus.value) return bookings.value
  return bookings.value.filter(b => b.status === filterStatus.value)
})
const pageData = computed(() => paginate(filteredBookings.value))
function applyFilter() { reset() }

function statusType(s) {
  return { PENDING: 'warning', CONFIRMED: 'success', COMPLETED: 'info', CANCELLED: 'danger' }[s] || ''
}
function formatDatetime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
}

async function load() {
  loading.value = true
  try { bookings.value = (await specialistApi.getBookings()).data || [] }
  catch { bookings.value = [] }
  finally { loading.value = false }
}

async function updateStatus(row, newStatus) {
  // newStatus is the target status; map to backend action verb
  const actionMap = { CONFIRMED: 'CONFIRM', CANCELLED: 'CANCEL', COMPLETED: 'COMPLETE' }
  const labels    = { CONFIRMED: 'Confirm', CANCELLED: 'Cancel / Reject', COMPLETED: 'Mark as completed' }
  try {
    await ElMessageBox.confirm(`${labels[newStatus]} booking #${row.bookingId}?`, 'Confirm', { type: 'warning' })
  } catch { return }

  actionId.value = row.bookingId
  try {
    await bookingApi.updateStatus(row.bookingId, { action: actionMap[newStatus] })
    ElMessage.success('Status updated.')
    load()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Update failed.')
  } finally {
    actionId.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.section-card { margin-bottom: 12px; }
.card-header-row { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-weight: 600; font-size: 14px; }
.header-actions { display: flex; gap: 8px; }
.dash { color: #c0c4cc; }
.pagination-row { display: flex; justify-content: center; margin-top: 14px; }
.detail-body { padding: 4px 0; }
</style>
