<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { AdminService } from '@/services/AdminService'
import type { Department, User } from '@/types'
import FindCollege from './findcollege/FindCollegeVue.vue'

const selectCollegeR = ref<{ department: Department }>()
const usersR = ref<User[]>([])
const unkownUsersR = ref<User[]>([])
watch(
  () => selectCollegeR.value?.department,
  async () => {
    const college = selectCollegeR.value?.department
    if (!college) return
    const result = await Promise.all([
      AdminService.getCollegeUsersService(college.id!),
      AdminService.getDingUsersService(college.dingDepid!)
    ])

    result[0].value.forEach((u) => {
      const dingUser = result[1].value.find((us) => us.name === u.name && us.mobile === u.mobile)
      u.dingUserId = dingUser?.userid
      u.dingUnionId = dingUser?.unionid
      usersR.value.push(u)
      if (!dingUser) {
        unkownUsersR.value.push(u)
      }
    })
  }
)

const addUserDingsF = async () => {
  const college = selectCollegeR.value?.department
  if (!college) return
  const users: User[] = []
  usersR.value.forEach((u) => {
    users.push({ account: u.account, dingUserId: u.dingUserId, dingUnionId: u.dingUnionId })
  })
  await AdminService.addCollegeUserDingsService(college.id!, users)
  createElNotificationSuccess('添加成功')
}

const exportExcelF = async () => {
  const { exportUserDingsExcel } = await import('@/services/excel/UsersExcel')
  exportUserDingsExcel(usersR.value)
}

const showExprotC = computed(() => selectCollegeR.value?.department?.id && usersR.value.length > 0)
</script>
<template>
  <el-row class="my-row">
    <el-col :span="6" class="my-col">
      <FindCollege ref="selectCollegeR" />
    </el-col>
    <el-col :span="6" class="my-col">
      <el-button type="success" @click="exportExcelF" v-if="showExprotC">导出钉钉表格</el-button>
    </el-col>
    <el-col :span="6" class="my-col">
      <el-button type="success" @click="addUserDingsF" v-if="showExprotC">导入钉钉信息</el-button>
    </el-col>
    <el-col class="my-col">
      <el-table :data="usersR" style="margin-bottom: 10px">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column>
          <template #default="scope">
            {{ scope.row.name }}
            <br />
            {{ scope.row.account }}
            <br />
            {{ scope.row.mobile }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            {{ scope.row.dingUnionId }}
            <br />
            {{ scope.row.dingUserId }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            {{ (scope.row as User).department?.departmentName }}
          </template>
        </el-table-column>
      </el-table>
    </el-col>
    <el-row>
      <span v-for="(unUser, index) of unkownUsersR" :key="index">{{ unUser.name }};</span>
    </el-row>
  </el-row>
</template>
