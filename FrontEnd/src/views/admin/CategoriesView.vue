<template>
  <AdminLayout>
    <div class="page-title">Categories</div>

    <el-card class="section-card">
      <template #header>
        <div class="card-header-row">
          <span class="section-title">Specialty categories</span>
          <el-button type="primary" size="small" @click="openAdd">+ Add category</el-button>
        </div>
      </template>

      <div v-loading="loading">
        <el-empty v-if="!loading && categories.length === 0" description="No categories." :image-size="48" />
        <el-table v-else :data="categories" stripe border>
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="name" label="Name" min-width="200" />
          <el-table-column label="Actions" width="160">
            <template #default="{ row }">
              <el-button size="small" @click="openEdit(row)">Edit</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- Add dialog -->
    <el-dialog v-model="showAdd" title="Add category" width="380px">
      <el-form ref="addFormRef" :model="addForm" :rules="formRules" label-position="top">
        <el-form-item label="Category name" prop="name">
          <el-input v-model="addForm.name" placeholder="e.g. Legal Advice" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleAdd">Add</el-button>
      </template>
    </el-dialog>

    <!-- Edit dialog -->
    <el-dialog v-model="showEdit" title="Edit category" width="380px">
      <el-form ref="editFormRef" :model="editForm" :rules="formRules" label-position="top">
        <el-form-item label="Category name" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleEdit">Save</el-button>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminLayout from '../../components/AdminLayout.vue'
import { adminApi } from '../../api/index'

const loading = ref(true)
const submitting = ref(false)
const categories = ref([])

const showAdd = ref(false)
const addFormRef = ref(null)
const addForm = ref({ name: '' })

const showEdit = ref(false)
const editFormRef = ref(null)
const editForm = ref({ id: null, name: '' })

const formRules = {
  name: [
    { required: true, message: 'Required', trigger: 'blur' },
    { min: 2, message: 'At least 2 characters', trigger: 'blur' }
  ]
}

async function load() {
  loading.value = true
  try { categories.value = (await adminApi.getCategories()).data || [] }
  catch { categories.value = [] }
  finally { loading.value = false }
}

function openAdd() {
  addForm.value = { name: '' }
  showAdd.value = true
  addFormRef.value?.resetFields()
}

function openEdit(row) {
  editForm.value = { id: row.id, name: row.name }
  showEdit.value = true
  editFormRef.value?.resetFields()
}

async function handleAdd() {
  const valid = await addFormRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await adminApi.createCategory({ name: addForm.value.name })
    ElMessage.success('Category added.')
    showAdd.value = false
    load()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed.')
  } finally {
    submitting.value = false
  }
}

async function handleEdit() {
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await adminApi.updateCategory(editForm.value.id, { name: editForm.value.name })
    ElMessage.success('Category updated.')
    showEdit.value = false
    load()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Failed.')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `Delete "${row.name}"? Cannot delete if specialists are using this category.`,
      'Confirm delete', { type: 'warning' }
    )
    await adminApi.deleteCategory(row.id)
    ElMessage.success('Category deleted.')
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
</style>
