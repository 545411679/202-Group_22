<template>
  <AppLayout>
    <div class="schedule-view">
      <div class="page-header">
        <h2>My Schedule</h2>
        <el-button type="primary" :icon="Plus" @click="openAddDialog">
          Add New Slot
        </el-button>
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
              @change="loadSlots"
            >
              <el-option label="All" value="" />
              <el-option label="AVAILABLE" value="AVAILABLE" />
              <el-option label="BOOKED" value="BOOKED" />
              <el-option label="UNAVAILABLE" value="UNAVAILABLE" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button :icon="Refresh" @click="loadSlots">Refresh</el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- Slots table -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="slots"
          stripe
          border
          style="width: 100%"
          empty-text="No slots found. Add a new slot to get started."
        >
          <el-table-column label="Date" width="130">
            <template #default="{ row }">{{ formatDate(row.date) }}</template>
          </el-table-column>
          <el-table-column label="Start Time" width="120">
            <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
          </el-table-column>
          <el-table-column label="End Time" width="120">
            <template #default="{ row }">{{ formatTime(row.endTime) }}</template>
          </el-table-column>
          <el-table-column label="Status" width="130">
            <template #default="{ row }">
              <el-tag :type="slotTagType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Actions" min-width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'AVAILABLE'"
                type="warning"
                size="small"
                plain
                @click="handleMarkUnavailable(row)"
              >
                Mark Unavailable
              </el-button>
              <el-button
                v-if="row.status !== 'BOOKED'"
                type="danger"
                size="small"
                plain
                @click="handleDeleteSlot(row)"
              >
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Add Slot dialog -->
      <el-dialog v-model="addDialogVisible" title="Add New Availability Slot" width="440px">
        <el-form
          ref="slotFormRef"
          :model="slotForm"
          :rules="slotRules"
          label-position="top"
        >
          <el-form-item label="Date" prop="date">
            <el-date-picker
              v-model="slotForm.date"
              type="date"
              placeholder="Select date"
              :disabled-date="disablePastDates"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="Start Time" prop="startTime">
            <el-time-picker
              v-model="slotForm.startTime"
              placeholder="Select start time"
              format="HH:mm"
              value-format="HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="End Time" prop="endTime">
            <el-time-picker
              v-model="slotForm.endTime"
              placeholder="Select end time"
              format="HH:mm"
              value-format="HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="addDialogVisible = false">Cancel</el-button>
          <el-button type="primary" :loading="submitting" @click="handleAddSlot">
            Add Slot
          </el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import AppLayout from '../../components/AppLayout.vue'
import { specialistApi } from '../../api/index'

const loading = ref(false)
const slots = ref([])
const filterStatus = ref('')

const addDialogVisible = ref(false)
const submitting = ref(false)
const slotFormRef = ref(null)
const slotForm = ref({
  date: '',
  startTime: '',
  endTime: ''
})

const slotRules = {
  date: [{ required: true, message: 'Please select a date', trigger: 'change' }],
  startTime: [{ required: true, message: 'Please select start time', trigger: 'change' }],
  endTime: [{ required: true, message: 'Please select end time', trigger: 'change' }]
}

function disablePastDates(date) {
  return date < new Date(new Date().setHours(0, 0, 0, 0))
}

function slotTagType(status) {
  if (status === 'AVAILABLE') return 'success'
  if (status === 'BOOKED') return 'warning'
  if (status === 'UNAVAILABLE') return 'info'
  return ''
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dateStr.slice(0, 10)
}

function formatTime(timeStr) {
  if (!timeStr) return '—'
  return timeStr.slice(0, 5)
}

async function loadSlots() {
  loading.value = true
  try {
    const params = {}
    if (filterStatus.value) params.status = filterStatus.value
    const res = await specialistApi.getMySlots(params)
    slots.value = res.data || []
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to load slots')
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  slotForm.value = { date: '', startTime: '', endTime: '' }
  addDialogVisible.value = true
  if (slotFormRef.value) slotFormRef.value.resetFields()
}

async function handleAddSlot() {
  const valid = await slotFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await specialistApi.createSlot({
      date: slotForm.value.date,
      startTime: slotForm.value.startTime,
      endTime: slotForm.value.endTime
    })
    ElMessage.success('Slot added successfully')
    addDialogVisible.value = false
    await loadSlots()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to add slot')
  } finally {
    submitting.value = false
  }
}

async function handleMarkUnavailable(row) {
  try {
    await ElMessageBox.confirm(
      'Mark this slot as unavailable? Clients will no longer be able to book it.',
      'Confirm',
      {
        confirmButtonText: 'Mark Unavailable',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  try {
    await specialistApi.markUnavailable(row.id)
    ElMessage.success('Slot marked as unavailable')
    await loadSlots()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to update slot')
  }
}

async function handleDeleteSlot(row) {
  try {
    await ElMessageBox.confirm(
      'Delete this slot permanently? This cannot be undone.',
      'Delete Slot',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      }
    )
  } catch {
    return
  }

  try {
    await specialistApi.deleteSlot(row.id)
    ElMessage.success('Slot deleted')
    await loadSlots()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to delete slot')
  }
}

onMounted(() => {
  loadSlots()
})
</script>

<style scoped>
.schedule-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-card :deep(.el-card__body) {
  padding: 16px;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}
</style>
