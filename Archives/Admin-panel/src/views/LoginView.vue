<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const form = ref({
  username: '',
  password: '',
})

function submit() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/dashboard')
  }, 400)
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-card" shadow="always">
      <h1 class="login-title">Admin sign in</h1>
      <p class="login-sub">
        Specialist consultation booking — placeholder page; replace with real authentication.
      </p>
      <el-form :model="form" label-position="top" @submit.prevent="submit">
        <el-form-item label="Username">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        <el-button
          type="primary"
          class="login-btn"
          :loading="loading"
          native-type="submit"
        >
          Sign in
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1d1e23 0%, #2c3e50 100%);
  padding: 24px;
  box-sizing: border-box;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-title {
  margin: 0 0 8px;
  font-size: 20px;
  text-align: center;
}

.login-sub {
  margin: 0 0 24px;
  font-size: 13px;
  color: #909399;
  text-align: center;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
