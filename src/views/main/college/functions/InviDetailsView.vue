<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { InviDetail } from '@/types'

const enabledR = ref(false)
const { data: collInviAllR, suspense: s1 } = CollegeService.listCollegeInviDetailsService(enabledR)
const { data: collUsersCountsR, suspense: s2 } = CollegeService.listCollegeCountsService(enabledR)
const exportF = async () => {
  enabledR.value = true
  await Promise.all([s1(), s2()])
  //
  const details: InviDetail[] = collUsersCountsR.value!
  const { exportInvisDetails } = await import('@/services/excel/Invis2Excel')
  exportInvisDetails(collInviAllR.value!, details)
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
