<template>
  <div class="login-page">
    <el-card class="login-card">
      <div class="login-header">
        <h1 class="app-title">Consultation Booking System</h1>
        <p class="app-subtitle">Sign In</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            size="large"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            native-type="button"
            @click="handleLogin"
          >
            Sign In
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>Don't have an account?</span>
        <router-link to="/register" class="register-link">Register</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { authApi } from '../api/index'
import { useAuthStore } from '../stores/auth'
import { roleHome } from '../router/index'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const form = ref({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' }
  ]
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await authApi.login(form.value)
    const data = res.data
    authStore.login(data)
    ElMessage.success('Login successful')
    router.push(roleHome(data.role))
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Login failed. Please check your credentials.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.app-subtitle {
  font-size: 14px;
  color: #888;
}

.login-btn {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.register-link {
  margin-left: 6px;
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
