<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { InviDetail } from '@/types'

const exportF = async () => {
  const results = await Promise.all([
    CollegeService.listCollegeInviDetailsService(),
    CollegeService.listCollegeCountsService()
  ])
  const details: InviDetail[] = results[1]
  const { exportInvisDetails } = await import('@/services/excel/Invis2Excel')
  exportInvisDetails(results[0].value, details)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-button type="primary" @click="exportF">导出监考详细表格</el-button>
      表格第1页为监考详细信息，第2页为教师监考数据统计。
    </el-col>
  </el-row>
</template>
