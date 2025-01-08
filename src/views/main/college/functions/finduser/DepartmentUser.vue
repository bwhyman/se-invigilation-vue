<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { Department, User } from '@/types'

const departmentR = ref<Department>()
const userR = ref<User>()
const usersR = ref<User[]>([])

defineExpose({
  selectUser: userR,
  clearUser: () => (userR.value = undefined),
  init: () => {
    departmentR.value = undefined
    usersR.value = []
    userR.value = undefined
  }
})

const departmentsR = await CollegeService.listDepartmentsService()

const departmentChangeF = async () => {
  userR.value = undefined
  usersR.value = await CollegeService.listDepartmentUsersService(departmentR.value?.id!)
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
      value-key="id"
      v-model="userR"
      size="large"
      v-if="departmentR?.id"
      style="width: 200px">
      <el-option v-for="(user, index) of usersR" :key="index" :label="user.name" :value="user" />
    </el-select>
  </div>
</template>
