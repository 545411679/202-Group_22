<template>
  <AppLayout>
    <el-card class="pw-card">
      <h2 class="page-title">Change Password</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" style="max-width:400px">
        <el-form-item label="Current password" prop="oldPassword">
          <el-input v-model="form.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="New password (min 8 chars)" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" native-type="button" @click="handleSubmit">Save</el-button>
          <el-button @click="$router.back()">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { authApi } from '../../api/index'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)
const form = ref({ oldPassword: '', newPassword: '' })
const rules = {
  oldPassword: [{ required: true, message: 'Required', trigger: 'blur' }],
  newPassword: [{ required: true, min: 8, message: 'Min 8 characters', trigger: 'blur' }]
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await authApi.changePassword(form.value)
    ElMessage.success('Password updated. Please sign in again.')
    authStore.logout()
    router.push('/login')
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to update password.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.pw-card { max-width: 520px; }
.page-title { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
</style>
