<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import { useUserStore } from '@/stores/UserStore'
import type { Department } from '@/types'

const departmentsR = await CollegeService.listDepartmentsService()
const depNameR = ref<string>('')

const addDepartmentF = async () => {
  if (!depNameR.value) return
  if (departmentsR.value.some((d) => d.name === depNameR.value)) {
    throw `${depNameR.value}, 专业已存在！`
  }
  const collName = useUserStore().userS.value?.department?.collegeName
  const collId = useUserStore().userS.value?.department?.collId
  const dep: Department = {
    name: depNameR.value,
    inviStatus: 1,
    college: { collId: collId!, collegeName: collName! }
  }
  await CollegeService.addDepartmentService(dep)
  depNameR.value = ''
  createElNotificationSuccess('部门添加成功')
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="depNameR" placeholder="专业名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" :disabled="!depNameR" @click="addDepartmentF">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
