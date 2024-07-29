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
//
const removeF = async () => {
  if (!departR.value || !departR.value.id) throw '部门为空，请选择部门'
  const depid = departR.value.id
  departR.value = undefined
  await CollegeService.removeDepartmentService(depid)
  createElNotificationSuccess('部门移除成功')
}
</script>
<template>
  <el-row class="my-row">
    <el-col>更新部门名称。</el-col>
    <el-col>
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
    <template v-if="departR?.id">
      <el-col :span="12">
        <el-input style="width: 240px; margin-right: 10px" v-model="depNameR" />
        <el-button type="success" @click="updateDepartNameF" :disabled="!depNameR">提交</el-button>
      </el-col>
      <el-col>
        <el-tag type="danger" size="large">
          所有用户必须置于部门管理下，因此无法移除用户不为空的部门。请将部门下用户更新到其他部门再移除。
        </el-tag>
      </el-col>
      <el-col v-if="departR?.id">
        <el-button type="danger" @click="removeF" :disabled="!departR">
          移除部门： {{ departR?.name }}
        </el-button>
      </el-col>
    </template>
  </el-row>
</template>
