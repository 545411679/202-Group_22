<template>
  <div class="landing-page">
    <header class="landing-header">
      <span class="brand">Consultation Booking</span>
      <div class="header-actions">
        <template v-if="authStore.isLoggedIn">
          <span class="user-name">{{ authStore.userName }}</span>
          <el-tag size="small" type="info">{{ roleLabel }}</el-tag>
          <el-button size="small" @click="goHome">My dashboard</el-button>
          <el-button size="small" @click="handleLogout">Sign out</el-button>
        </template>
        <template v-else>
          <router-link to="/login"><el-button>Sign in</el-button></router-link>
          <router-link to="/register"><el-button type="primary">Register</el-button></router-link>
        </template>
      </div>
    </header>

    <section class="hero">
      <h1>Find the right specialist for you.</h1>
      <div class="search-bar">
        <el-input
          v-model="query"
          placeholder="Search by name or specialty…"
          size="large"
          clearable
          style="flex:1"
          @keyup.enter="doSearch"
        />
        <el-button type="primary" size="large" @click="doSearch">Search</el-button>
      </div>
      <div class="cat-chips">
        <el-button
          v-for="cat in ['All', ...categories.map(c=>c.name)]"
          :key="cat"
          :type="selectedCat === cat ? 'primary' : ''"
          size="small"
          round
          @click="selectCat(cat)"
        >{{ cat }}</el-button>
      </div>
    </section>

    <section class="results-section">
      <div v-loading="loading" class="card-grid">
        <el-empty v-if="!loading && specialists.length === 0" description="No specialists found." />
        <el-card
          v-for="sp in specialists"
          :key="sp.specialistId"
          shadow="hover"
          class="spec-card"
        >
          <div class="spec-avatar"><el-avatar :size="56" :icon="UserFilled" /></div>
          <div class="spec-info">
            <div class="spec-name">{{ sp.name }}</div>
            <div class="spec-sub">{{ sp.specialty }}</div>
            <el-tag size="small" type="info">{{ sp.qualificationLevel }}</el-tag>
            <div class="spec-fee" v-if="sp.fee != null">¥{{ sp.fee }} / session</div>
          </div>
          <div class="spec-actions">
            <router-link :to="`/specialists/${sp.specialistId}`">
              <el-button size="small">See detail</el-button>
            </router-link>
            <el-button size="small" type="primary" @click="goBook(sp.specialistId)">Book now</el-button>
          </div>
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { specialistApi, categoryApi, authApi } from '../../api/index'
import { useAuthStore } from '../../stores/auth'
import { roleHome } from '../../router/index'

const router = useRouter()
const authStore = useAuthStore()
const roleLabel = computed(() => {
  return { CLIENT: 'Customer', SPECIALIST: 'Specialist', ADMIN: 'Admin' }[authStore.role] || ''
})
function goHome() { router.push(roleHome(authStore.role)) }
async function handleLogout() {
  try { await authApi.logout() } catch {}
  authStore.logout()
  ElMessage.success('Signed out.')
}

const query = ref('')
const selectedCat = ref('All')
const categories = ref([])
const specialists = ref([])
const loading = ref(false)

async function loadCategories() {
  try { categories.value = (await categoryApi.getAll()).data || [] } catch {}
}

async function doSearch() {
  loading.value = true
  try {
    const params = {}
    if (query.value) params.name = query.value
    if (selectedCat.value !== 'All') params.category = selectedCat.value
    specialists.value = (await specialistApi.search(params)).data || []
  } catch {
    specialists.value = []
  } finally {
    loading.value = false
  }
}

function selectCat(cat) {
  selectedCat.value = cat
  doSearch()
}

function goBook(specId) {
  const token = localStorage.getItem('token')
  if (!token) { router.push('/login'); return }
  router.push(`/customer/book/${specId}`)
}

onMounted(async () => {
  await loadCategories()
  doSearch()
})
</script>

<style scoped>
.landing-page { min-height: 100vh; background: #f5f7fa; display: flex; flex-direction: column; }
.landing-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; height: 56px; background: #fff; border-bottom: 1px solid #e4e7ed;
}
.brand { font-weight: 700; font-size: 16px; color: #303133; }
.user-name { font-size: 13px; color: #303133; font-weight: 500; }
.hero { padding: 48px 32px 24px; max-width: 800px; margin: 0 auto; width: 100%; }
.hero h1 { font-size: 28px; font-weight: 700; color: #303133; margin-bottom: 20px; }
.search-bar { display: flex; gap: 8px; margin-bottom: 16px; }
.cat-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.results-section { padding: 0 32px 40px; max-width: 1100px; margin: 0 auto; width: 100%; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.spec-card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 8px; }
.spec-avatar { margin-bottom: 10px; }
.spec-info { width: 100%; margin-bottom: 10px; }
.spec-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.spec-sub { font-size: 13px; color: #666; margin-bottom: 6px; }
.spec-fee { font-size: 14px; color: #409eff; font-weight: 500; margin-top: 6px; }
.spec-actions { display: flex; gap: 8px; }
</style>
