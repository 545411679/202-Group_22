<template>
  <AppLayout>
    <template #nav>
      <router-link to="/specialist/dashboard"><el-button text>Dashboard</el-button></router-link>
      <router-link to="/specialist/slots"><el-button text>My Slots</el-button></router-link>
      <router-link to="/specialist/sessions"><el-button text>Session Requests</el-button></router-link>
      <router-link to="/specialist/profile"><el-button text type="primary">Edit Profile</el-button></router-link>
    </template>

    <div class="profile-wrap">
      <div class="page-title">
        My profile
        <el-tag v-if="currentStatus" :type="statusTagType" style="margin-left:10px">{{ currentStatus }}</el-tag>
        <div class="status-actions" v-if="currentStatus && (currentStatus === 'ACTIVE' || currentStatus === 'PAUSED')">
          <el-button
            v-if="currentStatus === 'ACTIVE'"
            type="warning"
            size="small"
            plain
            :loading="updatingStatus"
            @click="handleSetStatus('PAUSED')"
          >
            Pause Profile
          </el-button>
          <el-button
            v-if="currentStatus === 'PAUSED'"
            type="success"
            size="small"
            plain
            :loading="updatingStatus"
            @click="handleSetStatus('ACTIVE')"
          >
            Activate Profile
          </el-button>
        </div>
      </div>
      <div v-if="currentStatus === 'PENDING'" class="pending-note">Under review — profile will go live once approved by admin.</div>
      <div v-if="currentStatus === 'REJECTED'" class="reject-note">Rejected — update and resubmit.</div>

      <el-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" v-loading="loading">
          <el-form-item label="Name" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="Specialty (category)" prop="specialty">
            <el-select v-model="form.specialty" placeholder="Select category" style="width:100%">
              <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="Qualification level" prop="qualificationLevel">
            <el-input v-model="form.qualificationLevel" placeholder="e.g. Senior, Expert…" />
          </el-form-item>
          <el-form-item label="Biography" prop="bio">
            <el-input v-model="form.bio" type="textarea" :rows="4" />
          </el-form-item>
          <el-form-item label="Session fee (¥)" prop="fee">
            <el-input-number v-model="form.fee" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item>
            <el-button @click="$router.back()">Cancel</el-button>
            <el-button type="primary" :loading="saving" native-type="button" @click="handleSave">
              Save &amp; submit
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { specialistApi, categoryApi } from '../../api/index'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const updatingStatus = ref(false)
const categories = ref([])
const currentStatus = ref(null)
const isNew = ref(false)
const formRef = ref(null)

const form = ref({ name: '', specialty: '', qualificationLevel: '', bio: '', fee: 0 })
const rules = {
  name:               [{ required: true, message: 'Required', trigger: 'blur' }],
  specialty:          [{ required: true, message: 'Required', trigger: 'change' }],
  qualificationLevel: [{ required: true, message: 'Required', trigger: 'blur' }],
  bio:                [{ required: true, message: 'Required', trigger: 'blur' }],
  fee:                [{ required: true, message: 'Required', type: 'number', trigger: 'blur' }]
}

const statusTagType = computed(() => {
  return { ACTIVE: 'success', PENDING: 'warning', REJECTED: 'danger' }[currentStatus.value] || 'info'
})

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (isNew.value) {
      const res = await specialistApi.createProfile(form.value)
      authStore.specialistId = res.data.specialistId
      isNew.value = false
    } else {
      await specialistApi.updateProfile(form.value)
    }
    ElMessage.success('Profile submitted for review.')
    currentStatus.value = 'PENDING'
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Save failed.')
  } finally {
    saving.value = false
  }
}

async function handleSetStatus(newStatus) {
  updatingStatus.value = true
  try {
    await specialistApi.updateStatus({ status: newStatus })
    ElMessage.success(`Profile status set to ${newStatus}`)
    currentStatus.value = newStatus
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to update status')
  } finally {
    updatingStatus.value = false
  }
}

onMounted(async () => {
  try {
    categories.value = (await categoryApi.getAll()).data || []
    const res = await specialistApi.getOwnProfile()
    const p = res.data
    currentStatus.value = p.status
    form.value = {
      name: p.name || '',
      specialty: p.specialty || '',
      qualificationLevel: p.qualificationLevel || '',
      bio: p.bio || '',
      fee: p.fee || 0
    }
  } catch (err) {
    if (err.response?.status === 404) {
      isNew.value = true
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.profile-wrap { max-width: 640px; }
.page-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.status-actions { display: flex; gap: 8px; }
.pending-note { font-size: 13px; color: #e6a23c; margin-bottom: 12px; }
.reject-note  { font-size: 13px; color: #f56c6c; margin-bottom: 12px; }
</style>
