<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { Department } from '@/types'

const departmentsR = await CollegeService.listDepartmentsService()
const departmentR = ref<Department>()

const removeF = async () => {
  if (!departmentR.value || !departmentR.value.id) throw '部门为空，请选择部门'
  const depid = departmentR.value.id
  departmentR.value = undefined
  await CollegeService.removeDepartmentService(depid)
  createElNotificationSuccess('部门移除成功')
}
</script>
<template>
  <el-row class="my-row">
    <el-col style="margin-bottom: 10px">
      所有用户必须置于部门管理下，因此无法移除用户不为空的部门。请将部门下用户更新到其他部门再移除。
    </el-col>
    <el-col :span="6">
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
    </el-col>
    <el-col :span="4" v-if="departmentR">
      <el-button type="danger" @click="removeF" :disabled="!departmentR">
        移除部门： {{ departmentR?.name }}
      </el-button>
    </el-col>
  </el-row>
</template>
