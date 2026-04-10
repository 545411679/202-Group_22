<template>
  <AdminLayout>
    <div class="page-title">Users</div>

    <el-card class="section-card">
      <template #header>
        <div class="card-header-row">
          <span class="section-title">User list</span>
          <div class="header-actions">
            <el-select v-model="filterRole" placeholder="Role" clearable size="small" style="width:130px" @change="applyFilter">
              <el-option label="All roles" value="" />
              <el-option label="Customer" value="CLIENT" />
              <el-option label="Specialist" value="SPECIALIST" />
              <el-option label="Admin" value="ADMIN" />
            </el-select>
            <el-select v-model="filterStatus" placeholder="Status" clearable size="small" style="width:120px" @change="applyFilter">
              <el-option label="All status" value="" />
              <el-option label="Active" value="ACTIVE" />
              <el-option label="Disabled" value="DISABLED" />
            </el-select>
            <el-button size="small" @click="load">Refresh</el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <el-empty v-if="!loading && filteredUsers.length === 0" description="No users found." :image-size="48" />
        <el-table v-else :data="pageData" stripe border>
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column label="Name" min-width="130">
            <template #default="{ row }">{{ row.name || '—' }}</template>
          </el-table-column>
          <el-table-column label="Email" min-width="180">
            <template #default="{ row }">{{ row.email }}</template>
          </el-table-column>
          <el-table-column label="Role" width="110">
            <template #default="{ row }">
              <el-tag :type="roleTagType(row.role)" size="small">{{ roleLabel(row.role) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Status" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Registered" width="120">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="Actions" width="120">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'ACTIVE'"
                size="small" type="danger" plain
                :loading="actionId === row.id"
                @click="toggleStatus(row, 'DISABLED')"
              >Disable</el-button>
              <el-button
                v-else
                size="small" type="success" plain
                :loading="actionId === row.id"
                @click="toggleStatus(row, 'ACTIVE')"
              >Enable</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-row" v-if="filteredUsers.length > size">
          <el-pagination v-model:current-page="currentPage" :page-size="size" :total="filteredUsers.length" layout="prev, pager, next" small />
        </div>
      </div>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminLayout from '../../components/AdminLayout.vue'
import { adminApi } from '../../api/index'
import { usePagination } from '../../composables/usePagination'

const { currentPage, size, paginate, reset } = usePagination(15)
const loading = ref(true)
const users = ref([])
const filterRole = ref('')
const filterStatus = ref('')
const actionId = ref(null)

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    if (filterRole.value && u.role !== filterRole.value) return false
    if (filterStatus.value && u.status !== filterStatus.value) return false
    return true
  })
})
const pageData = computed(() => paginate(filteredUsers.value))
function applyFilter() { reset() }

function roleLabel(r) { return r === 'CLIENT' ? 'Customer' : r }
function roleTagType(r) { return { ADMIN: 'danger', SPECIALIST: 'warning', CLIENT: 'success' }[r] || '' }
function formatDate(dt) { return dt ? String(dt).slice(0, 10) : '—' }

async function load() {
  loading.value = true
  try { users.value = (await adminApi.getUsers({})).data || [] }
  catch { users.value = [] }
  finally { loading.value = false }
}

async function toggleStatus(row, newStatus) {
  const label = newStatus === 'DISABLED' ? 'disable' : 'enable'
  try {
    await ElMessageBox.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} user "${row.name || row.email}"?`, 'Confirm', { type: 'warning' })
  } catch { return }

  actionId.value = row.id
  try {
    await adminApi.updateUserStatus(row.id, { status: newStatus })
    ElMessage.success(`User ${label}d.`)
    load()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed.')
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
.pagination-row { display: flex; justify-content: center; margin-top: 14px; }
</style>
