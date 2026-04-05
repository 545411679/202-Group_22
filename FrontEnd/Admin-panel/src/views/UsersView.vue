<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
const tableData = ref<{ id: number; name: string; email: string; role: string }[]>([])
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h2 class="page-title">Users</h2>
      <el-button type="primary">Add user</el-button>
    </div>
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="role" label="Role" width="120" />
        <el-table-column label="Actions" width="160" fixed="right">
          <template #default>
            <el-button link type="primary" size="small">Edit</el-button>
            <el-button link type="danger" size="small">Disable</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!loading && tableData.length === 0"
        description="No data yet. Wire up GET /api/users."
      />
    </el-card>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
</style>
