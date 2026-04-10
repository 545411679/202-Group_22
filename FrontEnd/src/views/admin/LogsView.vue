<template>
  <AdminLayout>
    <div class="page-title">Activity Logs</div>

    <el-card class="section-card">
      <template #header>
        <div class="card-header-row">
          <span class="section-title">System activity</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="–"
              start-placeholder="From"
              end-placeholder="To"
              value-format="YYYY-MM-DD"
              size="small"
              style="width:240px"
              @change="applyFilter"
            />
            <el-button size="small" @click="load">Refresh</el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <el-empty v-if="!loading && filteredLogs.length === 0" description="No logs." :image-size="48" />
        <el-table v-else :data="pageData" stripe border>
          <el-table-column prop="id" label="ID" width="75" />
          <el-table-column label="Actor" width="160">
            <template #default="{ row }">
              <div>{{ row.actorName || `User #${row.actorId}` }}</div>
              <el-tag v-if="row.actorRole" :type="roleTagType(row.actorRole)" size="small">{{ roleLabel(row.actorRole) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Action" min-width="160">
            <template #default="{ row }"><el-tag type="info" size="small">{{ row.action }}</el-tag></template>
          </el-table-column>
          <el-table-column label="Target" width="140">
            <template #default="{ row }">
              <span v-if="row.targetEntity">{{ row.targetEntity }} #{{ row.targetId }}</span>
              <span v-else class="dash">—</span>
            </template>
          </el-table-column>
          <el-table-column label="Time" width="160">
            <template #default="{ row }">{{ formatDatetime(row.timestamp || row.createdAt) }}</template>
          </el-table-column>
        </el-table>

        <div class="pagination-row" v-if="filteredLogs.length > size">
          <el-pagination v-model:current-page="currentPage" :page-size="size" :total="filteredLogs.length" layout="prev, pager, next" small />
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

const { currentPage, size, paginate, reset } = usePagination(20)
const loading = ref(true)
const logs = ref([])
const dateRange = ref(null)

const filteredLogs = computed(() => {
  if (!dateRange.value || dateRange.value.length < 2) return logs.value
  const [from, to] = dateRange.value
  return logs.value.filter(l => {
    const d = (l.timestamp || l.createdAt || '').slice(0, 10)
    return d >= from && d <= to
  })
})
const pageData = computed(() => paginate(filteredLogs.value))
function applyFilter() { reset() }

function roleLabel(r) { return r === 'CLIENT' ? 'Customer' : r }
function roleTagType(r) { return { ADMIN: 'danger', SPECIALIST: 'warning', CLIENT: 'success' }[r] || '' }
function formatDatetime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
}

async function load() {
  loading.value = true
  try { logs.value = (await adminApi.getLogs({})).data || [] }
  catch { logs.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.section-card { margin-bottom: 12px; }
.card-header-row { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-weight: 600; font-size: 14px; }
.header-actions { display: flex; gap: 8px; align-items: center; }
.dash { color: #c0c4cc; }
.pagination-row { display: flex; justify-content: center; margin-top: 14px; }
</style>
