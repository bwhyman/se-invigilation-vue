<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import {
  listDepartmentsService,
  updateDepartmentInviStatusService
} from '@/services/CollegeService'
import type { Department } from '@/types'

let departments = await listDepartmentsService()

const departmentR = ref(departments)

// 更新专业监考下发显示
const btnR = ref(true)
const activeC = computed(() => (status: number) => status == 1)

const changeStatus = (depart: Department) => {
  btnR.value = false
  depart.inviStatus = depart.inviStatus == 1 ? 0 : 1
}

const updateUserInviStatus = async () => {
  const deps: Department[] = []
  departmentR.value.forEach((e) => {
    deps.push({ id: e.id, inviStatus: e.inviStatus })
  })

  const departs = await updateDepartmentInviStatusService(deps)
  departmentR.value = departs
  createMessageDialog('更新成功')
}
</script>
<template>
  <el-row class="my-row">
    <el-col style="margin-bottom: 5px" :span="22">
      <p>监考分配显示</p>
    </el-col>
    <el-col :span="2">
      <el-button type="success" @click="updateUserInviStatus" :disabled="btnR">提交</el-button>
    </el-col>
    <el-col style="margin-bottom: 5px">
      <template v-for="(depart, index) of departmentR" :key="index">
        <el-switch
          inline-prompt
          size="large"
          :inactive-text="depart.name"
          :active-text="depart.name"
          :model-value="activeC(depart.inviStatus!)"
          @change="changeStatus(depart)"
          style="margin-right: 5px" />
      </template>
    </el-col>
  </el-row>
</template>
