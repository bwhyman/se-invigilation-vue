<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { Department, User } from '@/types'

const departmentR = ref<Department>()

const { data: departmentsR, suspense } = CollegeService.listDepartmentsService()
await suspense()

const { data: depUsersR, suspense: suspListDeparts } = CollegeService.listDepartmentUsersService(
  toRef(() => departmentR.value?.id),
  toRef(() => !!departmentR.value?.id)
)

const departmentChangeF = async () => {
  await suspListDeparts()
}
// 使用交叉类型添加属性，实现多次选项相同用户，仍能发出update通知，且不影响调用类型
const selectedUserM = defineModel<User & { _ts?: number }>('selecteduser', { default: undefined })
const userChangeF = (user: User) => {
  selectedUserM.value = { ...user, _ts: Date.now() }
}
</script>
<template>
  <div>
    <p style="margin-bottom: 10px">选择教师部门及教师。</p>
    <el-select
      @change="departmentChangeF"
      value-key="id"
      v-model="departmentR"
      placeholder="部门"
      size="large"
      style="width: 200px; margin-right: 10px">
      <el-option
        v-for="(depart, index) of departmentsR"
        :key="index"
        :label="depart.name"
        :value="depart" />
    </el-select>
    <el-select
      @change="userChangeF"
      value-key="id"
      size="large"
      v-if="departmentR?.id"
      style="width: 200px">
      <el-option v-for="(user, index) of depUsersR" :key="index" :label="user.name" :value="user" />
    </el-select>
  </div>
</template>
