<script setup lang="ts">
import { createElLoading } from '@/components/loading'
import { listCollegeInviDetailsService, listCollegeCountsService } from '@/services/CollegeService'
import type { InviDetail } from '@/types'

const exportF = async () => {
  const loading = createElLoading()
  try {
    const results = await Promise.all([listCollegeInviDetailsService(), listCollegeCountsService()])
    const details: InviDetail[] = results[1]
    const { exportInvisDetails } = await import('@/services/excel/Invis2Excel')
    exportInvisDetails(results[0], details)
  } finally {
    loading.close()
  }
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
