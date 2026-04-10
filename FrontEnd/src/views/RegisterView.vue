<template>
  <div class="register-page">
    <el-card class="register-card">
      <div class="register-header">
        <h1 class="app-title">Consultation Booking System</h1>
        <p class="app-subtitle">{{ isSpecialist ? 'Join as a Specialist' : 'Create Account' }}</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Full Name" prop="name">
          <el-input v-model="form.name" placeholder="Enter your full name" size="large" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" placeholder="Enter your email" size="large" :prefix-icon="Message" />
        </el-form-item>
        <el-form-item label="Password  (min 8 chars)" prop="password">
          <el-input v-model="form.password" type="password" placeholder="Create a password" size="large" show-password :prefix-icon="Lock" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" class="register-btn" :loading="loading" native-type="button" @click="handleRegister">
            {{ isSpecialist ? 'Join as Specialist' : 'Create Account' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <span>Already have an account?</span>
        <router-link to="/login" class="link">Sign in</router-link>
      </div>
      <div class="register-footer" style="margin-top:6px">
        <span v-if="isSpecialist">Looking to book instead?</span>
        <span v-else>Joining as a specialist?</span>
        <router-link :to="isSpecialist ? '/register' : '/register?role=SPECIALIST'" class="link">
          {{ isSpecialist ? 'Customer register' : 'Specialist register' }}
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Message, Lock } from '@element-plus/icons-vue'
import { authApi } from '../api/index'

const router = useRouter()
const route  = useRoute()
const formRef = ref(null)
const loading = ref(false)

const isSpecialist = computed(() => route.query.role === 'SPECIALIST')

const form = ref({ name: '', email: '', password: '' })
const rules = {
  name:     [{ required: true, min: 2, message: 'Min 2 characters', trigger: 'blur' }],
  email:    [{ required: true, type: 'email', message: 'Valid email required', trigger: 'blur' }],
  password: [{ required: true, min: 8, message: 'Min 8 characters', trigger: 'blur' }]
}

async function handleRegister() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await authApi.register({ ...form.value, role: isSpecialist.value ? 'SPECIALIST' : 'CLIENT' })
    ElMessage.success('Account created! Please sign in.')
    router.push('/login')
  } catch (err) {
    if (err.response?.status === 409)
      ElMessage.error('Email already registered.')
    else
      ElMessage.error(err.response?.data?.message || 'Registration failed.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.register-card { width: 100%; max-width: 420px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
.register-header { text-align: center; margin-bottom: 28px; }
.app-title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 8px; }
.app-subtitle { font-size: 14px; color: #888; }
.register-btn { width: 100%; }
.register-footer { text-align: center; margin-top: 12px; font-size: 14px; color: #666; }
.link { margin-left: 6px; color: #409eff; text-decoration: none; font-weight: 500; }
.link:hover { text-decoration: underline; }
</style>
