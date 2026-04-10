<template>
  <AppLayout>
    <template #nav>
      <router-link to="/customer/dashboard"><el-button text>Dashboard</el-button></router-link>
      <router-link to="/customer/search"><el-button text>Find Specialists</el-button></router-link>
    </template>

    <div class="wizard-wrap">
      <div class="wizard-title">Book a session · {{ specialist?.name || '…' }}</div>

      <el-steps :active="step" finish-status="success" align-center class="steps">
        <el-step title="Select slot" />
        <el-step title="Your details" />
        <el-step title="Review & confirm" />
      </el-steps>

      <!-- Step 1: slot picker -->
      <el-card v-if="step === 0" class="step-card">
        <div v-loading="loadingSchedule">
          <el-empty v-if="!loadingSchedule && availableSlots.length === 0" description="No available slots for this specialist." />
          <el-table v-else :data="availableSlots" stripe @row-click="selectSlot" class="slot-table">
            <el-table-column prop="slotDate" label="Date" width="120" />
            <el-table-column label="Time" width="140">
              <template #default="{ row }">{{ row.startTime?.slice(0,5) }} – {{ row.endTime?.slice(0,5) }}</template>
            </el-table-column>
            <el-table-column label="">
              <template #default="{ row }">
                <el-radio :value="row.slotId" v-model="selectedSlotId">Select</el-radio>
              </template>
            </el-table-column>
          </el-table>
          <div class="selected-info" v-if="selectedSlot">
            Selected: <strong>{{ selectedSlot.date }} · {{ selectedSlot.startTime?.slice(0,5) }}–{{ selectedSlot.endTime?.slice(0,5) }}</strong>
            · Session fee: <strong>¥{{ specialist?.fee }}</strong>
          </div>
        </div>
        <div class="step-nav">
          <el-button @click="$router.back()">Cancel</el-button>
          <el-button type="primary" :disabled="!selectedSlotId" @click="step = 1">Next →</el-button>
        </div>
      </el-card>

      <!-- Step 2: details form -->
      <el-card v-if="step === 1" class="step-card">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="Contact (phone / email)" prop="contact">
            <el-input v-model="form.contact" placeholder="+86 139 0000 0000" />
          </el-form-item>
          <el-form-item label="Topic (optional · max 100 chars)" prop="topic">
            <el-input v-model="form.topic" :maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="Notes (optional · max 500 chars)">
            <el-input v-model="form.notes" type="textarea" :rows="3" :maxlength="500" show-word-limit />
          </el-form-item>
        </el-form>
        <div class="step-nav">
          <el-button @click="step = 0">← Back</el-button>
          <el-button type="primary" @click="goReview">Review →</el-button>
        </div>
      </el-card>

      <!-- Step 3: review -->
      <el-card v-if="step === 2" class="step-card">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Specialist">{{ specialist?.name }} · {{ specialist?.specialty }}</el-descriptions-item>
          <el-descriptions-item label="Slot">{{ selectedSlot?.date }} · {{ selectedSlot?.startTime?.slice(0,5) }}–{{ selectedSlot?.endTime?.slice(0,5) }}</el-descriptions-item>
          <el-descriptions-item label="Contact">{{ form.contact }}</el-descriptions-item>
          <el-descriptions-item label="Topic">{{ form.topic || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Notes">{{ form.notes || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Session fee"><strong>¥{{ specialist?.fee }}</strong></el-descriptions-item>
        </el-descriptions>
        <div class="step-nav">
          <el-button @click="step = 1">← Edit</el-button>
          <el-button type="primary" :loading="booking" @click="confirmBooking">Confirm booking</el-button>
        </div>
      </el-card>

      <!-- Success -->
      <el-card v-if="step === 3" class="step-card success-card">
        <el-result icon="success" title="Booking submitted!" sub-title="Awaiting specialist confirmation. Status: PENDING.">
          <template #extra>
            <router-link to="/customer/dashboard"><el-button type="primary">Go to my sessions</el-button></router-link>
          </template>
        </el-result>
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { specialistApi, bookingApi } from '../../api/index'

const route = useRoute()
const specId = route.params.specId
const step = ref(0)
const specialist = ref(null)
const loadingSchedule = ref(true)
const availableSlots = ref([])
const selectedSlotId = ref(null)
const booking = ref(false)
const formRef = ref(null)
const form = ref({ contact: '', topic: '', notes: '' })
const rules = {
  contact: [{ required: true, message: 'Contact info required', trigger: 'blur' }]
}

const selectedSlot = computed(() => availableSlots.value.find(s => s.slotId === selectedSlotId.value) || null)

function selectSlot(row) { selectedSlotId.value = row.slotId }

async function goReview() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  step.value = 2
}

async function confirmBooking() {
  booking.value = true
  try {
    await bookingApi.create({
      slotIds: [selectedSlotId.value],
      contact: form.value.contact,
      topic:   form.value.topic,
      notes:   form.value.notes
    })
    step.value = 3
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Booking failed.')
  } finally {
    booking.value = false
  }
}

onMounted(async () => {
  try {
    const [pRes, sRes] = await Promise.all([
      specialistApi.getPublicProfile(specId),
      specialistApi.getSchedule(specId)
    ])
    specialist.value = pRes.data
    availableSlots.value = (sRes.data?.slots || []).filter(s => s.status === 'AVAILABLE')
  } catch {
    ElMessage.error('Failed to load specialist data.')
  } finally {
    loadingSchedule.value = false
  }
})
</script>

<style scoped>
.wizard-wrap { max-width: 700px; margin: 0 auto; }
.wizard-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
.steps { margin-bottom: 20px; }
.step-card { margin-top: 4px; }
.slot-table { cursor: pointer; }
.selected-info { margin-top: 14px; font-size: 13px; color: #606266; padding: 10px; background: #f0f9eb; border-radius: 6px; }
.step-nav { display: flex; justify-content: space-between; margin-top: 20px; }
.success-card { margin-top: 4px; }
</style>
