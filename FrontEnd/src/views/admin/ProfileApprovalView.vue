<template>
  <AdminLayout>
    <div class="page-title">Profile Approvals</div>

    <el-card class="section-card">
      <template #header>
        <div class="card-header-row">
          <span class="section-title">Pending specialist profiles</span>
          <el-button size="small" @click="load">Refresh</el-button>
        </div>
      </template>

      <div v-loading="loading">
        <el-empty v-if="!loading && profiles.length === 0" description="No pending profiles." :image-size="48" />
        <el-table v-else :data="pageData" stripe border>
          <el-table-column label="Name" min-width="130">
            <template #default="{ row }">{{ row.name }}</template>
          </el-table-column>
          <el-table-column label="Specialty" min-width="130">
            <template #default="{ row }">{{ row.specialty }}</template>
          </el-table-column>
          <el-table-column label="Level" width="120">
            <template #default="{ row }">{{ row.qualificationLevel || '—' }}</template>
          </el-table-column>
          <el-table-column label="Fee (¥)" width="90">
            <template #default="{ row }">{{ row.fee }}</template>
          </el-table-column>
          <el-table-column label="Bio" min-width="180">
            <template #default="{ row }">
              <span class="bio-cell">{{ row.bio }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="190">
            <template #default="{ row }">
              <el-button size="small" type="success" :loading="actionId === row.specialistId" @click="approve(row)">Approve</el-button>
              <el-button size="small" type="danger"  @click="openReject(row)">Reject</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-row" v-if="profiles.length > size">
          <el-pagination v-model:current-page="currentPage" :page-size="size" :total="profiles.length" layout="prev, pager, next" small />
        </div>
      </div>
    </el-card>

    <!-- Reject dialog -->
    <el-dialog v-model="showRejectDialog" title="Reject profile" width="420px">
      <el-form ref="rejectFormRef" :model="rejectForm" :rules="rejectRules" label-position="top">
        <el-form-item label="Reason for rejection" prop="reason">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="3" placeholder="Enter reason (shown to specialist)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRejectDialog = false">Cancel</el-button>
        <el-button type="danger" :loading="rejecting" @click="confirmReject">Reject</el-button>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AdminLayout from '../../components/AdminLayout.vue'
import { adminApi } from '../../api/index'
import { usePagination } from '../../composables/usePagination'

const { currentPage, size, paginate } = usePagination(10)
const loading = ref(true)
const profiles = ref([])
const actionId = ref(null)
const showRejectDialog = ref(false)
const rejecting = ref(false)
const rejectFormRef = ref(null)
const rejectForm = ref({ reason: '' })
const rejectTarget = ref(null)
const rejectRules = {
  reason: [{ required: true, message: 'Please enter a reason', trigger: 'blur' }]
}

const pageData = computed(() => paginate(profiles.value))

async function load() {
  loading.value = true
  try { profiles.value = (await adminApi.getPendingProfiles()).data || [] }
  catch { profiles.value = [] }
  finally { loading.value = false }
}

async function approve(row) {
  actionId.value = row.specialistId
  try {
    await adminApi.reviewProfile(row.specialistId, { action: 'APPROVE' })
    ElMessage.success('Profile approved.')
    load()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Approve failed.')
  } finally {
    actionId.value = null
  }
}

function openReject(row) {
  rejectTarget.value = row
  rejectForm.value.reason = ''
  showRejectDialog.value = true
}

async function confirmReject() {
  const valid = await rejectFormRef.value.validate().catch(() => false)
  if (!valid) return
  rejecting.value = true
  try {
    await adminApi.reviewProfile(rejectTarget.value.specialistId, { action: 'REJECT', reason: rejectForm.value.reason })
    ElMessage.success('Profile rejected.')
    showRejectDialog.value = false
    load()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Reject failed.')
  } finally {
    rejecting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.section-card { margin-bottom: 12px; }
.card-header-row { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-weight: 600; font-size: 14px; }
.pagination-row { display: flex; justify-content: center; margin-top: 14px; }
.bio-cell { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 12px; color: #606266; }
</style>
