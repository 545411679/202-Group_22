<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  siteName: 'Specialist Consultation Booking',
  contactEmail: '',
})
</script>

<template>
  <div class="page">
    <h2 class="page-title">Settings</h2>
    <el-card shadow="never" style="max-width: 560px">
      <el-form label-width="120px">
        <el-form-item label="Site name">
          <el-input v-model="form.siteName" placeholder="Display name" />
        </el-form-item>
        <el-form-item label="Contact email">
          <el-input v-model="form.contactEmail" placeholder="Optional" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">Save</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}
</style>
