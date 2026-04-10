<template>
  <AppLayout>
    <div class="specialists-view">
      <div class="page-header">
        <h2>Pending Specialist Approvals</h2>
        <el-button :icon="Refresh" @click="loadPending">Refresh</el-button>
      </div>

      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="pendingSpecialists"
          stripe
          border
          style="width: 100%"
          empty-text="No pending specialist applications"
        >
          <el-table-column prop="id" label="Profile ID" width="100" />
          <el-table-column label="Name" min-width="150">
            <template #default="{ row }">{{ row.name || '—' }}</template>
          </el-table-column>
          <el-table-column label="Specialty" min-width="150">
            <template #default="{ row }">{{ row.specialty || row.categoryName || '—' }}</template>
          </el-table-column>
          <el-table-column label="Level" width="100">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.level || '—' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Bio" min-width="200">
            <template #default="{ row }">
              <span class="bio-truncated">{{ truncate(row.bio, 80) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Fee" width="90">
            <template #default="{ row }">
              {{ row.fee != null ? `¥${row.fee}` : '—' }}
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                type="success"
                size="small"
                :loading="actionId === row.id + '_approve'"
                @click="handleApprove(row)"
              >
                Approve
              </el-button>
              <el-button
                type="danger"
                size="small"
                :loading="actionId === row.id + '_reject'"
                @click="openRejectDialog(row)"
              >
                Reject
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Reject reason dialog -->
      <el-dialog v-model="rejectDialogVisible" title="Reject Specialist Application" width="440px">
        <p class="reject-desc">
          Please provide a reason for rejecting
          <strong>{{ rejectTarget?.name }}</strong>'s application.
        </p>
        <el-form ref="rejectFormRef" :model="rejectForm" :rules="rejectRules" label-position="top">
          <el-form-item label="Rejection Reason" prop="reason">
            <el-input
              v-model="rejectForm.reason"
              type="textarea"
              :rows="3"
              placeholder="e.g. Insufficient qualification details provided..."
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="rejectDialogVisible = false">Cancel</el-button>
          <el-button type="danger" :loading="rejecting" @click="handleReject">
            Confirm Rejection
          </el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import AppLayout from '../../components/AppLayout.vue'
import { adminApi } from '../../api/index'

const loading = ref(false)
const pendingSpecialists = ref([])
const actionId = ref('')

const rejectDialogVisible = ref(false)
const rejecting = ref(false)
const rejectTarget = ref(null)
const rejectFormRef = ref(null)
const rejectForm = ref({ reason: '' })
const rejectRules = {
  reason: [{ required: true, message: 'Please provide a rejection reason', trigger: 'blur' }]
}

function truncate(text, max) {
  if (!text) return '—'
  return text.length > max ? text.slice(0, max) + '...' : text
}

async function loadPending() {
  loading.value = true
  try {
    const res = await adminApi.getPendingSpecialists()
    pendingSpecialists.value = res.data || []
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to load pending specialists')
  } finally {
    loading.value = false
  }
}

async function handleApprove(row) {
  actionId.value = row.id + '_approve'
  try {
    await adminApi.reviewSpecialist(row.id, { decision: 'APPROVE', reason: '' })
    ElMessage.success(`${row.name}'s application has been approved`)
    await loadPending()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to approve specialist')
  } finally {
    actionId.value = ''
  }
}

function openRejectDialog(row) {
  rejectTarget.value = row
  rejectForm.value = { reason: '' }
  rejectDialogVisible.value = true
  if (rejectFormRef.value) rejectFormRef.value.resetFields()
}

async function handleReject() {
  const valid = await rejectFormRef.value.validate().catch(() => false)
  if (!valid) return

  rejecting.value = true
  actionId.value = rejectTarget.value.id + '_reject'
  try {
    await adminApi.reviewSpecialist(rejectTarget.value.id, {
      decision: 'REJECT',
      reason: rejectForm.value.reason
    })
    ElMessage.success(`${rejectTarget.value.name}'s application has been rejected`)
    rejectDialogVisible.value = false
    await loadPending()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed to reject specialist')
  } finally {
    rejecting.value = false
    actionId.value = ''
  }
}

onMounted(() => {
  loadPending()
})
</script>

<style scoped>
.specialists-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.bio-truncated {
  font-size: 13px;
  color: #666;
}

.reject-desc {
  margin-bottom: 16px;
  color: #555;
}
</style>
