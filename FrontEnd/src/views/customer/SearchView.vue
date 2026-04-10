<template>
  <AppLayout>
    <template #nav>
      <router-link to="/customer/dashboard"><el-button text>Dashboard</el-button></router-link>
      <router-link to="/customer/search"><el-button text type="primary">Find Specialists</el-button></router-link>
    </template>

    <div class="page-title">Find a Specialist</div>

    <el-card class="filter-card">
      <el-row :gutter="12" align="middle">
        <el-col :span="8">
          <div class="filter-label">Name <span class="hint">(partial match)</span></div>
          <el-input v-model="params.name" placeholder='e.g. "Clara" or "skin"' clearable />
        </el-col>
        <el-col :span="6">
          <div class="filter-label">Category <span class="hint">(exact)</span></div>
          <el-select v-model="params.category" placeholder="Select" clearable style="width:100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.name" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <div class="filter-label">Level <span class="hint">(exact)</span></div>
          <el-select v-model="params.level" placeholder="Select" clearable style="width:100%">
            <el-option label="Junior" value="JUNIOR" />
            <el-option label="Mid" value="MID" />
            <el-option label="Senior" value="SENIOR" />
            <el-option label="Expert" value="EXPERT" />
          </el-select>
        </el-col>
        <el-col :span="5" style="padding-top:20px;display:flex;gap:8px">
          <el-button @click="clearFilters">Clear</el-button>
          <el-button type="primary" :loading="searching" @click="handleSearch">Search</el-button>
        </el-col>
      </el-row>
      <div v-if="emptySubmit" class="empty-warn">
        ✕ Enter a name or select a filter before searching.
      </div>
    </el-card>

    <div v-if="searched" v-loading="searching" class="results-area">
      <div class="results-count" v-if="!searching">{{ specialists.length }} result{{ specialists.length !== 1 ? 's' : '' }}</div>
      <el-empty v-if="!searching && specialists.length === 0" description="No specialists found.">
        <el-button @click="clearFilters">Clear filters</el-button>
      </el-empty>
      <div v-else class="card-grid">
        <el-card
          v-for="sp in pageData"
          :key="sp.specialistId"
          shadow="hover"
          class="spec-card"
        >
          <div class="spec-top">
            <el-avatar :size="48" :icon="UserFilled" />
            <div class="spec-info">
              <div class="spec-name">{{ sp.name }}</div>
              <div class="spec-sub">{{ sp.specialty }}</div>
              <el-tag size="small" type="info">{{ sp.qualificationLevel }}</el-tag>
            </div>
          </div>
          <div class="spec-fee" v-if="sp.fee != null">¥{{ sp.fee }} / session</div>
          <div class="spec-actions">
            <router-link :to="`/specialists/${sp.specialistId}`">
              <el-button size="small">See detail</el-button>
            </router-link>
            <router-link :to="`/customer/book/${sp.specialistId}`">
              <el-button size="small" type="primary">Book →</el-button>
            </router-link>
          </div>
        </el-card>
      </div>

      <div class="pagination-row" v-if="specialists.length > size">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="size"
          :total="specialists.length"
          layout="prev, pager, next"
          small
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { UserFilled } from '@element-plus/icons-vue'
import AppLayout from '../../components/AppLayout.vue'
import { specialistApi, categoryApi } from '../../api/index'
import { usePagination } from '../../composables/usePagination'

const route = useRoute()
const { currentPage, size, paginate, reset } = usePagination(9)

const categories = ref([])
const specialists = ref([])
const searching = ref(false)
const searched = ref(false)
const emptySubmit = ref(false)

const params = ref({ name: '', category: '', level: '' })
const pageData = computed(() => paginate(specialists.value))

async function handleSearch() {
  emptySubmit.value = false
  if (!params.value.name && !params.value.category && !params.value.level) {
    emptySubmit.value = true
    return
  }
  searching.value = true
  searched.value = true
  reset()
  try {
    const q = {}
    if (params.value.name)     q.name     = params.value.name
    if (params.value.category) q.category = params.value.category
    if (params.value.level)    q.level    = params.value.level
    specialists.value = (await specialistApi.search(q)).data || []
  } catch {
    specialists.value = []
  } finally {
    searching.value = false
  }
}

function clearFilters() {
  params.value = { name: '', category: '', level: '' }
  specialists.value = []
  searched.value = false
  emptySubmit.value = false
  reset()
}

onMounted(async () => {
  try { categories.value = (await categoryApi.getAll()).data || [] } catch {}
  if (route.query.name) {
    params.value.name = route.query.name
    handleSearch()
  }
})
</script>

<style scoped>
.page-title { font-size: 20px; font-weight: 700; color: #303133; margin-bottom: 16px; }
.filter-card { margin-bottom: 20px; }
.filter-label { font-size: 12px; color: #606266; margin-bottom: 6px; }
.hint { color: #999; font-size: 11px; }
.empty-warn { margin-top: 10px; color: #e6a23c; font-size: 13px; }
.results-area { margin-top: 4px; }
.results-count { font-size: 13px; color: #606266; margin-bottom: 12px; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.spec-card { padding: 4px; }
.spec-top { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 8px; }
.spec-info { flex: 1; }
.spec-name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.spec-sub { font-size: 12px; color: #666; margin-bottom: 4px; }
.spec-fee { font-size: 13px; color: #409eff; font-weight: 500; margin-bottom: 10px; }
.spec-actions { display: flex; gap: 8px; }
.pagination-row { display: flex; justify-content: center; margin-top: 20px; }
</style>
