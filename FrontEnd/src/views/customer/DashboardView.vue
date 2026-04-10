<template>
  <AppLayout>
    <template #nav>
      <router-link to="/customer/dashboard"><el-button text>Dashboard</el-button></router-link>
      <router-link to="/customer/search"><el-button text>Find Specialists</el-button></router-link>
    </template>

    <div class="page-title">Welcome, {{ authStore.userName }}</div>

    <!-- Approaching section -->
    <el-card class="section-card">
      <template #header><span class="section-title">Approaching</span></template>
      <div v-if="approaching">
        <div class="approaching-info">
          <div class="approaching-time">{{ formatDatetime(approaching.scheduledTime) }}</div>
          <div class="approaching-spec">{{ approaching.specialistName }} · {{ approaching.specialty }}</div>
        </div>
        <div class="approaching-actions">
          <router-link :to="`/customer/sessions/${approaching.bookingId}`">
            <el-button size="small">View session</el-button>
          </router-link>
          <router-link to="/customer/dashboard">
            <el-button size="small" text>View all →</el-button>
          </router-link>
        </div>
      </div>
      <el-empty v-else description="No sessions in next 24 hours." :image-size="48" />
    </el-card>

    <!-- All sessions -->
    <el-card class="section-card">
      <template #header>
        <div class="list-header">
          <span class="section-title">All my sessions</span>
          <div class="list-filters">
            <el-select v-model="statusFilter" placeholder="Status" clearable size="small" style="width:130px" @change="applyFilter">
              <el-option v-for="s in statuses" :key="s" :label="s" :value="s" />
            </el-select>
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <el-empty v-if="!loading && filteredSessions.length === 0" description="No sessions yet." :image-size="48" />
        <el-table v-else :data="pageData" stripe>
          <el-table-column label="Specialist" prop="specialistName" />
          <el-table-column label="Specialty" prop="specialty" />
          <el-table-column label="Date" width="110">
            <template #default="{ row }">{{ formatDate(row.scheduledTime) }}</template>
          </el-table-column>
          <el-table-column label="Fee" width="90">
            <template #default="{ row }">¥{{ row.feeAmount }}</template>
          </el-table-column>
          <el-table-column label="Status" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="" width="80">
            <template #default="{ row }">
              <router-link :to="`/customer/sessions/${row.bookingId}`">
                <el-button size="small" text type="primary">Detail</el-button>
              </router-link>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-row" v-if="filteredSessions.length > size">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="size"
            :total="filteredSessions.length"
            layout="prev, pager, next"
            small
          />
        </div>
      </div>
    </el-card>

    <!-- Quick search -->
    <el-card class="section-card">
      <template #header><span class="section-title">Find a specialist</span></template>
      <div class="quick-search">
        <el-input v-model="quickSearch" placeholder="Search name…" clearable style="max-width:280px" @keyup.enter="goSearch" />
        <el-button type="primary" @click="goSearch">Search</el-button>
      </div>
    </el-card>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { dashboardApi } from '../../api/index'
import { useAuthStore } from '../../stores/auth'
import { usePagination } from '../../composables/usePagination'

const router = useRouter()
const authStore = useAuthStore()
const { currentPage, size, paginate, reset } = usePagination(8)

const loading = ref(false)
const sessions = ref([])
const statusFilter = ref('')
const quickSearch = ref('')
const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

const approaching = computed(() => {
  const now = Date.now()
  const in24 = now + 24 * 60 * 60 * 1000
  return sessions.value.find(s => {
    const t = new Date(s.scheduledTime).getTime()
    return (s.status === 'CONFIRMED' || s.status === 'PENDING') && t >= now && t <= in24
  }) || null
})

const filteredSessions = computed(() => {
  if (!statusFilter.value) return sessions.value
  return sessions.value.filter(s => s.status === statusFilter.value)
})

const pageData = computed(() => paginate(filteredSessions.value))

function applyFilter() { reset() }

function statusType(s) {
  return { PENDING: 'warning', CONFIRMED: 'success', COMPLETED: 'info', CANCELLED: 'danger' }[s] || ''
}
function formatDate(dt) { return dt ? String(dt).slice(0, 10) : '—' }
function formatDatetime(dt) {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

async function load() {
  loading.value = true
  try {
    sessions.value = (await dashboardApi.getAppointments()).data || []
  } catch {
    sessions.value = []
  } finally {
    loading.value = false
  }
}

function goSearch() {
  const q = quickSearch.value.trim()
  router.push(q ? `/customer/search?name=${encodeURIComponent(q)}` : '/customer/search')
}

onMounted(load)
</script>

<style scoped>
.page-title { font-size: 20px; font-weight: 700; color: #303133; margin-bottom: 16px; }
.section-card { margin-bottom: 16px; }
.section-title { font-weight: 600; font-size: 14px; }
.list-header { display: flex; align-items: center; justify-content: space-between; }
.approaching-info { margin-bottom: 10px; }
.approaching-time { font-size: 15px; font-weight: 600; color: #303133; }
.approaching-spec { font-size: 13px; color: #666; margin-top: 2px; }
.approaching-actions { display: flex; gap: 8px; }
.pagination-row { display: flex; justify-content: center; margin-top: 14px; }
.quick-search { display: flex; gap: 8px; align-items: center; }
</style>
