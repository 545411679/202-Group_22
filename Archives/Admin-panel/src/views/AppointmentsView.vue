<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  cancelAppointment,
  confirmAppointment,
  createAppointment,
  fetchAppointments,
  fetchAvailableSlots,
  fetchSpecialists,
  type BookingDTO,
  type Specialist,
  type TimeSlotDTO,
} from '@/api/appointments'

const loading = ref(false)
const actionLoading = ref<number | null>(null)

const statusFilter = ref<string | undefined>(undefined)
const bookings = ref<BookingDTO[]>([])

const createDialogVisible = ref(false)
const specialists = ref<Specialist[]>([])
const slots = ref<TimeSlotDTO[]>([])
const createSubmitting = ref(false)

const createForm = ref({
  customerId: 1,
  specialistId: undefined as number | undefined,
  timeSlotId: undefined as number | undefined,
  topic: '',
  notes: '',
})

const tableData = computed(() =>
  bookings.value.map((item) => ({
    ...item,
    slot: `${formatDate(item.startTime)} - ${formatTime(item.endTime)}`,
  })),
)

async function loadAppointments() {
  loading.value = true
  try {
    bookings.value = await fetchAppointments(statusFilter.value)
  } catch (error) {
    ElMessage.error((error as Error).message)
  } finally {
    loading.value = false
  }
}

async function loadSpecialists() {
  try {
    specialists.value = await fetchSpecialists()
  } catch (error) {
    ElMessage.error(`加载专家失败: ${(error as Error).message}`)
  }
}

async function onSpecialistChange() {
  createForm.value.timeSlotId = undefined
  if (!createForm.value.specialistId) {
    slots.value = []
    return
  }
  try {
    slots.value = await fetchAvailableSlots(createForm.value.specialistId)
  } catch (error) {
    ElMessage.error(`加载时段失败: ${(error as Error).message}`)
  }
}

function openCreateDialog() {
  createDialogVisible.value = true
  createForm.value = {
    customerId: 1,
    specialistId: undefined,
    timeSlotId: undefined,
    topic: '',
    notes: '',
  }
  slots.value = []
}

async function submitCreate() {
  if (!createForm.value.specialistId || !createForm.value.timeSlotId) {
    ElMessage.warning('请先选择专家和可预约时段')
    return
  }

  createSubmitting.value = true
  try {
    await createAppointment(createForm.value.customerId, {
      specialistId: createForm.value.specialistId,
      timeSlotId: createForm.value.timeSlotId,
      topic: createForm.value.topic,
      notes: createForm.value.notes,
    })
    ElMessage.success('预约创建成功')
    createDialogVisible.value = false
    await loadAppointments()
  } catch (error) {
    ElMessage.error(`创建失败: ${(error as Error).message}`)
  } finally {
    createSubmitting.value = false
  }
}

async function handleConfirm(id: number) {
  actionLoading.value = id
  try {
    await confirmAppointment(id)
    ElMessage.success('预约已确认')
    await loadAppointments()
  } catch (error) {
    ElMessage.error(`确认失败: ${(error as Error).message}`)
  } finally {
    actionLoading.value = null
  }
}

async function handleCancel(id: number) {
  actionLoading.value = id
  try {
    await cancelAppointment(id)
    ElMessage.success('预约已取消')
    await loadAppointments()
  } catch (error) {
    ElMessage.error(`取消失败: ${(error as Error).message}`)
  } finally {
    actionLoading.value = null
  }
}

function formatDate(datetime: string): string {
  return new Date(datetime).toLocaleString()
}

function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString()
}

watch(statusFilter, () => {
  loadAppointments()
})

onMounted(async () => {
  await Promise.all([loadAppointments(), loadSpecialists()])
})
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h2 class="page-title">Appointments</h2>
      <div class="filters">
        <el-select v-model="statusFilter" placeholder="Status" clearable style="width: 150px">
          <el-option label="Pending" value="PENDING" />
          <el-option label="Confirmed" value="CONFIRMED" />
          <el-option label="Cancelled" value="CANCELLED" />
          <el-option label="Completed" value="COMPLETED" />
          <el-option label="Rejected" value="REJECTED" />
        </el-select>
        <el-button @click="loadAppointments">刷新</el-button>
        <el-button type="primary" @click="openCreateDialog">新建预约</el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="Booking ID" width="100" />
        <el-table-column prop="customerName" label="Customer" />
        <el-table-column prop="specialistName" label="Specialist" />
        <el-table-column prop="slot" label="Slot" width="260" />
        <el-table-column prop="status" label="Status" width="120" />
        <el-table-column prop="topic" label="Topic" min-width="160" />
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="success"
              size="small"
              :disabled="scope.row.status !== 'PENDING'"
              :loading="actionLoading === scope.row.id"
              @click="handleConfirm(scope.row.id)"
            >
              Confirm
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              :disabled="scope.row.status === 'CANCELLED' || scope.row.status === 'COMPLETED'"
              :loading="actionLoading === scope.row.id"
              @click="handleCancel(scope.row.id)"
            >
              Cancel
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && tableData.length === 0" description="暂无预约数据" />
    </el-card>

    <el-dialog v-model="createDialogVisible" title="新建预约" width="560px">
      <el-form label-width="120px">
        <el-form-item label="Customer ID">
          <el-input-number v-model="createForm.customerId" :min="1" style="width: 100%" />
        </el-form-item>

        <el-form-item label="Specialist">
          <el-select
            v-model="createForm.specialistId"
            placeholder="请选择专家"
            style="width: 100%"
            @change="onSpecialistChange"
          >
            <el-option v-for="item in specialists" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="Time Slot">
          <el-select v-model="createForm.timeSlotId" placeholder="请选择时段" style="width: 100%">
            <el-option
              v-for="item in slots"
              :key="item.id"
              :label="`${formatDate(item.startTime)} - ${formatTime(item.endTime)}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Topic">
          <el-input v-model="createForm.topic" placeholder="咨询主题" />
        </el-form-item>

        <el-form-item label="Notes">
          <el-input v-model="createForm.notes" type="textarea" :rows="3" placeholder="补充说明" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createSubmitting" @click="submitCreate">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
