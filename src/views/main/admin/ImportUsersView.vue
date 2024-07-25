<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { AdminService } from '@/services/AdminService'
import type { Department, User } from '@/types'
import FindCollege from './findcollege/FindCollegeVue.vue'

const selectCollegeR = ref<{ department: Department }>()
const allUsersR = ref<User[]>([])

const readUserFile2 = async (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }
  const { readUsersExcel } = await import('@/services/excel/UsersExcel')
  const eus = await readUsersExcel(element.files[0])
  console.log(eus)
  allUsersR.value = eus
}

const addUsersF = async () => {
  const depart = selectCollegeR.value?.department
  if (!depart) return

  await AdminService.addUsersService({
    collId: depart.id!,
    collegeName: depart.name!,
    users: allUsersR.value
  })
  createElNotificationSuccess('添加用户成功')
}
</script>
<template>
  <el-row class="my-row">
    <el-col :span="6">
      <FindCollege ref="selectCollegeR" />
    </el-col>
    <el-col :span="6">
      <input type="file" @change="readUserFile2" />
    </el-col>
    <el-col :span="6">
      <el-button type="success" :disabled="allUsersR.length == 0" @click="addUsersF">
        提交
      </el-button>
    </el-col>

    <el-col v-if="allUsersR.length > 0">
      <el-table :data="allUsersR" style="margin-bottom: 10px">
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
        <el-table-column prop="department" />
        <el-table-column prop="role" />
      </el-table>
    </el-col>
  </el-row>
</template>
