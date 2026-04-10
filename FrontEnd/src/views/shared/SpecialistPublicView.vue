<template>
  <div class="public-profile-page">
    <div class="page-wrap">
      <el-button text @click="$router.back()">← Back to search</el-button>

      <div v-loading="loading" class="profile-content">
        <template v-if="profile">
          <div class="profile-header">
            <el-avatar :size="72" :icon="UserFilled" />
            <div>
              <h2>{{ profile.name }}</h2>
              <div class="sub">{{ profile.specialty }} · {{ profile.qualificationLevel }}</div>
              <div class="fee">¥{{ profile.fee }} / session</div>
            </div>
          </div>

          <el-divider />

          <h3>Biography</h3>
          <p class="bio">{{ profile.bio || 'Not provided.' }}</p>

          <el-divider />

          <h3>Available slots</h3>
          <el-table :data="schedule" stripe border empty-text="No available slots">
            <el-table-column prop="slotDate" label="Date" width="120" />
            <el-table-column label="Time" width="130">
              <template #default="{ row }">{{ row.startTime?.slice(0,5) }} – {{ row.endTime?.slice(0,5) }}</template>
            </el-table-column>
            <el-table-column label="Status" width="110">
              <template #default="{ row }">
                <el-tag :type="row.status === 'AVAILABLE' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'AVAILABLE'"
                  size="small" type="primary"
                  @click="goBook"
                >Book this slot</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="book-btn-row">
            <el-button type="primary" size="large" @click="goBook">Book a session</el-button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { specialistApi } from '../../api/index'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const profile = ref(null)
const schedule = ref([])
const specId = route.params.id

async function load() {
  try {
    const [pRes, sRes] = await Promise.all([
      specialistApi.getPublicProfile(specId),
      specialistApi.getSchedule(specId)
    ])
    profile.value = pRes.data
    schedule.value = (sRes.data?.slots || []).filter(s => s.status === 'AVAILABLE')
  } catch {
    ElMessage.error('Failed to load specialist profile.')
  } finally {
    loading.value = false
  }
}

function goBook() {
  const token = localStorage.getItem('token')
  if (!token) { router.push('/login'); return }
  router.push(`/customer/book/${specId}`)
}

onMounted(load)
</script>

<style scoped>
.public-profile-page { min-height: 100vh; background: #f5f7fa; padding: 24px; }
.page-wrap { max-width: 800px; margin: 0 auto; }
.profile-content { margin-top: 16px; background: #fff; border-radius: 8px; padding: 28px; }
.profile-header { display: flex; gap: 20px; align-items: center; margin-bottom: 8px; }
.profile-header h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.sub { color: #666; font-size: 14px; margin-bottom: 4px; }
.fee { color: #409eff; font-weight: 600; font-size: 15px; }
h3 { font-size: 15px; font-weight: 600; margin-bottom: 10px; }
.bio { color: #555; line-height: 1.7; }
.book-btn-row { margin-top: 24px; text-align: right; }
</style>
