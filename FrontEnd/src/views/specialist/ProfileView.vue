<template>
  <AppLayout>
    <div class="profile-view">
      <div class="page-header">
        <h2>My Specialist Profile</h2>
      </div>

      <div v-loading="loading">
        <!-- Status info box -->
        <el-card v-if="profile" class="status-card">
          <div class="status-row">
            <span class="status-label">Profile Status:</span>
            <el-tag :type="profileStatusType(profile.status)" size="large">
              {{ profile.status }}
            </el-tag>
            <el-button
              v-if="profile.status === 'ACTIVE'"
              type="warning"
              size="small"
              plain
              class="status-btn"
              :loading="updatingStatus"
              @click="handleSetStatus('PAUSED')"
            >
              Pause Profile
            </el-button>
            <el-button
              v-if="profile.status === 'PAUSED'"
              type="success"
              size="small"
              plain
              class="status-btn"
              :loading="updatingStatus"
              @click="handleSetStatus('ACTIVE')"
            >
              Activate Profile
            </el-button>
          </div>
          <div class="status-info">
            <p v-if="profile.status === 'PENDING'">
              <el-icon><InfoFilled /></el-icon>
              Your profile is awaiting admin approval. You will be visible to clients once approved.
            </p>
            <p v-else-if="profile.status === 'ACTIVE'">
              <el-icon><SuccessFilled /></el-icon>
              Your profile is active and visible to clients.
            </p>
            <p v-else-if="profile.status === 'PAUSED'">
              <el-icon><WarningFilled /></el-icon>
              Your profile is paused. Clients cannot find or book you. Activate to resume.
            </p>
            <p v-else-if="profile.status === 'REJECTED'">
              <el-icon><CircleCloseFilled /></el-icon>
              Your profile was rejected. Please contact the admin for more information.
            </p>
          </div>
        </el-card>

        <!-- No profile: create form -->
        <el-card v-if="!profile && !loading" class="form-card">
          <h3 class="form-title">Create Your Specialist Profile</h3>
          <p class="form-desc">Complete your profile to be discovered by clients.</p>
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-position="top"
          >
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Display Name" prop="name">
                  <el-input v-model="profileForm.name" placeholder="Your professional name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Qualification Level" prop="level">
                  <el-select v-model="profileForm.level" placeholder="Select level" style="width: 100%">
                    <el-option label="Junior" value="JUNIOR" />
                    <el-option label="Mid" value="MID" />
                    <el-option label="Senior" value="SENIOR" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="Specialty / Category" prop="categoryId">
              <el-select v-model="profileForm.categoryId" placeholder="Select specialty" style="width: 100%">
                <el-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Consultation Fee (¥)" prop="fee">
              <el-input-number v-model="profileForm.fee" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
            <el-form-item label="Bio" prop="bio">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                placeholder="Describe your expertise, experience, and what clients can expect..."
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="handleCreateProfile">
                Submit Profile for Review
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Existing profile: display + edit -->
        <el-card v-if="profile" class="form-card">
          <div class="profile-display-header">
            <h3 class="form-title">Profile Information</h3>
            <el-button
              v-if="!editMode"
              type="primary"
              plain
              :icon="Edit"
              @click="enterEditMode"
            >
              Edit Profile
            </el-button>
          </div>

          <!-- View mode -->
          <el-descriptions v-if="!editMode" :column="2" border>
            <el-descriptions-item label="Display Name">{{ profile.name }}</el-descriptions-item>
            <el-descriptions-item label="Level">{{ profile.level }}</el-descriptions-item>
            <el-descriptions-item label="Specialty">{{ profile.specialty || profile.categoryName || '—' }}</el-descriptions-item>
            <el-descriptions-item label="Fee">{{ profile.fee != null ? `¥${profile.fee}` : '—' }}</el-descriptions-item>
            <el-descriptions-item label="Bio" :span="2">{{ profile.bio || '—' }}</el-descriptions-item>
          </el-descriptions>

          <!-- Edit mode -->
          <el-form
            v-else
            ref="editFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-position="top"
          >
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Display Name" prop="name">
                  <el-input v-model="profileForm.name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Qualification Level" prop="level">
                  <el-select v-model="profileForm.level" style="width: 100%">
                    <el-option label="Junior" value="JUNIOR" />
                    <el-option label="Mid" value="MID" />
                    <el-option label="Senior" value="SENIOR" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="Specialty / Category" prop="categoryId">
              <el-select v-model="profileForm.categoryId" style="width: 100%">
                <el-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Consultation Fee (¥)" prop="fee">
              <el-input-number v-model="profileForm.fee" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
            <el-form-item label="Bio" prop="bio">
              <el-input v-model="profileForm.bio" type="textarea" :rows="4" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="handleUpdateProfile">
                Save Changes
              </el-button>
              <el-button @click="editMode = false">Cancel</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, InfoFilled, SuccessFilled, WarningFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import AppLayout from '../../components/AppLayout.vue'
