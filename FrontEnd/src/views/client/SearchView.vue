<template>
  <AppLayout>
    <div class="search-view">
      <div class="page-header">
        <h2>Search Specialists</h2>
      </div>

      <!-- Search filters -->
      <el-card class="filter-card">
        <el-row :gutter="16" align="middle">
          <el-col :span="6">
            <el-input
              v-model="searchParams.name"
              placeholder="Search by name"
              clearable
              :prefix-icon="Search"
            />
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchParams.categoryId"
              placeholder="Select category"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select
              v-model="searchParams.level"
              placeholder="Select level"
              clearable
              style="width: 100%"
            >
              <el-option label="Junior" value="JUNIOR" />
              <el-option label="Mid" value="MID" />
              <el-option label="Senior" value="SENIOR" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" :icon="Search" :loading="searching" @click="handleSearch">
              Search
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- Results -->
      <div v-loading="searching" class="results-grid">
        <el-empty v-if="!searching && specialists.length === 0" description="No specialists found. Try adjusting your filters." />
        <div class="specialist-grid">
          <el-card
            v-for="spec in specialists"
            :key="spec.id"
            class="specialist-card"
            shadow="hover"
          >
            <div class="spec-avatar">
              <el-avatar :size="60" :icon="UserFilled" />
            </div>
            <div class="spec-info">
              <h3 class="spec-name">{{ spec.name }}</h3>
              <p class="spec-specialty">{{ spec.specialty || spec.categoryName || '—' }}</p>
              <el-tag size="small" type="info" class="spec-level">{{ spec.level }}</el-tag>
              <p class="spec-fee" v-if="spec.fee != null">Fee: ¥{{ spec.fee }}</p>
              <p class="spec-bio" v-if="spec.bio">{{ spec.bio?.slice(0, 80) }}{{ spec.bio?.length > 80 ? '...' : '' }}</p>
            </div>
            <el-button
              type="primary"
              size="small"
              class="view-btn"
              @click="openScheduleDialog(spec)"
            >
              View Schedule &amp; Book
            </el-button>
          </el-card>
        </div>
      </div>

      <!-- Schedule dialog -->
      <el-dialog
        v-model="scheduleDialogVisible"
        :title="`${selectedSpec?.name} — Schedule`"
        width="700px"
        @close="closeScheduleDialog"
      >
        <div v-if="selectedSpec" class="spec-header-in-dialog">
          <p><strong>Specialty:</strong> {{ selectedSpec.specialty || selectedSpec.categoryName }}</p>
          <p><strong>Level:</strong> {{ selectedSpec.level }}</p>
          <p v-if="selectedSpec.fee != null"><strong>Fee:</strong> ¥{{ selectedSpec.fee }}</p>
        </div>

        <el-table
          v-loading="loadingSchedule"
          :data="schedule"
          stripe
          border
          style="width: 100%"
          empty-text="No available slots"
        >
          <el-table-column label="Date" width="120">
            <template #default="{ row }">{{ formatDate(row.date) }}</template>
          </el-table-column>
          <el-table-column label="Start" width="90">
            <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
          </el-table-column>
          <el-table-column label="End" width="90">
            <template #default="{ row }">{{ formatTime(row.endTime) }}</template>
          </el-table-column>
          <el-table-column label="Status" width="110">
            <template #default="{ row }">
              <el-tag :type="slotTagType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Action" width="140">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'AVAILABLE'"
                type="success"
                size="small"
                @click="openBookingDialog(row)"
              >
                Book This Slot
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>

      <!-- Booking form dialog -->
      <el-dialog
        v-model="bookingDialogVisible"
        title="Book Appointment"
        width="480px"
        @close="resetBookingForm"
      >
        <el-form
          ref="bookingFormRef"
          :model="bookingForm"
          :rules="bookingRules"
          label-position="top"
        >
          <el-form-item label="Contact" prop="contact">
            <el-input v-model="bookingForm.contact" placeholder="Your contact info (phone / email)" />
          </el-form-item>
          <el-form-item label="Topic" prop="topic">
            <el-input v-model="bookingForm.topic" placeholder="Topic for the consultation" />
          </el-form-item>
          <el-form-item label="Notes">
            <el-input
              v-model="bookingForm.notes"
              type="textarea"
              :rows="3"
              placeholder="Any additional notes (optional)"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="bookingDialogVisible = false">Cancel</el-button>
          <el-button type="primary" :loading="booking" @click="handleBook">
            Confirm Booking
          </el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, UserFilled } from '@element-plus/icons-vue'
