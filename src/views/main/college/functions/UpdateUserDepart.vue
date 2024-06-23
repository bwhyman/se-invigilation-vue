<script setup lang="ts">
import type { Department, User, UserDepartment } from '@/types'
import DepartmentUser from './finduser/DepartmentUser.vue'
import { listDepartmentsService, updateUserDepartmentService } from '@/services/CollegeService'
import { createElNotificationSuccess } from '@/components/message'
import { getSelfUserService } from '@/services/CommonService'
const exposeR = ref<{ selectUser: User; clear: Function }>()

const departmentR = ref<Department>()
const departmentsR = ref<Department[]>([])

watch(exposeR, async () => {
  departmentsR.value = await listDepartmentsService()
})

//
const updateF = async () => {
  const userS = getSelfUserService()
  const depart = departmentsR.value.find((d) => d.id == departmentR.value?.id)
  if (!depart) {
    throw '选择部门错误'
  }
  const dep: UserDepartment = {
    collId: userS.department?.collId,
    collegeName: userS.department?.collegeName,
    depId: depart.id,
    departmentName: depart.name
  }
  const user: User = { id: exposeR.value?.selectUser.id, department: dep }
  await updateUserDepartmentService(user)
  createElNotificationSuccess('部门更新成功')
  exposeR.value?.clear()
  exposeR.value!.selectUser! = {}
}
</script>
<template>
  <el-row class="my-row" style="align-items: flex-end">
    <el-col :span="12">
      <DepartmentUser ref="exposeR" />
    </el-col>
    <el-col :span="12" v-if="exposeR?.selectUser.id">
      新部门
      <el-select
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
      <el-button type="success" :disabled="!departmentR" @click="updateF">提交</el-button>
    </el-col>
  </el-row>
</template>