import { specialistApi, categoryApi } from '../../api/index'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const submitting = ref(false)
const updatingStatus = ref(false)
const editMode = ref(false)

const profile = ref(null)
const categories = ref([])

const profileFormRef = ref(null)
const editFormRef = ref(null)
const profileForm = ref({
  name: '',
  categoryId: '',
  level: '',
  fee: 0,
  bio: ''
})

const profileRules = {
  name: [{ required: true, message: 'Please enter your display name', trigger: 'blur' }],
  categoryId: [{ required: true, message: 'Please select a specialty', trigger: 'change' }],
  level: [{ required: true, message: 'Please select your qualification level', trigger: 'change' }],
  bio: [{ required: true, message: 'Please write a short bio', trigger: 'blur' }]
}

function profileStatusType(status) {
  const map = {
    PENDING: 'warning',
    ACTIVE: 'success',
    PAUSED: 'info',
    REJECTED: 'danger'
  }
  return map[status] || ''
}

function enterEditMode() {
  if (profile.value) {
    profileForm.value = {
      name: profile.value.name || '',
      categoryId: profile.value.categoryId || '',
      level: profile.value.level || '',
      fee: profile.value.fee || 0,
      bio: profile.value.bio || ''
    }
  }
  editMode.value = true
}

async function loadCategories() {
  try {
    const res = await categoryApi.getAll()
    categories.value = res.data || []
  } catch {
    // Non-critical
  }
}

async function loadProfile() {
  loading.value = true
  try {
    const id = authStore.specialistId
    if (!id) {
      // No profile yet
      loading.value = false
      return
    }
    const res = await specialistApi.getProfile(id)
    profile.value = res.data
  } catch (err) {
    if (err.response?.status === 404) {
      profile.value = null
    } else {
      ElMessage.error(err.response?.data?.message || 'Failed to load profile')
    }
  } finally {
    loading.value = false
  }
}

async function handleCreateProfile() {
  const valid = await profileFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await specialistApi.createProfile(profileForm.value)
    ElMessage.success('Profile submitted for review. An admin will approve it shortly.')
    profile.value = res.data
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to create profile')
  } finally {
    submitting.value = false
  }
}

async function handleUpdateProfile() {
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await specialistApi.updateProfile(profileForm.value)
    ElMessage.success('Profile updated successfully')
    profile.value = res.data
    editMode.value = false
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to update profile')
  } finally {
    submitting.value = false
  }
}

async function handleSetStatus(newStatus) {
  updatingStatus.value = true
  try {
    await specialistApi.updateStatus({ status: newStatus })
    ElMessage.success(`Profile status set to ${newStatus}`)
    await loadProfile()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to update status')
  } finally {
    updatingStatus.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  await loadProfile()
})
</script>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.status-card {
  border-radius: 8px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.status-label {
  font-weight: 600;
  color: #555;
}

.status-btn {
  margin-left: 8px;
}

.status-info p {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.form-card {
  border-radius: 8px;
}

.profile-display-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.form-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 20px;
}
</style>