import AppLayout from '../../components/AppLayout.vue'
import { specialistApi, bookingApi, categoryApi } from '../../api/index'

const searching = ref(false)
const specialists = ref([])
const categories = ref([])

const searchParams = ref({
  name: '',
  categoryId: '',
  level: ''
})

// Schedule dialog
const scheduleDialogVisible = ref(false)
const loadingSchedule = ref(false)
const selectedSpec = ref(null)
const schedule = ref([])

// Booking dialog
const bookingDialogVisible = ref(false)
const booking = ref(false)
const selectedSlot = ref(null)
const bookingFormRef = ref(null)
const bookingForm = ref({
  contact: '',
  topic: '',
  notes: ''
})

const bookingRules = {
  contact: [{ required: true, message: 'Please enter your contact info', trigger: 'blur' }],
  topic: [{ required: true, message: 'Please enter the consultation topic', trigger: 'blur' }]
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dateStr.slice(0, 10)
}

function formatTime(timeStr) {
  if (!timeStr) return '—'
  return timeStr.slice(0, 5)
}

function slotTagType(status) {
  if (status === 'AVAILABLE') return 'success'
  if (status === 'BOOKED') return 'warning'
  return 'info'
}

async function loadCategories() {
  try {
    const res = await categoryApi.getAll()
    categories.value = res.data || []
  } catch {
    // Non-critical
  }
}

async function handleSearch() {
  searching.value = true
  try {
    const params = {}
    if (searchParams.value.name) params.name = searchParams.value.name
    if (searchParams.value.categoryId) params.categoryId = searchParams.value.categoryId
    if (searchParams.value.level) params.level = searchParams.value.level
    const res = await specialistApi.search(params)
    specialists.value = res.data || []
    if (specialists.value.length === 0) {
      ElMessage.info('No specialists found matching your criteria')
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Search failed')
  } finally {
    searching.value = false
  }
}

async function openScheduleDialog(spec) {
  selectedSpec.value = spec
  scheduleDialogVisible.value = true
  schedule.value = []
  loadingSchedule.value = true
  try {
    const res = await specialistApi.getSchedule(spec.id)
    schedule.value = res.data || []
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to load schedule')
  } finally {
    loadingSchedule.value = false
  }
}

function closeScheduleDialog() {
  selectedSpec.value = null
  schedule.value = []
}

function openBookingDialog(slot) {
  selectedSlot.value = slot
  bookingDialogVisible.value = true
}

function resetBookingForm() {
  bookingForm.value = { contact: '', topic: '', notes: '' }
  selectedSlot.value = null
  if (bookingFormRef.value) {
    bookingFormRef.value.resetFields()
  }
}

async function handleBook() {
  const valid = await bookingFormRef.value.validate().catch(() => false)
  if (!valid) return

  booking.value = true
  try {
    await bookingApi.create({
      slotIds: [selectedSlot.value.id],
      contact: bookingForm.value.contact,
      topic: bookingForm.value.topic,
      notes: bookingForm.value.notes
    })
    ElMessage.success('Booking submitted successfully! Awaiting specialist confirmation.')
    bookingDialogVisible.value = false
    resetBookingForm()
    // Reload schedule to reflect booked slot
    if (selectedSpec.value) {
      const res = await specialistApi.getSchedule(selectedSpec.value.id)
      schedule.value = res.data || []
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Booking failed')
  } finally {
    booking.value = false
  }
}

onMounted(() => {
  loadCategories()
  handleSearch()
})
</script>

<style scoped>
.search-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.filter-card :deep(.el-card__body) {
  padding: 16px;
}

.results-grid {
  min-height: 200px;
}

.specialist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.specialist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px;
}

.spec-avatar {
  margin-bottom: 12px;
}

.spec-info {
  width: 100%;
  margin-bottom: 12px;
}

.spec-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.spec-specialty {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.spec-level {
  margin-bottom: 6px;
}

.spec-fee {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
  margin-top: 4px;
}

.spec-bio {
  font-size: 12px;
  color: #888;
  margin-top: 6px;
  line-height: 1.4;
}

.view-btn {
  width: 100%;
}

.spec-header-in-dialog {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
  line-height: 1.8;
}
</style>
