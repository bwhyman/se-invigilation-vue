<script setup lang="ts">
import {
  listCollegeUsersService,
  listCollegeInviDetailsService,
  listCollegeCountsService
} from '@/services/CollegeService'
import type { InviDetail } from '@/types'

const exportF = async () => {
  const results = await Promise.all([
    listCollegeUsersService(),
    listCollegeInviDetailsService(),
    listCollegeCountsService()
  ])

  const users = results[0]
  const counts = results[2]

  const details: InviDetail[] = []

  users.forEach((user) => {
    const userCount = counts.find((c) => c.userId == user.id)
    const detail: InviDetail = {
      name: user.name,
      departmentName: user.department?.departmentName,
      account: user.account
    }
    detail.count = userCount?.count ?? 0

    details.push(detail)
  })
  const { exportInvisDetails } = await import('@/services/ExcelUtils')
  exportInvisDetails(results[1], details)
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
