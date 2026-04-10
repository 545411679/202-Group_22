<template>
  <AppLayout>
    <template #nav>
      <router-link to="/specialist/dashboard"><el-button text>Dashboard</el-button></router-link>
      <router-link to="/specialist/slots"><el-button text type="primary">My Slots</el-button></router-link>
      <router-link to="/specialist/sessions"><el-button text>Session Requests</el-button></router-link>
      <router-link to="/specialist/profile"><el-button text>Edit Profile</el-button></router-link>
    </template>

    <div class="page-title">My Slots</div>

    <!-- List view -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header-row">
          <span class="section-title">Slot list</span>
          <div class="header-actions">
            <el-select v-model="filterStatus" placeholder="Filter" clearable size="small" style="width:130px" @change="applyFilter">
              <el-option label="All" value="" />
              <el-option label="Available" value="AVAILABLE" />
              <el-option label="Unavailable" value="UNAVAILABLE" />
              <el-option label="Booked" value="BOOKED" />
            </el-select>
            <el-button type="primary" size="small" @click="showAddDialog = true">+ Add slot</el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <el-empty v-if="!loading && filteredSlots.length === 0" description="No slots." :image-size="48" />
        <el-table v-else :data="pageData" stripe border>
          <el-table-column prop="slotDate" label="Date" width="120" />
          <el-table-column label="Time" width="140">
            <template #default="{ row }">{{ row.startTime?.slice(0,5) }} – {{ row.endTime?.slice(0,5) }}</template>
          </el-table-column>
          <el-table-column label="Slot Status" width="130">
            <template #default="{ row }">
              <el-tag :type="slotTagType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Booking Status" width="140">
            <template #default="{ row }">
              <el-tag v-if="row.bookingStatus" :type="bookingTagType(row.bookingStatus)" size="small">{{ row.bookingStatus }}</el-tag>
              <span v-else class="dash">—</span>
            </template>
          </el-table-column>
          <el-table-column label="Customer" min-width="120">
            <template #default="{ row }">{{ row.customerName || '—' }}</template>
          </el-table-column>
          <el-table-column label="Actions" width="200">
            <template #default="{ row }">
              <template v-if="row.status === 'AVAILABLE' && !row.bookingStatus">
                <el-button size="small" @click="markUnavailable(row)">Mark unavail.</el-button>
                <el-button size="small" type="danger" @click="deleteSlot(row)">Del</el-button>
              </template>
              <template v-else-if="row.status === 'UNAVAILABLE' && !row.bookingStatus">
                <el-button size="small" @click="markAvailable(row)">Mark avail.</el-button>
                <el-button size="small" type="danger" @click="deleteSlot(row)">Del</el-button>
              </template>
              <template v-else-if="row.bookingStatus">
                <router-link to="/specialist/sessions">
                  <el-button size="small" type="primary">View booking</el-button>
                </router-link>
              </template>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-row" v-if="filteredSlots.length > size">
          <el-pagination v-model:current-page="currentPage" :page-size="size" :total="filteredSlots.length" layout="prev, pager, next" small />
        </div>
      </div>
    </el-card>

    <!-- Legend -->
    <div class="legend">
      <el-tag type="success" size="small">AVAILABLE</el-tag>
      <el-tag type="info" size="small">UNAVAILABLE</el-tag>
      <el-tag type="warning" size="small">PENDING booking</el-tag>
      <el-tag type="" size="small">CONFIRMED booking</el-tag>
      <span class="legend-note">Booked slots cannot be deleted.</span>
    </div>

    <!-- Add slot dialog -->
    <el-dialog v-model="showAddDialog" title="Add slot" width="420px">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-position="top">
        <el-form-item label="Date (within next 14 days)" prop="date">
          <el-date-picker v-model="addForm.date" type="date" :disabled-date="disableDate" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="Start time" prop="startTime">
          <el-time-picker v-model="addForm.startTime" format="HH:mm" value-format="HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item label="End time" prop="endTime">
          <el-time-picker v-model="addForm.endTime" format="HH:mm" value-format="HH:mm:ss" style="width:100%" />
        </el-form-item>
        <div class="add-notes">
          <div>· Date must be within next 14 days</div>
          <div>· On validation error, entered values are preserved</div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="addingSlot" @click="handleAddSlot">Add</el-button>
      </template>
    </el-dialog>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { specialistApi } from '../../api/index'
import { usePagination } from '../../composables/usePagination'

const { currentPage, size, paginate, reset } = usePagination(10)
const loading = ref(true)
const slots = ref([])
const filterStatus = ref('')
const showAddDialog = ref(false)
const addingSlot = ref(false)
const addFormRef = ref(null)
const addForm = ref({ date: '', startTime: '', endTime: '' })
const addRules = {
  date:      [{ required: true, message: 'Required', trigger: 'change' }],
  startTime: [{ required: true, message: 'Required', trigger: 'change' }],
  endTime:   [{ required: true, message: 'Required', trigger: 'change' }]
}

const filteredSlots = computed(() => {
  if (!filterStatus.value) return slots.value
  return slots.value.filter(s => {
    if (filterStatus.value === 'BOOKED') return !!s.bookingStatus
    return s.status === filterStatus.value && !s.bookingStatus
  })
})
const pageData = computed(() => paginate(filteredSlots.value))
function applyFilter() { reset() }

function disableDate(d) {
  const today = new Date(); today.setHours(0,0,0,0)
  const max = new Date(today); max.setDate(max.getDate() + 14)
  return d < today || d > max
}

function slotTagType(s)    { return { AVAILABLE: 'success', UNAVAILABLE: 'info' }[s] || 'info' }
function bookingTagType(s) { return { PENDING: 'warning', CONFIRMED: '', COMPLETED: 'success', CANCELLED: 'danger' }[s] || '' }

async function load() {
  loading.value = true
  try { slots.value = (await specialistApi.getSlots()).data || [] }
  catch { slots.value = [] }
  finally { loading.value = false }
}

async function markUnavailable(row) {
  try {
    await specialistApi.markUnavailable(row.slotId)
    ElMessage.success('Marked unavailable.')
    load()
  } catch (err) { ElMessage.error(err.response?.data?.message || 'Failed.') }
}

async function markAvailable(row) {
  try {
    await specialistApi.markAvailable(row.slotId)
    ElMessage.success('Marked available.')
    load()
  } catch (err) { ElMessage.error(err.response?.data?.message || 'Failed.') }
}

async function deleteSlot(row) {
  try {
    await ElMessageBox.confirm('Delete this slot?', 'Confirm', { type: 'warning' })
    await specialistApi.deleteSlot(row.slotId)
    ElMessage.success('Slot deleted.')
    load()
  } catch {}
}

async function handleAddSlot() {
  const valid = await addFormRef.value.validate().catch(() => false)
  if (!valid) return
  addingSlot.value = true
  try {
    await specialistApi.addSlot(addForm.value)
    ElMessage.success('Slot added.')
    showAddDialog.value = false
    load()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to add slot.')
    // values preserved in addForm — not reset on error
  } finally {
    addingSlot.value = false
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
.legend { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
.legend-note { font-size: 12px; color: #909399; }
.add-notes { font-size: 12px; color: #909399; line-height: 1.8; margin-top: 4px; }
</style>
