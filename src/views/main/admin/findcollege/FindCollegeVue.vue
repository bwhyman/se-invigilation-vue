<script setup lang="ts">
import { AdminService } from '@/services/AdminService'
import type { Department } from '@/types'

const selectCollegeR = ref<Department>()
defineExpose({ department: selectCollegeR })
const collegeR = await AdminService.listCollegesService()
</script>
<template>
  <el-select
    v-model="selectCollegeR"
    value-key="id"
    placeholder="学院"
    size="large"
    style="width: 200px; margin-right: 10px">
    <el-option v-for="(coll, index) of collegeR" :key="index" :label="coll.name" :value="coll" />
  </el-select>
</template>
