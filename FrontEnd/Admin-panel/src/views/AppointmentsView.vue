<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
const tableData = ref<
  {
    id: number
    patient: string
    specialist: string
    time: string
    status: string
  }[]
>([])
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h2 class="page-title">Appointments</h2>
      <div class="filters">
        <el-select placeholder="Status" clearable style="width: 120px">
          <el-option label="Pending" value="pending" />
          <el-option label="Confirmed" value="confirmed" />
          <el-option label="Cancelled" value="cancelled" />
        </el-select>
        <el-button type="primary">Search</el-button>
      </div>
    </div>
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="Booking ID" width="100" />
        <el-table-column prop="patient" label="Patient" />
        <el-table-column prop="specialist" label="Specialist" />
        <el-table-column prop="time" label="Slot" width="180" />
        <el-table-column prop="status" label="Status" width="100" />
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default>
            <el-button link type="primary" size="small">Details</el-button>
            <el-button link type="success" size="small">Confirm</el-button>
            <el-button link type="danger" size="small">Cancel</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!loading && tableData.length === 0"
        description="No appointments yet. Connect the appointments list API."
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
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
