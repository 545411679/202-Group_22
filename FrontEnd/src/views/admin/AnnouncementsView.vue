<template>
  <AdminLayout>
    <div class="page-title">Announcements</div>

    <el-card class="section-card">
      <template #header>
        <div class="card-header-row">
          <span class="section-title">All announcements</span>
          <el-button type="primary" size="small" @click="openAdd">+ New announcement</el-button>
        </div>
      </template>

      <div v-loading="loading">
        <el-empty v-if="!loading && announcements.length === 0" description="No announcements." :image-size="48" />
        <el-table v-else :data="pageData" stripe border>
          <el-table-column label="Title" min-width="180">
            <template #default="{ row }">{{ row.title }}</template>
          </el-table-column>
          <el-table-column label="Body" min-width="240">
            <template #default="{ row }">
              <span class="body-cell">{{ row.body }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Created" width="120">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="Actions" width="150">
            <template #default="{ row }">
              <el-button size="small" @click="openEdit(row)">Edit</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">Del</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-row" v-if="announcements.length > size">
          <el-pagination v-model:current-page="currentPage" :page-size="size" :total="announcements.length" layout="prev, pager, next" small />
        </div>
      </div>
    </el-card>

    <!-- Add / Edit dialog -->
    <el-dialog v-model="showDialog" :title="editMode ? 'Edit announcement' : 'New announcement'" width="480px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-position="top">
        <el-form-item label="Title" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="Body" prop="body">
          <el-input v-model="form.body" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ editMode ? 'Save' : 'Publish' }}</el-button>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminLayout from '../../components/AdminLayout.vue'
import { adminApi } from '../../api/index'
import { usePagination } from '../../composables/usePagination'

const { currentPage, size, paginate } = usePagination(10)
const loading = ref(true)
const submitting = ref(false)
const announcements = ref([])
const showDialog = ref(false)
const editMode = ref(false)
const editId = ref(null)
const formRef = ref(null)
const form = ref({ title: '', body: '' })
const formRules = {
  title: [{ required: true, message: 'Required', trigger: 'blur' }],
  body:  [{ required: true, message: 'Required', trigger: 'blur' }]
}

const pageData = computed(() => paginate(announcements.value))

function formatDate(dt) { return dt ? String(dt).slice(0, 10) : '—' }

async function load() {
  loading.value = true
  try { announcements.value = (await adminApi.getAnnouncements()).data || [] }
  catch { announcements.value = [] }
  finally { loading.value = false }
}

function openAdd() {
  editMode.value = false
  editId.value = null
  form.value = { title: '', body: '' }
  showDialog.value = true
  formRef.value?.resetFields()
}

function openEdit(row) {
  editMode.value = true
  editId.value = row.announcementId ?? row.id
  form.value = { title: row.title, body: row.body || '' }
  showDialog.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editMode.value) {
      await adminApi.updateAnnouncement(editId.value, form.value)
      ElMessage.success('Announcement updated.')
    } else {
      await adminApi.createAnnouncement(form.value)
      ElMessage.success('Announcement published.')
    }
    showDialog.value = false
    load()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed.')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row) {
  const id = row.announcementId ?? row.id
  try {
    await ElMessageBox.confirm(`Delete announcement "${row.title}"?`, 'Confirm', { type: 'warning' })
    await adminApi.deleteAnnouncement(id)
    ElMessage.success('Deleted.')
    load()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error(err.response?.data?.message || 'Failed.')
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
.body-cell { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 12px; color: #606266; }
</style>
