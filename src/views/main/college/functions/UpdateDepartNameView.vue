<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { Department, UserDepartment } from '@/types'

const departmentsR = await CollegeService.listDepartmentsService()
const departR = ref<Department>()
const depNameR = ref<string>()
const selectDepartF = () => {
  depNameR.value = departR.value?.name
}
const updateDepartNameF = async () => {
  const depart: UserDepartment = { depId: departR.value?.id, departmentName: depNameR.value }
  console.log(depart)
  await CollegeService.updateDepartmentNameService(depart)
  departR.value = undefined
  createElNotificationSuccess('部门名称更新成功')
}
</script>
<template>
  <el-row class="my-row">
    <el-col style="margin-bottom: 10px">更新部门名称。</el-col>
    <el-col :span="6">
      <el-select
        @change="selectDepartF"
        value-key="id"
        v-model="departR"
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
    <el-col :span="12" v-if="departR?.id">
      <el-input style="width: 240px; margin-right: 10px" v-model="depNameR" />
      <el-button type="success" @click="updateDepartNameF" :disabled="!depNameR">提交</el-button>
    </el-col>
  </el-row>
</template>
