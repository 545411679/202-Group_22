<template>
  <AdminLayout>
    <div class="page-title">Sessions</div>

    <el-card class="section-card">
      <template #header>
        <div class="card-header-row">
          <span class="section-title">All sessions (read-only monitor)</span>
          <div class="header-actions">
            <el-select v-model="filterStatus" placeholder="Status" clearable size="small" style="width:140px" @change="applyFilter">
              <el-option label="All" value="" />
              <el-option label="Pending" value="PENDING" />
              <el-option label="Confirmed" value="CONFIRMED" />
              <el-option label="Completed" value="COMPLETED" />
              <el-option label="Cancelled" value="CANCELLED" />
            </el-select>
            <el-button size="small" @click="load">Refresh</el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <el-empty v-if="!loading && filteredSessions.length === 0" description="No sessions." :image-size="48" />
        <el-table v-else :data="pageData" stripe border>
          <el-table-column prop="bookingId" label="ID" width="70" />
          <el-table-column label="Customer" min-width="120">
            <template #default="{ row }">{{ row.customerName || '—' }}</template>
          </el-table-column>
          <el-table-column label="Specialist" min-width="120">
            <template #default="{ row }">{{ row.specialistName || '—' }}</template>
          </el-table-column>
          <el-table-column label="Specialty" min-width="120">
            <template #default="{ row }">{{ row.specialty || '—' }}</template>
          </el-table-column>
          <el-table-column label="Slot" width="160">
            <template #default="{ row }">{{ formatDatetime(row.scheduledTime) }}</template>
          </el-table-column>
          <el-table-column label="Status" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Booked on" width="110">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
        </el-table>

        <div class="pagination-row" v-if="filteredSessions.length > size">
          <el-pagination v-model:current-page="currentPage" :page-size="size" :total="filteredSessions.length" layout="prev, pager, next" small />
        </div>
      </div>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AdminLayout from '../../components/AdminLayout.vue'
import { adminApi } from '../../api/index'
import { usePagination } from '../../composables/usePagination'

const { currentPage, size, paginate, reset } = usePagination(15)
const loading = ref(true)
const sessions = ref([])
const filterStatus = ref('')

const filteredSessions = computed(() => {
  if (!filterStatus.value) return sessions.value
  return sessions.value.filter(s => s.status === filterStatus.value)
})
const pageData = computed(() => paginate(filteredSessions.value))
function applyFilter() { reset() }

function statusType(s) {
  return { PENDING: 'warning', CONFIRMED: 'success', COMPLETED: 'info', CANCELLED: 'danger' }[s] || ''
}
function formatDate(dt) { return dt ? String(dt).slice(0, 10) : '—' }
function formatDatetime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
}

async function load() {
  loading.value = true
  try { sessions.value = (await adminApi.getBookings({})).data || [] }
  catch { sessions.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.section-card { margin-bottom: 12px; }
.card-header-row { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-weight: 600; font-size: 14px; }
.header-actions { display: flex; gap: 8px; }
.pagination-row { display: flex; justify-content: center; margin-top: 14px; }
</style>
